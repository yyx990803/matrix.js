MX.trackballControl = (function () {

    var obj

    var target = {
        rotationX: 0,
        rotationY: 0
    }

    var down = false,
        lastX, lastY,
        active = false,
        inverse = false

    function init (tar, inv) {
        if (active) return
        bind(tar)
        if (inv === true) inverse = true
        document.addEventListener('mousedown', onDown)
        document.addEventListener('mousemove', onMove)
        document.addEventListener('mouseup', onUp)
        document.addEventListener('touchstart', onDown)
        document.addEventListener('touchmove', onMove)
        document.addEventListener('touchend', onUp)
        active = true
    }

    function remove () {
        if (!active) return
        document.removeEventListener('mousedown', onDown)
        document.removeEventListener('mousemove', onMove)
        document.removeEventListener('mouseup', onUp)
        document.removeEventListener('touchstart', onDown)
        document.removeEventListener('touchmove', onMove)
        document.removeEventListener('touchend', onUp)
        active = false
    }

    function bind (tar) {
        obj = tar
        target.rotationX = obj.rotationX
        target.rotationY = obj.rotationY
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
        target.rotationX += dy / 2,
        target.rotationY -= dx / 2
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
        if (obj) {
            var dx = target.rotationX - obj.rotationX,
                dy = target.rotationY - obj.rotationY
            if (Math.abs(dx) < 0.01) {
                obj.rotationX = target.rotationX
            } else {
                obj.rotationX += dx / 8
            }
            if (Math.abs(dy) < 0.01) {
                obj.rotationY = target.rotationY
            } else {
                obj.rotationY += dy / 8
            }
        }
    }

    var pub = {
        init: init,
        remove: remove,
        bind: bind,
        update: update,
        target: target
    }

    return pub

})()