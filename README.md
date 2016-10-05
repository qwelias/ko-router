# ko-router
Knockout dummy router

## Requirements
- knockout v3.4+
- URL
- Promise
- es6-shim recommended

## Usage
Upon load creates ```window.router```

### router.route
ko.observableArray containing pathname splitted by '/'.
Updated after successful navigation.

### router.navigate( data )
```data``` is either a local href to navigate to
or an object ```{ state, title, href }```.
Returns a Promise.

### router.resolvePath( ...paths )
Will resolve ```paths``` in relation to ```location.origin```

### router.start()
Will enable router and return a Promise.

### router.loader.start()
Dummy function, called upon navigation starts.
Assign it something that will show some loader.

### router.loader.done()
Dummy function, called upon navigation ends.
Assign it something that will hide some loader.

### router.guard.set( path, functions )
Set an array of functions to a specific URL path, every function will recieve next path piece as an argument and should return a Promise. If rejected navigation stops.

#### Examples

```js
/*
location.pathname = /home/Item
Load items table.
*/
window.router.guard.set( 'home', function ( id ) {
    console.log( 'deed@Item', id );
    if ( id === 'Item' ) return Item.table.reload();
} );

/*
location.pathname = /home/Item/<some_id or new>
Load a specific item or create new.
*/
window.router.guard.set( 'home.Item', function ( id ) {
    console.log( 'deed@Item', id );
    if ( id === 'new' ) Item.wo._id = null;
    else Item.wo._id = id;
    return Item.wo.load();
} );

/*
location.pathname = /
Check if user logged in.
*/
window.router.guard.set( null, function ( id ) {
    console.log( 'deed@User', id );
    if ( !ctx.me._id && id !== 'login' ) {
        return window.router.navigate( '/login' );
    } else if ( ( id === 'login' || !id ) && ctx.me._id ) {
        return window.router.navigate( '/home' );
    };
} );
```

### page binding


### nav binding
