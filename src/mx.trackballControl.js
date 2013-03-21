MX.trackballControl = (function () {

    var object,
        locked = false

    var down = false,
        lastX, lastY,
        active = false,
        inverse = false

    var pub = {
        sensitivity: .5,
        ease: 8,
        rotationX: 0,
        rotationY: 0
    }

    function init (obj, lis, inv) {
        if (active) return

        object = obj
        pub.rotationX = object.rotationX
        pub.rotationY = object.rotationY

        if (inv === true) {
            inverse = true
        }

        if (lis instanceof HTMLElement) {
            listener = lis
        } else if (lis instanceof MX.Object3D) {
            listener = lis.el
        } else {
            listener = document
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
        e = normalizeEvent(e)
        if (!e) return
        if (!down) return
        var dx = e.pageX - lastX,
            dy = e.pageY - lastY
        if (inverse) {
            dx = -dx
            dy = -dy
        }
        if (MX.rotationUnit !== 'deg') {
            dx = MX.toRad(dx)
            dy = MX.toRad(dy)
        }
        pub.rotationX += dy * pub.sensitivity,
        pub.rotationY -= dx * pub.sensitivity
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