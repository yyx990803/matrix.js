// Usage:
//
//   var control = new MX.RotationControl()
//   control.init( object{MX.Object3D} [, listener{HTMLElement}] )
//
// In animation loop:
//
//   control.update() 
//
// The above code will register handler functions on `listener`
// and will be updating `object`s rotationX and rotationY
// If no `listener` is provided, will default to `object`s el.

MX.RotationControl = function () {

    var object,
        locked      = false

    var down        = false,
        active      = false,
        lastX,
        lastY

    var pointerLockPrefix =
            'pointerLockElement' in document ? '' :
            'mozPointerLockElement' in document ? 'moz' :
            'webkitPointerLockElement' in document ? 'webkit' : null,
        hasPointerLock = !(pointerLockPrefix === null)
        pointerLockEnabled = false

    var pub = {

        sensitivity : .5,
        ease        : 10,
        drag        : true,

        inverseX    : false,
        inverseY    : false,

        disableX    : false,
        disableY    : false,

        rotationX   : 0,
        rotationY   : 0,

        upperBoundX : undefined,
        lowerBoundX : undefined,
        
        upperBoundY : undefined,
        lowerBoundY : undefined,

        usePreset: function (name) {
            var ops = presets[name]
            if (ops) {
                if (currentPreset && presets[currentPreset].teardown) {
                    presets[currentPreset].teardown()
                }
                for (var op in ops) {
                    if (op !== 'setup' && op !== 'teardown') {
                        pub[op] = ops[op]
                    }
                }
                if (op.setup) ops.setup()
            }
        }
    }

    var currentPreset
    var presets = {
        firstPerson: {
            drag: false,
            ease: 2,
            sensitivity: .18,
            inverseX: true,
            inverseY: true,
            upperBoundX: MX.rotationUnit === 'deg' ? 90 : Math.PI / 2,
            lowerBoundX: MX.rotationUnit === 'deg' ? -90 : -Math.PI / 2
        },
        skybox: {
            sensitivity: .18,
            inverseX: true,
            inverseY: true,
            upperBoundX: MX.rotationUnit === 'deg' ? 90 : Math.PI / 2,
            lowerBoundX: MX.rotationUnit === 'deg' ? -90 : -Math.PI / 2
        }
    }

    function init (obj, lis) {
        if (active) return

        object = obj
        pub.rotationX = object.rotationX
        pub.rotationY = object.rotationY

        if (lis instanceof HTMLElement) {
            listener = lis
        } else if (lis instanceof MX.Object3D) {
            listener = lis.el
        } else {
            listener = window.document
        }

        listener.addEventListener('mousedown', onDown)
        listener.addEventListener('mousemove', onMove)
        listener.addEventListener('mouseup', onUp)
        listener.addEventListener('touchstart', onDown)
        listener.addEventListener('touchmove', onMove)
        listener.addEventListener('touchend', onUp)

        active = true
    }

    function changeObject (obj) {
        object = obj
        pub.rotationX = object.rotationX
        pub.rotationY = object.rotationY
    }

    function changeListener (lis) {
        remove()
        active = false
        init(object, lis)
        if (pointerLockEnabled) {
            initPointerLock()
        }
    }

    function remove () {
        if (!active) return
        listener.removeEventListener('mousedown', onDown)
        listener.removeEventListener('mousemove', onMove)
        listener.removeEventListener('mouseup', onUp)
        listener.removeEventListener('touchstart', onDown)
        listener.removeEventListener('touchmove', onMove)
        listener.removeEventListener('touchend', onUp)

        if (hasPointerLock) {
            document.removeEventListener(pointerLockPrefix + 'pointerlockchange', onPointerLockChange)
            document.removeEventListener('mousemove', onPointerLockMove)
            document.body[pointerLockPrefix + (pointerLockPrefix ? 'E' : 'e') + 'xitPointerLock']()
        }
        active = false
    }

    function onDown (e) {
        e = normalizeEvent(e)
        if (!e) return
        down = true
        lastX = e.pageX
        lastY = e.pageY
    }

    function onMove (e) {
        if (e.type = 'touchmove') {
            e.preventDefault()
        }
        if (pub.drag && !down) return
        e = normalizeEvent(e)
        if (!e) return
        lastX = lastX || e.pageX
        lastY = lastY || e.pageY
        var dx = e.pageX - lastX,
            dy = e.pageY - lastY
        lastX = e.pageX
        lastY = e.pageY
        updateTarget(dx, dy)
    }

    function onUp () {
        down = false
    }

    function initPointerLock () {

        if (pointerLockEnabled) return

        document.addEventListener(pointerLockPrefix + 'pointerlockchange', onPointerLockChange)
        document.addEventListener('mousemove', onPointerLockMove)

        document.body[pointerLockPrefix + (pointerLockPrefix ? 'R' : 'r') + 'equestPointerLock']()
    }

    function onPointerLockChange () {
        var el = document.body
        if (document[pointerLockPrefix + (pointerLockPrefix ? 'P' : 'p') + 'ointerLockElement'] === el) {
            pointerLockEnabled = true
        } else {
            pointerLockEnabled = false
        }
    }

    function onPointerLockMove (e) {
        if (!pointerLockEnabled) return
        var dx = e[pointerLockPrefix + (pointerLockPrefix ? 'M' : 'm') + 'ovementX'],
            dy = e[pointerLockPrefix + (pointerLockPrefix ? 'M' : 'm') + 'ovementY']
        updateTarget(dx, dy)
    }

    function normalizeEvent (e) {
        if (e.touches) {
            return e.touches.length > 1 ? false : e.touches[0]
        } else {
            return e
        }
    }

    function updateTarget (dx, dy) {
        if (pub.inverseX) dx = -dx
        if (pub.inverseY) dy = -dy
        if (MX.rotationUnit !== 'deg') {
            dx = MX.toRad(dx)
            dy = MX.toRad(dy)
        }

        if (!pub.disableX) {
            pub.rotationX -= dy * pub.sensitivity
            if (pub.upperBoundX) pub.rotationX = Math.min(pub.rotationX, pub.upperBoundX)
            if (pub.lowerBoundX) pub.rotationX = Math.max(pub.rotationX, pub.lowerBoundX)
        }

        if (!pub.disableY) {
            pub.rotationY += dx * pub.sensitivity
            if (pub.upperBoundY) pub.rotationY = Math.min(pub.rotationY, pub.upperBoundY)
            if (pub.lowerBoundY) pub.rotationY = Math.max(pub.rotationY, pub.lowerBoundY)
        }
    }

    function update () {
        if (!object || locked) return
        var dx = pub.rotationX - object.rotationX,
            dy = pub.rotationY - object.rotationY
        if (Math.abs(dx) < 0.0001) {
            object.rotationX = pub.rotationX
        } else {
            object.rotationX += dx / pub.ease
        }
        if (Math.abs(dy) < 0.0001) {
            object.rotationY = pub.rotationY
        } else {
            object.rotationY += dy / pub.ease
        }
    }

    function lock () {
        locked = true
    }

    function unlock () {
        pub.rotationX = object.rotationX
        pub.rotationY = object.rotationY
        locked = false
    }

    pub.init            = init
    pub.remove          = remove
    pub.update          = update
    pub.lock            = lock
    pub.unlock          = unlock
    pub.initPointerLock = initPointerLock
    pub.changeObject    = changeObject
    pub.changeListener  = changeListener

    return pub

}