# Pre-alpha work in progress!

A featherweight CSS 3D engine. Similar to Three.js CSS3D Renderer, but less intrusive and much lighter in weight. Better suited to add 3D stuff to a normal DOM heavy page. Doesn't provide any vector/matrix math utilities though.

### But there are no matrices in the source code!

Originally I wanted to use matrix3d() for everything, hence the name. Ironically it turned out that using native CSS transform functions is faster than multiplying matrices in JavaScript, so I eneded up not using matrices at all.

### Compatibility

Mostly it has to do with the Browser's capability of handling CSS3D transforms. Works best in Chrome, very good in Safari (both desktop and iOS), and not so good in Firefox (not hardware accelerated and has some z-index issues). Doesn't work in IE10 because IE10 doesn't support `transform-style: preserve-3d` yet.

### Examples

[here](http://sketch.evanyou.me/matrix/examples/)

### Documentation

[MX](#mx)
[MX.Object3D](#mxobject3d)

---

## MX

The global object. Contains all the components and some global configurations.

**Properties**

- **MX.rotationUnit**  _{ String }_

    **Default**: `'rad'`, other available value: `'deg'`.  
    Unit used for rotation values.

- **MX.positionAtCenter** _{ Boolean }_

    **Default**: `true`  
    Whether or not to auto-center `.mx-object3d` elements. See `examples/no_centering.html` for more details.

**Methods**

- **MX.toRad()**

    converts degrees to radians.

- **MX.toDeg()**

    converts radians to degrees.

---

## MX.Object3D

The core base class. Every `MX.Object3D` has an `el` property which is the native DOM element. You can create a new `MX.Object3D` in multiple ways:

```js
// attach to an existing element:
var wrappedObj = new MX.Object3D(document.getElementById('my-object'))

// create an element with specified tag, id or classname:
var obj = new MX.Object3D('div#main-box.box')
// obj.el => <div id="main-box" class="box"></div>

// or nothing at all, and el will just be a div.
var obj2 = new MX.Object3D()
```

It also comes with an inheritence util method `extend()`:

```js
// Creating a resuable box class
var Box = MX.Object3D.extend({
    // init will be called in the constructor function
    init: function () { ... },
    // all other properties will be mixed into the prototype
    spin: function () { ... }
})
var box = new Box()
```

**Instance Properties**

- **el** _{ HTMLElement }_

    The DOM element

- **x, y, z** _{ Number }_

    **Default**: `0`  
    The position of the element in the 3D space, relative to (**Note the Y axis points upwards in MX's system**):
    - Its parent object's center if `MX.positionAtCenter` is `true`
    - Its default position on page if `MX.positionAtCenter` is `false`

- **rotationX, rotationY, rotationZ** _{ Number }_

    **Default**: `0`  
    The rotation on each axis. The euler order is XYZ.

- **scaleX, scaleY, scaleZ** _{ Number }_

    **Default**: `1`  
    The scale on each axis.

- **scale** _{ Number }_

    **Default**: `1`  
    The scale for all three axes. If this is not 1 it will override any scaling on individual axis.

- **width, height** _{ Number }_

    **Default**: `0`  
    `el`'s CSS width & height. Setting this will change `el`'s CSS width & height properties.

- **parent** _{ MX.Object3D }_

    **Default**: `undefined`  
    The parent object containing this object.

- **children** _{ [ MX.Object3D ] }_

    **Default**: `[]`  
    An array containing all children objects.

- **updateChildren** _{ Boolean }_

    **Default**: `true`  
    Whether to call children's `update()` as well during its own `update()`.

- **rotationOrigin** _{ Object }_

    **Default**: `undefined`  
    If set, all rotations will happen relative to this point. Can be any object that has `x`, `y` and `z` properties.

- **followTarget** _{ Object }_

    **Default**: `undefined`  
    If set, will aotumatically call `lookAt(this.followTarget)` on every `update()`. Can be any object that has `x`, `y` and `z` properties.

- **inverseLookAt** _{ Boolean }_

    **Default**: `false`  
    Inverse look at facing for `lookAt()`, `follow()` and `getLookAtEuler()` methods.

**Instance Methods**

- **update()**

    Check if the object's transform properties have changed, if yes, apply the CSS transform to `el`. If `updateChildren` is `true`, will also call `update()` on all children objects.

- **add(child1, child2, ...)**

    Add child objects. Takes any number of arguments, which must be instances of `MX.Object3D`.

- **remove(child1, child2, ...)**

    Remove child objects. Takes any number of arguments, which must be instances of `MX.Object3D`.

- **addTo(target)**

    Add the object itself to a target. The target can be an instance of `MX.Object3D`, a native DOM element, or a querySelector string.

- **lookAt(target)**

    Set the object's rotation so that it's facing the given target. Target can be any object with `x`,`y`,`z` properties.

- **getLookAtEuler(target)**
    
    Returns an object whose `x`,`y`,`z` properties are the amount of rotations needed on each axis for the object to face the target.

- **reset()**

    Resets object's position, rotation, scaling, rotationOrigin and followTarget to default values.

- **removeElement()**

    Removes the object's DOM element from the page.

- **setCSSTransformOrigin(string), setCSSTransformStyle(string), setCSSTransition(string), setCSSPerspective(string)**

    Set the object's `el`'s CSS transform properties. These methods take of using the correct prefixes.