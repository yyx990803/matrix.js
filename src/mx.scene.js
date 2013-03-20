MX.Scene = (function () {

    var add = MX.Object3D.prototype.add,
        remove = MX.Object3D.prototype.remove

    function Scene () {

        this.el = document.createElement('div')
        this.el.classList.add('mx-scene')

        this.el.style.overflow = 'hidden'
        this.el.style[MX.transformProp] = 'preserve-3d'
        this.el.style.WebkitPerspectiveOrigin = '50% 50%'
        this.el.style.MozPerspectiveOrigin = '50% 50%'
        this.el.style.perspectiveOrigin = '50% 50%'

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
            }
        })

        this.camera = new MX.Object3D()
        this.camera.el = null
        this.inner.rotationOrigin = this.camera
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
            i.rotationZ = -c.rotationZ

            i.update()
            return this
        }

    }

    return Scene

})()