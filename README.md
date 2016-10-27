# ko-router
[KnockoutJS](http://knockoutjs.com) HTML5 History router.

Supports template lazy-load, (a)synchronous pre-, post-hooks and is just under 250 lines.

## Requirements
- knockout v3.4+
- HTML5 History
- URL
- Promise
- fetch
- [polyfill.io](https://polyfill.io) recommended

## Usage
Upon load creates ```window.router```.

- [```window.router```](#windowrouter)
- [```window.router.Page```](#windowrouterpage-data-)
- [Bindings](#bindings)

### Examples

index.js
```js
// on ready
window.ko.applyBindings( app );

if ( window.someLoader ) {
    window.router.loader.start = window.someLoader.start;
    window.router.loader.done = window.someLoader.done;
};

window.router.root.guard = function ( route ) {
    // if location == '/home/foo', then route == [ 'home', 'foo' ]
    // only root guard will receive whole route
    // navigate to /home if location == '/'
    if ( !route.length ) return Promise.reject( window.router.navigate( '/home' ) ); // reject current navigation
};

return window.router.start();
```

index.html
```html
<body>
    <!-- some page content -->

    <!-- /home -->
    <section data-bind="page: {
        route: 'home',
        template: 'tmpl-page-home',
        guard: function( id ) {
            // id === 'home'
            if ( !app.me._id ) return Promise.reject( router.navigate( '/login' ) ); // reject current navigation
        },
        src: '/pages/home.html',
        title: 'home'
    }">
    </section>

    <!-- /login -->
    <section data-bind="page: {
        route: 'login',
        template: 'tmpl-page-login',
        guard: function( id ) {
            // id === 'login'
            if ( app.me._id ) return Promise.reject( router.navigate( '/home' ) ); // reject current navigation
        },
        src: '/pages/login.html',
        title: 'login'
    }">
    </section>

    <!-- some page content -->

</body>
```

page/home.html
```html
<script type="text/html"
    id="tmpl-page-home">

    <!-- some page content -->

    <!-- link to /home/foo -->
    <a data-bind="nav: 'foo'">foo</a>

    <!-- /home/foo -->
    <div data-bind="page: {
        route: '*',
        template: 'tmpl-page-content',
        guard: function ( id ) {

            // guard called on any location change
            // so resolve if already was opened
            if ( id === this.current ) return Promise.resolve();

            // reject if missnavigation
            if ( !app[ id ] ) return Promise.reject();

            // reload foo table from server
            return app[ id ].table.reload(); // returns Promise
        },
        src: '/pages/content.html'
    }">
    </div>

    <!-- some page content -->

</script>
```

## window.router

### .route
*ko.observableArray* containing pathname splitted by "/".

Updated after successful navigation.

### .navigate( href )
```href``` is either a relative or absolute local path.

Returns a Promise.

### .resolvePath( ...paths )
Will resolve ```paths``` in relation to ```location.origin```

### .start()
Will enable router and return a Promise.

### .loader.start()
Dummy function, called when navigation starts.

Assign it something that will show some loader.

### .loader.done()
Dummy function, called when navigation ends.

Assign it something that will hide some loader.

### .on404()
Called if path not found. Override it.

### .root
A root Page, created upon load.

## window.router.Page( data )
Page class.

### .element = data.element
Element page bound to, none for root.

### .route = data.route
Route to match, none for root.

Values:
- '/' - will match empty route, usefull for setting a default page at some level.
- *string* - actual string to match.
- '\*' - match anything none empty.

### .title = data.title
Title to set to the document, defaults to parent's title.

### .template = data.template
Template value to pass to **Knockout**'s [*template*](http://knockoutjs.com/documentation/template-binding.html) binding.

### .guard = data.guard
Function to be called on an attempt to open the page.

Function accepts it's piece of route as first argument and is boud to a page, should return a Promise. Root page is the exception as it accepts whole array of routes. Useful for any kind of (a)synchronous checks/prehooks.

If you want to return a [```window.router.navigate( href )```](#navigate-href-) wrap it into ```Promise.reject``` so that previous navigation stops.

### .onclose = data.onclose
Function to be called on an attempt to close the page.

Bound to a page.

If you want to return a [```window.router.navigate( href )```](#navigate-href-) wrap it into ```Promise.reject``` so that previous navigation stops.

### .current = ''
Current page route.

### .src = data.src
Template source to load if not found.

### .context = data.context
**Knockout**'s *bindingContext* of the parent's element.

### .to = {}
References to child pages.
Filled automatically.

### .path()
Return a path to the page.

### .parent()
Return parent.

### .next( route )
Return child page matched to a ```route```.

### .check()
Internal function.

Return a ```Promise.all``` result of the page's guards.

### .ensureTemplate()
Internal function.

Literally the function name.

### .open( current )
Internal function.

Apply *template* binding to the page's elemtent.

Expands **Knockout**'s bindingContext of the element with ```_page``` as a reference to this page.

### .close()
Internal function.

Yeah.

### .closeChildren()
Internal function.

Yep.

### .closeSiblings()
Internal function.

Hmm.

## Bindings

### page
Creates Page instance, passing value to the constructor, and bounds it to a parent's ```to``` upon init.

Or updates existing one.

### nav
Pass either relative or absolute local path to [```navigate```](#navigate-href-) to upon element click event.

Would not call [```navigate```](#navigate-href-) and will pass an event, so a new tab is opened, if clicked with either MMB or Ctrl + LMB, to preserve native browser behavior.

## Warnings
Internal functions should not be called manually, but hey!
