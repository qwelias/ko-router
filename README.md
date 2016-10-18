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

#### route
*ko.observableArray* containing pathname splitted by "/".

Updated after successful navigation.

#### navigate( href )
```href``` is either a relative or absolute local path.

Returns a Promise.

#### resolvePath( ...paths )
Will resolve ```paths``` in relation to ```location.origin```

#### start()
Will enable router and return a Promise.

#### loader.start()
Dummy function, called when navigation starts.

Assign it something that will show some loader.

#### loader.done()
Dummy function, called when navigation ends.

Assign it something that will hide some loader.

#### on404
Called if path not found. Override it.

#### root
A root Page.

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
TODO

### nav binding
TODO
