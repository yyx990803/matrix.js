// NOTE
//
// This is not a fully functional 3d scene as you might expect.
// The camera can only do pitch (rotationX) and yaw (rotationY), but no roll (rotationZ)
// because I haven't implemented alternative euler orders or quaternions.
//
// For serious 3D scenes with more functionalities you should use
// THREE.js with CSS3D Renderer.

MX.Scene = (function () {

    var add = MX.Object3D.prototype.add,
        remove = MX.Object3D.prototype.remove

    function Scene () {

        this.el = document.createElement('div')
        this.el.classList.add('mx-scene')

        var s = this.el.style

        s[MX.transformProp] = 'preserve-3d'

        s.webkitPerspectiveOrigin = '50% 50%'
        s.mozPerspectiveOrigin = '50% 50%'
        s.perspectiveOrigin = '50% 50%'

        s.webkitUserSelect = 'none'
        s.mozUserSelect = 'none'
        s.userSelect = 'none'

        s.overflow = 'hidden'

        this.inner = new MX.Object3D().addTo(this.el)
        this.inner.el.style.width = '0'
        this.inner.el.style.height = '0'

        var self = this
        var width, height, perspective

        Object.defineProperty(this, 'width', {
            get: function () {
                return width
            },
            set: function (val) {
                width = val
                self.el.style.width = val + 'px'
            }
        })

        Object.defineProperty(this, 'height', {
            get: function () {
                return height
            },
            set: function (val) {
                height = val
                self.el.style.height = val + 'px'
            }
        })

        Object.defineProperty(this, 'perspective', {
            get: function () {
                return perspective
            },
            set: function (val) {
                perspective = val
                self.el.style[MX.perspectiveProp] = val + 'px'
                self.inner.z = -val - self.camera.z
                self.inner.rotationOrigin.z = -val
            }
        })

        var cam = this.camera = new MX.Object3D()
        cam.el = null

        // cam's lookAt is a bit different
        // ignoring rotationZ
        cam.getLookAtEuler = getCameraEuler.bind(cam)

        this.inner.rotationOrigin = { x:0, y:0, z:0 }

        this.perspective = 0
    }

    Scene.prototype = {

        constructor: Scene,

        add: function () {
            add.apply(this.inner, arguments)
            return this
        },

        remove: function () {
            remove.apply(this.inner, arguments)
            return this
        },

        addTo: function (target) {
            if (typeof target === 'string') {
                target = document.querySelector(target)
            }
            if (target instanceof HTMLElement && target.appendChild) {
                target.appendChild(this.el)
            } else {
                console.warn('You can only add a Scene to an HTML element.')
            }
            return this
        },

        update: function () {
            // update inner based on camera

            var i = this.inner,
                c = this.camera

            c.update()

            i.z = -this.perspective - c.z
            i.x = -c.x
            i.y = -c.y

            i.rotationX = -c.rotationX
            i.rotationY = -c.rotationY
            //i.rotationZ = -c.rotationZ

            i.update()
            return this
        }

    }

    function getCameraEuler (target) {
        var dx = target.x - this.x,
            dy = target.y - this.y,
            dz = target.z - this.z
            r = {}
        r.y = Math.atan2(-dx, dz)
        r.x = Math.atan2(-dy, Math.sqrt(dx*dx + dz*dz))
        r.z = 0
        if (MX.rotationUnit === 'deg') {
            r.x = MX.toDeg(r.x)
            r.y = MX.toDeg(r.y)
        }
        return r
    }

    return Scene

})()