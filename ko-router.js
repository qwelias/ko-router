( function ( ctx ) {
    "use strict";

    var router = ctx.router = {
        on404: function ( rt, e ) {
            throw new Error( [
                'Path' + router.resolvePath.apply( router, rt ) + ' not found.',
                'You can handle the error by overriding this function.'
            ].join( '\n' ) );
        },
        route: ctx.ko.observableArray(),
        root: Page( {
            title: ctx.document.title
        } ),
        resolvePath: function resolvePath() {
            var args = Array.from( arguments );
            var url = args.map( function ( r ) {
                if ( r.slice( -1 ) !== '/' ) r += '/';
                return r;
            } ).reduce( function ( url, path ) {
                return new ctx.URL( path, url.href );
            }, new ctx.URL( ctx.location.origin ) );
            return url.pathname + url.search + url.hash;
        },
        navigate: function navigate( href ) {
            href = router.resolvePath( href );
            return guards( path( href ) ).then( function () {
                ctx.history.pushState( {}, '', href );
                router.route( path() );
            } );
        },
        start: function start() {
            return ( ctx.onpopstate = handlePop )();
        },
        loader: {
            start: function () {},
            done: function () {}
        }
    };
    router.Page = Page;

    ctx.ko.bindingHandlers[ 'page' ] = {
        init: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
            var value = valueAccessor();
            if ( !value.route ) throw new Error( 'route required' );
            var parent = bindingContext._page || router.root;
            var page = parent.to[ value.route ] = parent.to[ value.route ] || Page( {
                route: value.route
            } );
            Object.assign( page, {
                element: element,
                src: value.src,
                title: value.title || parent.title,
                template: value.template,
                guard: value.guard,
                onclose: value.onclose,
                context: bindingContext
            } );
            page.close();
            return {
                controlsDescendantBindings: true
            };
        }
    };

    ctx.ko.bindingHandlers[ 'nav' ] = {
        update: function ( element, valueAccessor, allBindingsAccessor, viewModel, bindingContext ) {
            var value = valueAccessor();
            var page = bindingContext._page || {};
            var route = page.path ? page.path() : '/';
            if ( element.tagName === 'A' ) element.href = router.resolvePath( route, value );
            element.onclick = function ( ev ) {
                if ( ev.button !== 0 || ( ev.ctrlKey && ev.button === 0 ) ) return true;
                var href = this.href || router.resolvePath( route, value );
                router.navigate( href );
                return false;
            };
        }
    };

    function Page( data ) {
        if ( !( this instanceof Page ) ) return new Page( data );

        data = data || {};
        this.element = data.element;
        this.route = data.route;
        this.title = data.title;
        this.template = data.template;
        this.guard = data.guard;
        this.onclose = data.onclose;
        this.current = '';
        this.src = data.src;
        this.context = data.context;
        this.to = {};
    };
    Page.prototype.check = function check( route ) {
        return wrap( this.guard, this, [ route ] ).then( function () {
            return this;
        }.bind( this ) );
    };
    Page.prototype.ensureTemplate = function ensureTemplate() {
        var tmplname = this.template.name || this.template;
        var tmpl = ctx.document.querySelector( 'script#' + tmplname );
        if ( !tmpl && !this.src ) return Promise.reject( new Error( 'No template or source supplied' ) );
        if ( !tmpl && this.src ) return ctx.fetch( encodeURI( this.src ) ).then( function ( response ) {
            if ( response.status !== 200 ) {
                var e = new Error( response.statusText );
                e.response = response;
                throw e;
            };
            return response.text();
        } ).then( function ( text ) {
            var tmpl = document.createElement( 'div' );
            tmpl.innerHTML = text;
            tmpl = tmpl.firstChild;
            if ( !tmpl || tmpl.tagName !== 'SCRIPT' || tmpl.id !== tmplname ) throw new Error( 'Wrong source' );
            ctx.document.body.appendChild( tmpl );
        } );
    };
    Page.prototype.open = function open( current ) {
        this.current = current;
        if ( !this.template || !this.element ) return this;

        ctx.ko.applyBindingsToNode( this.element, {
            template: this.template
        }, this.context.extend( {
            _page: this
        } ) );
        this.element.style.display = '';
        return this;
    };
    Page.prototype.close = function close() {
        this.current = '';
        var children = Array.from( this.element.children );
        var ready = Promise.resolve();

        if ( children.length ) ready = wrap( this.onclose, this );

        return ready.then( function () {
            children.map( function ( c ) {
                c.remove();
            } );
            this.element.style.display = 'none';
            return this;
        }.bind( this ) );
    };
    Page.prototype.closeChildren = function closeChildren() {
        return Promise.all( Object.keys( this.to ).map( function ( t ) {
            return this.to[ t ].close();
        }.bind( this ) ) );
    };
    Page.prototype.closeSiblings = function closeSiblings() {
        var parent = this.parent();
        if ( !parent ) return;
        return Promise.all( Object.keys( parent.to ).map( function ( t ) {
            if ( parent.to[ t ] !== this ) return parent.to[ t ].close();
        }.bind( this ) ) );
    };
    Page.prototype.next = function next( route ) {
        if ( !route && this.to[ '/' ] ) return this.to[ '/' ];
        if ( route && this.to[ route ] ) return this.to[ route ];
        if ( route && this.to[ '*' ] ) return this.to[ '*' ];
    };
    Page.prototype.path = function path() {
        var path = [];
        var parent = this;
        do {
            path.unshift( parent.current );
            parent = parent.parent();
        } while ( parent )
        return path.join( '/' );
    };
    Page.prototype.parent = function parent() {
        if ( this === router.root ) return;
        return Object.path( this, 'context._page' ) || router.root;
    };

    function guards( rt ) {
        router.loader.start();
        console.log( 'GUARD', rt );
        return router.root.check( rt ).then( workGuard.bind( this, {
            rt: Array.from( rt ),
            page: router.root
        } ) ).then( function ( page ) {
            ctx.document.title = page.title || router.root.title;
            router.loader.done();
            return page;
        } ).catch( function ( e ) {
            if ( e instanceof Promise ) return e;
            if ( e instanceof Error && e.message === 'Page not found' )
                return router.on404( rt, e );
            throw e;
            router.loader.done();
        } );
    };

    function workGuard( cur ) {
        var r = cur.rt.shift();
        var next = cur.page.next( r );
        if ( !next ) return cur.page.closeChildren().then( function () {
            if ( r ) return Promise.reject( new Error( 'Page not found' ) );
            return Promise.resolve( cur.page );
        }.bind( this ) );
        return Promise.all( [ next.check( r ), next.ensureTemplate() ] ).then( function ( res ) {
            cur.page = res[ 0 ];
            if ( cur.page.current === r ) return;
            return cur.page.closeSiblings().then(function(){
                cur.page.open( r );
            } );
        } ).then( workGuard.bind( this, cur ) );
    };

    function handlePop() {
        return guards( path() ).then( function () {
            router.route( path() );
        } );
    };

    function path( pathname ) {
        return ( pathname || ctx.location.pathname ).slice( 1 ).split( '/' ).filter( function ( r ) {
            return !!r;
        } );
    };

    function wrap( target, reciever, args ) {
        if ( target instanceof Error ) return Promise.reject( target );
        if ( !( target instanceof Function ) ) return Promise.resolve( target );
        if ( !Array.isArray( args ) ) args = [ args ];
        try {
            var r = target.apply( reciever, args );
            if ( !( r instanceof Promise ) ) return Promise.resolve( r );
            return r;
        } catch ( e ) {
            return Promise.reject( e );
        };
    };

} )( window );
