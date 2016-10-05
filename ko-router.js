( function ( ctx ) {
    "use strict";

    var router = ctx.router = {
        route: ctx.ko.observableArray(),
        guard: function guard( rt ) {
            router.loader.start();
            console.log( 'GUARD', rt );
            var all = [];
            var node = router.guard.tree;

            do {
                var id = rt.shift();

                all.push( Promise.all( ( node._deeds || [] ).map( function ( deed ) {
                    return deed( id );
                } ) ) );

                node = node[ id ];
            } while ( node && rt.length );

            return Promise.all( all ).then( router.loader.done );
        },
        path: function path( pathname ) {
            return ( pathname || ctx.location.pathname ).slice( 1 ).split( '/' ).filter( function ( r ) {
                return !!r;
            } );
        },
        handlePop: function handlePop() {
            return router.guard( router.path() ).then( function () {
                router.route( router.path() );
            } );
        },
        resolvePath: function resolvePath() {
            var args = Array.from( arguments );
            var url = args.reduce( function ( url, path ) {
                return new ctx.URL( path, url.href );
            }, new ctx.URL( ctx.location.origin ) );
            return url.pathname + url.search + url.hash;
        },
        navigate: function navigate( data ) {
            if ( typeof data === 'string' ) data = {
                state: {},
                title: '',
                href: data
            };
            data.href = router.resolvePath( data.href );
            return router.guard( router.path( data.href ) ).then( function () {
                ctx.history.pushState(
                    data.state || {},
                    data.title || '',
                    data.href
                );
                router.route( router.path() );
            } );
        },
        start: function () {
            return ( ctx.onpopstate = router.handlePop )();
        },
        loader: {
            start: function () {},
            done: function () {}
        }
    };
    router.guard.tree = {};
    router.guard.set = function guardSet( path, deeds ) {
        var node = Object.path( router.guard.tree, path, {} );
        node._deeds = ( node._deeds || [] ).concat( Array.isArray( deeds ) ? deeds : [ deeds ] );
    };

    ctx.ko.bindingHandlers[ 'page' ] = {
        init: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
            return {
                controlsDescendantBindings: true
            };
        },
        update: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
            var res = {
                controlsDescendantBindings: true
            };
            var value = valueAccessor();
            if ( ( !value.route || value.route === '*' ) && !value.name ) {
                element.style.display = 'none';
                return res;
            };
            value.name = value.name || value.route;
            value.name = 'tmpl-page-' + value.name;

            var route = ctx.router.route();

            var _page = {
                depth: Object.path( bindingContext, '_page.depth' ),
                title: value.title || Object.path( bindingContext, '_page.title' ) || ctx.document.title
            };
            if ( _page.depth === undefined ) _page.depth = -1;
            _page.depth++;

            if ( !( [ false, null, undefined ].includes( value.route ) && route.length === _page.depth ) &&
                !( route[ _page.depth ] && [ '*', route[ _page.depth ] ].includes( value.route ) )
            ) {
                Array.from( element.children ).map( function ( c ) {
                    c.remove();
                } );
                element.style.display = 'none';
                return res;
            };

            var context = bindingContext.extend( {
                _page: _page
            } );

            ko.applyBindingsToNode( element, {
                template: value
            }, context );

            element.style.display = '';

            return res;
        }
    };

    ctx.ko.bindingHandlers[ 'nav' ] = {
        update: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
            var value = valueAccessor();
            var page = bindingContext._page || {};
            var route = router.route().slice( 0, Object.path( bindingContext, '_page.depth', -1 ) + 1 ).join( '/' );
            if ( route.slice( -1 ) !== '/' ) route += '/';
            if ( element.tagName === 'A' ) element.href = router.resolvePath( route, value );
            element.onclick = function ( ev ) {
                if ( ev.button !== 0 || ( ev.ctrlKey && ev.button === 0 ) ) return true;
                var href = this.href || router.resolvePath( route, value );
                router.navigate( {
                    state: page.state || {},
                    title: page.title || ctx.document.title,
                    href: href
                } );
                return false;
            };
        }
    };
} )( window );
