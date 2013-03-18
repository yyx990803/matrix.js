var MX = MX || (function (undefined) {

    var MX = {
        prefix: undefined,
        rotationUnit: 'rad',
        positionAtCenter: true
    }

    // ========================================================================
    //  Compatibility
    // ========================================================================

    var transformProp,
        transitionProp,
        transformOriginProp,
        transformStyleProp,
        perspectiveProp

    document.addEventListener('DOMContentLoaded', sniff)

    function sniff () {
        var s = document.body.style
        MX.prefix =
            'webkitTransform' in s ? 'webkit' :
            'mozTransform' in s ? 'moz' :
            'msTransform' in s ? 'ms' : null
        var t = MX.prefix ? MX.prefix + 'T' : 't'
        transformProp = t + 'ransform'
        transitionProp = t + 'ransition'
        transformOriginProp = t + 'ransformOrigin'
        transformStyleProp = t + 'ransformStyle'
        perspectiveProp = (MX.prefix ? MX.prefix + 'P' : 'p') + 'erspective'

        var vendors = ['webkit', 'moz', 'ms']
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] ||
              window[vendors[x]+'CancelRequestAnimationFrame']
        }
    }

    // ========================================================================
    //  Utils
    // ========================================================================

    function toDeg (rad) {
        return rad / Math.PI * 180
    }

    function toRad (deg) {
        return deg / 180 * Math.PI
    }

    // ========================================================================
    //  Base Object3D
    // ========================================================================

    function Object3D (el) {

        this.el = undefined

        if (el instanceof HTMLElement) {
            this.el = el
        } else if (typeof el === 'string') {
            var tag = el.match(/^[^.#\s]*/)[1],
                classes = el.match(/\.[^.#\s]*/g),
                id = el.match(/#[^.#\s]*/)
            this.el = document.createElement(tag || 'div')
            if (id) {
                this.el.id = id[0].slice(1)
            }
            if (classes) {
                var i = classes.length
                while (i--) {
                    this.el.classList.add(classes[i].slice(1))
                }
            }
        } else {
            this.el = document.createElement('div')
        }

        this.setTransformStyle('preserve-3d')
        this.el.classList.add('mx-object3d')

        this.x = this.__x = 0
        this.y = this.__y = 0
        this.z = this.__z = 0
        this.rotationX = this.__rotationX = 0
        this.rotationY = this.__rotationY = 0
        this.rotationZ = this.__rotationZ = 0
        this.scaleX = this.__scaleX = 1
        this.scaleY = this.__scaleY = 1
        this.scaleZ = this.__scaleZ = 1
        this.scale = this.__scale = 1

        this.children = []
        this.updateChildren = true

        this.parent = undefined

        this.dirty = true
    }

    Object3D.prototype = {

        constructor: Object3D,

        update: function () {

            if (this.updateChildren) {
                var i = this.children.length
                while (i--) {
                    this.children[i].update()
                }
            }

            if (this.scaleX !== this.__scaleX || this.scaleY !== this.__scaleY || this.scaleZ !== this.__scaleZ) {
                this.__scaleX = this.scaleX
                this.__scaleY = this.scaleY
                this.__scaleZ = this.scaleZ
                this.dirty = true
            }

            if (this.scale !== this.__scale) {
                this.__scale = this.__scaleX = this.__scaleY = this.__scaleZ = this.scaleX = this.scaleY = this.scaleZ = this.scale
                this.dirty = true
            }

            if (this.rotationX !== this.__rotationX || this.rotationY !== this.__rotationY || this.rotationZ !== this.__rotationZ) {
                this.__rotationX = this.rotationX
                this.__rotationY = this.rotationY
                this.__rotationZ = this.rotationZ
                this.dirty = true
            }

            if (this.x !== this.__x || this.y !== this.__y || this.z !== this.__z) {
                this.__x = this.x
                this.__y = this.y
                this.__z = this.z
                this.dirty = true
            }

            if (this.dirty) {
                this.el.style[transformProp] = (MX.positionAtCenter ? 'translate3d(-50%, -50%, 0) ' : '') +
                    'translate3d(' + this.x.toFixed(5) + 'px,' + (-this.y).toFixed(5) + 'px,' + (-this.z).toFixed(5) + 'px) '
                    + 'scale3d(' + this.scaleX.toFixed(5) + ',' + this.scaleY.toFixed(5) + ',' + this.scaleZ.toFixed(5) + ') '
                    + 'rotateX(' + this.rotationX.toFixed(5) + MX.rotationUnit + ') '
                    + 'rotateY(' + this.rotationY.toFixed(5) + MX.rotationUnit + ') '
                    + 'rotateZ(' + this.rotationZ.toFixed(5) + MX.rotationUnit + ')'
                this.dirty = false
            }

            return this

        },

        lookAt: function (target) {
            var r = this.getLookAtEuler(target)
            this.rotationX = r.x
            this.rotationY = r.y
            this.rotationZ = r.z
            this.update()
            return this
        },

        getLookAtEuler: function (target) {
            // euler order XYZ
            var r = {},
                dx = target.x - this.x,
                dy = target.y - this.y,
                dz = target.z - this.z
            if (dz === 0) dz = 0.001
            r.x = -Math.atan2(dy, dz)
            var flip = dz > 0 ? 1 : -1
            r.y = flip * Math.atan2(dx * Math.cos(r.x), dz * -flip)
            r.z = Math.atan2(Math.cos(r.x), Math.sin(r.x) * Math.sin(r.y)) - Math.PI / 2
            if (MX.rotationUnit === 'deg') {
                r.x = toDeg(r.x)
                r.y = toDeg(r.y)
                r.z = toDeg(r.z)
            }
            return r
        },

        add: function () {
            if (!this.el) return
            var parent = this
            Array.prototype.forEach.call(arguments, function (child) {
                parent.el.appendChild(child.el)
                if (!parent.children) parent.children = []
                parent.children.push(child)
                child.parent = parent
            })
            return this
        },

        remove: function (child) {
            var index = this.children.indexOf(child)
            if (index !== -1) {
                this.children.splice(index, 1)
                child.parent = undefined
            }
            return this
        },

        addTo: function (target) {
            if (typeof target === 'string') {
                target = document.querySelector(target)
            }
            if (target instanceof HTMLElement && target.appendChild) {
                target.appendChild(this.el)
            } else if (target instanceof Object3D) {
                target.add(this)
            }
            return this
        },

        setTransformOrigin: function (origin) {
            this.el && (this.el.style[transformOriginProp] = origin)
            return this
        },

        setTransformStyle: function (style) {
            this.el && (this.el.style[transformStyleProp] = style)
            return this
        },

        setTransition: function (trans) {
            this.el && (this.el.style[transitionProp] = trans)
            return this
        },

        setPerspective: function (pers) {
            this.el && (this.el.style[perspectiveProp] = pers)
            return this
        }

    }

    // ========================================================================
    //  Inheritance
    // ========================================================================

    Object3D.extend = extend.bind(Object3D)

    function extend (props) {
        var Super = this
        var ExtendedObject3D = function () {
                Super.call(this)
                props.init && props.init.apply(this, arguments)
            }
        ExtendedObject3D.prototype = Object.create(Super.prototype)
        for (var prop in props) {
            if (props.hasOwnProperty(prop) && prop !== 'init') {
                ExtendedObject3D.prototype[prop] = props[prop]
            }
        }
        ExtendedObject3D.extend = extend.bind(ExtendedObject3D)
        return ExtendedObject3D
    }

    // ========================================================================
    //  Expose API
    // ========================================================================

    MX.Object3D = Object3D

    return MX

})()