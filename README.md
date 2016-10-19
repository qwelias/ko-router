# ko-router
Knockout HTML5 History router

## Requirements
- knockout v3.4+
- HTML5 History
- URL
- Promise
- fetch
- polyfill.io recommended

## Usage
Upon load creates ```window.router```.

- [```window.router```](#windowrouter)
- [```window.router.Page```](#windowrouterpage-data-)
- [Bindings](#bindings)

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
A root Page, created upon load.

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
Template value to pass to **Knockout**'s [*template*](http://knockoutjs.com/documentation/template-binding.html) binding.

#### .guard = data.guard
Function to be called on an attempt to open the page.

Function accepts it's piece of route as first argument and is boud to a page, should return a Promise. Root page is the exception as it accepts whole array of routes. Useful for any kind of (a)synchronous checks/prehooks.

If you want to return a [```window.router.navigate( href )```](#navigate-href-) wrap it into ```Promise.reject``` so that previous navigation stops.

#### .onclose = data.onclose
Function to be called on an attempt to close the page.

Bound to a page.

If you want to return a [```window.router.navigate( href )```](#navigate-href-) wrap it into ```Promise.reject``` so that previous navigation stops.

#### .current = ''
Current page route.

#### .src = data.src
Template source to load if not found.

#### .context = data.context
**Knockout**'s *bindingContext* of the parent's element.

#### .to = {}
References to child pages.
Filled automatically.

#### .path()
Return a path to the page.

#### .parent()
Return parent.

#### .next( route )
Return child page matched to a ```route```.

#### .check()
Internal function.

Return a ```Promise.all``` result of the page's guards.

#### .ensureTemplate()
Internal function.

Literally the function name.

#### .open( current )
Internal function.

Apply *template* binding to the page's elemtent.

Expands **Knockout**'s bindingContext of the element with ```_page``` as a reference to this page.

#### .close()
Internal function.

Yeah.

#### .closeChildren()
Internal function.

Yep.

#### .closeSiblings()
Internal function.

Hmm.

### Bindings

#### page
Creates Page instance, passing value to the constructor, and bounds it to a parent's ```to``` upon init.

Or updates existing one.

#### nav
Pass either relative or absolute local path to [```navigate```](#navigate-href-) to upon element click event.

Would not call [```navigate```](#navigate-href-) and will pass an event, so a new tab is opened, if clicked with either MMB or Ctrl + LMB, to preserve native browser behavior.

## Warnings
Internal functions should not be called manually, but hey!
