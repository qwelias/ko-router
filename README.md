# ko-router
Knockout dummy router

## Requirements
- knockout v3.4+
- URL
- Promise
- fetch
- polyfill.io recommended

## Usage
Upon load creates ```window.router```

### window.router

#### .route
*ko.observableArray* containing pathname splitted by "/".

Updated after successful navigation.

#### .navigate( href )
```href``` is either a relative or absolute local path.

Returns a Promise.

#### .resolvePath( ...paths )
Will resolve ```paths``` in relation to ```location.origin```

#### .start()
Will enable router and return a Promise.

#### .loader.start()
Dummy function, called when navigation starts.

Assign it something that will show some loader.

#### .loader.done()
Dummy function, called when navigation ends.

Assign it something that will hide some loader.

#### .on404()
Called if path not found. Override it.

#### .root
A root Page.

### window.router.Page( data )
Page class.

#### .element = data.element
Element page bound to, none for root.

#### .route = data.route
Route to match, none for root.

Values:
- '/' - will match empty route, usefull for setting a default page at some level.
- *string* - actual string to match.
- '\*' - match anything none empty.

#### .title = data.title
Title to set to the document, defaults to parent's title.

#### .template = data.template
Template value to pass to **Knockout**'s *template* binding.

#### .guards = data.guards
Array of functions to be called in ```Promise.all``` on an attempt to open the page.

Each function accepts it's piece of route as first argument and is boud to a page, should return a Promise. Root page is the exception as it accepts whole array of routes. Useful for any kind of (a)synchronous checks/prehooks.

If you want to return a ```window.router.navigate( href )``` wrap it into ```Promise.reject``` so that previous navigation stops.

#### .current = ''
Current page route.

#### .src = data.src
Template source to load if not found.

#### .context = data.context
**Knockout**'s element's *bindingContext*.

#### .to = {}
References to child pages.
Filled automatically.

#### .path()
Return a path to the page.

#### .check()
Internal function.

#### .ensureTemplate()
Internal function.

#### .open( current )
Internal function.

#### .close()
Internal function.

#### .closeChildren()
Internal function.

#### .closeSiblings()
Internal function.

#### .next( route )
Internal function.

#### .parent()
Return parent.
