MX.rotationControl = (function () {

    var object,
        locked      = false

    var down        = false,
        active      = false,
        lastX,
        lastY

    var pub = {

        sensitivity : .4,
        ease        : 10,
        drag        : true,
        inverseX    : false,
        inverseY    : false,
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
            ease: 4,
            sensitivity: .2,
            inverseX: true,
            inverseY: true,
            upperBoundX: 90,
            lowerBoundX: -90
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

    function remove () {
        if (!active) return
        listener.removeEventListener('mousedown', onDown)
        listener.removeEventListener('mousemove', onMove)
        listener.removeEventListener('mouseup', onUp)
        listener.removeEventListener('touchstart', onDown)
        listener.removeEventListener('touchmove', onMove)
        listener.removeEventListener('touchend', onUp)
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
            console.log(2)
        lastX = lastX || e.pageX
        lastY = lastY || e.pageY
        var dx = e.pageX - lastX,
            dy = e.pageY - lastY
        if (pub.inverseX) dx = -dx
        if (pub.inverseY) dy = -dy
        if (MX.rotationUnit !== 'deg') {
            dx = MX.toRad(dx)
            dy = MX.toRad(dy)
        }
        pub.rotationX -= dy * pub.sensitivity,
        pub.rotationY += dx * pub.sensitivity
        if (pub.upperBoundX) pub.rotationX = Math.min(pub.rotationX, pub.upperBoundX)
        if (pub.lowerBoundX) pub.rotationX = Math.max(pub.rotationX, pub.lowerBoundX)
        if (pub.upperBoundY) pub.rotationY = Math.min(pub.rotationY, pub.upperBoundY)
        if (pub.lowerBoundY) pub.rotationY = Math.max(pub.rotationY, pub.lowerBoundY)
        lastX = e.pageX
        lastY = e.pageY
    }

    function onUp () {
        down = false
    }

    function normalizeEvent (e) {
        if (e.touches) {
            return e.touches.length > 1 ? false : e.touches[0]
        } else {
            return e
        }
    }

    function update () {
        if (!object || locked) return
        var dx = pub.rotationX - object.rotationX,
            dy = pub.rotationY - object.rotationY
        if (Math.abs(dx) < 0.01) {
            object.rotationX = pub.rotationX
        } else {
            object.rotationX += dx / pub.ease
        }
        if (Math.abs(dy) < 0.01) {
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

    pub.init    = init
    pub.remove  = remove
    pub.update  = update
    pub.lock    = lock
    pub.unlock  = unlock

    return pub

})()