/**
 * Copyright (C) 2013 by Evan You
 *
 * Permission is hereby granted, free of charge, to any person obtaining a copy
 * of this software and associated documentation files (the "Software"), to deal
 * in the Software without restriction, including without limitation the rights
 * to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
 * copies of the Software, and to permit persons to whom the Software is
 * furnished to do so, subject to the following conditions:
 *
 * The above copyright notice and this permission notice shall be included in
 * all copies or substantial portions of the Software.
 *
 * THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
 * IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
 * FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
 * AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
 * LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
 * OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
 * THE SOFTWARE.
 */

var MX = MX || (function (undefined) {

    var MX = {
        prefix: undefined,
        rotationUnit: 'rad'
    }

    var floatPrecision = 5

    // ========================================================================
    //  Setup & Compatibility
    // ========================================================================

    var transformProp,
        transitionProp,
        transformOriginProp,
        transformStyleProp,
        perspectiveProp

    var positionAtCenter = true, // whether to auto center objects
        centeringCSS // styles to inject for center positioning

    document.addEventListener('DOMContentLoaded', setup)

    function setup () {

        var s = document.body.style

        MX.prefix =
            'webkitTransform' in s ? 'webkit' :
            'mozTransform' in s ? 'moz' :
            'msTransform' in s ? 'ms' : null

        var t = MX.prefix ? MX.prefix + 'T' : 't'
        transformProp       = t + 'ransform'
        transitionProp      = t + 'ransition'
        transformOriginProp = t + 'ransformOrigin'
        transformStyleProp  = t + 'ransformStyle'
        perspectiveProp     = (MX.prefix ? MX.prefix + 'P' : 'p') + 'erspective'

        var vendors = ['webkit', 'moz', 'ms']
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] ||
              window[vendors[x]+'CancelRequestAnimationFrame']
        }

        centeringCSS = document.createElement('style')
        centeringCSS.type = 'text/css'
        centeringCSS.innerHTML =
            '.mx-object3d {\
                position: absolute;\
                top: 50%;\
                left: 50%;\
            }'
        injectCenteringCSS()
    }

    function injectCenteringCSS () {
        document.head.appendChild(centeringCSS)
    }

    function removeCenteringCSS () {
        document.head.removeChild(centeringCSS)
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

        this.setupDomElement(el)
        this.setCSSTransformStyle('preserve-3d')
        this.el.classList.add('mx-object3d')

        this.parent         = undefined
        this.children       = []
        this.updateChildren = true

        this.reset()
    }

    Object3D.prototype = {

        constructor: Object3D,

        reset: function () {
            this.x = this.__x                   = 0
            this.y = this.__y                   = 0
            this.z = this.__z                   = 0
            this.rotationX = this.__rotationX   = 0
            this.rotationY = this.__rotationY   = 0
            this.rotationZ = this.__rotationZ   = 0
            this.scaleX = this.__scaleX         = 1
            this.scaleY = this.__scaleY         = 1
            this.scaleZ = this.__scaleZ         = 1
            this.scale = this.__scale           = 1
            this.rotationTranslation            = undefined
            this.followTarget                     = undefined
            this.dirty                          = true
            this.update()
        },

        setupDomElement: function (el) {
            this.el = undefined
            if (el instanceof HTMLElement) {
                this.el = el
            } else if (typeof el === 'string') {
                var tag     = el.match(/^[^.#\s]*/)[1],
                    id      = el.match(/#[^.#\s]*/),
                    classes = el.match(/\.[^.#\s]*/g)
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
        },

        update: function () {

            if (this.updateChildren) {
                var i = this.children.length
                while (i--) {
                    this.children[i].update()
                }
            }

            if (this.followTarget) {
                this.lookAt(this.followTarget, false)
            }

            if (this.scaleX !== this.__scaleX ||
                this.scaleY !== this.__scaleY ||
                this.scaleZ !== this.__scaleZ) {
                    this.__scaleX = this.scaleX
                    this.__scaleY = this.scaleY
                    this.__scaleZ = this.scaleZ
                    this.dirty = true
            }

            if (this.scale !== this.__scale) {
                this.scaleX =
                this.scaleY =
                this.scaleZ =
                this.__scaleX =
                this.__scaleY =
                this.__scaleZ =
                this.__scale =
                    this.scale
                this.dirty = true
            }

            if (this.rotationX !== this.__rotationX ||
                this.rotationY !== this.__rotationY ||
                this.rotationZ !== this.__rotationZ) {
                    this.__rotationX = this.rotationX
                    this.__rotationY = this.rotationY
                    this.__rotationZ = this.rotationZ
                    this.dirty = true
            }

            if (this.x !== this.__x ||
                this.y !== this.__y ||
                this.z !== this.__z) {
                this.__x = this.x
                this.__y = this.y
                this.__z = this.z
                this.dirty = true
            }

            if (this.dirty && this.el) {
                this.el.style[transformProp] = (MX.positionAtCenter ? 'translate3d(-50%, -50%, 0) ' : '')
                    + 'translate3d('
                        + this.x.toFixed(floatPrecision) + 'px,'
                        + (-this.y).toFixed(floatPrecision) + 'px,'
                        + (-this.z).toFixed(floatPrecision) + 'px) '
                    + 'scale3d('
                        + this.scaleX.toFixed(floatPrecision) + ','
                        + this.scaleY.toFixed(floatPrecision) + ','
                        + this.scaleZ.toFixed(floatPrecision) + ') '
                    + (this.rotationTranslation ? this.rotationTranslation.before : '')
                    + 'rotateX(' + this.rotationX.toFixed(floatPrecision) + MX.rotationUnit + ') '
                    + 'rotateY(' + this.rotationY.toFixed(floatPrecision) + MX.rotationUnit + ') '
                    + 'rotateZ(' + this.rotationZ.toFixed(floatPrecision) + MX.rotationUnit + ') '
                    + (this.rotationTranslation ? this.rotationTranslation.after : '')
                this.dirty = false
            }

            return this

        },

        lookAt: function (target, update) {
            var r = this.getLookAtEuler(target)
            this.rotationX = r.x
            this.rotationY = r.y
            this.rotationZ = r.z
            if (update !== false) this.update()
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

        follow: function (target) {
            this.followTarget = target
            return this
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
            } else if (target instanceof Object3D || target instanceof Scene) {
                target.add(this)
            }
            return this
        },

        setRotationOrigin: function (origin) {
            if (!origin) {
                this.rotationTranslation = undefined
                return this
            }
            var dx = origin.x - this.x,
                dy = -(origin.y - this.y),
                dz = -(origin.z - this.z)
            this.rotationTranslation = {
                before: 'translate3d(' + dx +'px,' + dy + 'px,' + dz + 'px) ',
                after: 'translate3d(' + (-dx) + 'px,' + (-dy) + 'px,' + (-dz) + 'px) '
            }
            return this
        },

        setCSSTransformOrigin: function (origin) {
            this.el && (this.el.style[transformOriginProp] = origin)
            return this
        },

        setCSSTransformStyle: function (style) {
            this.el && (this.el.style[transformStyleProp] = style)
            return this
        },

        setCSSTransition: function (trans) {
            this.el && (this.el.style[transitionProp] = trans)
            return this
        },

        setCSSPerspective: function (pers) {
            this.el && (this.el.style[perspectiveProp] = pers)
            return this
        }

    }

    // ========================================================================
    //  Scene
    // ========================================================================

    function Scene () {

        this.el = document.createElement('div')
        this.el.classList.add('mx-scene')

        this.el.style.overflow = 'hidden'
        this.el.style[transformProp] = 'preserve-3d'
        this.el.style.WebkitPerspectiveOrigin = '50% 50%'
        this.el.style.MozPerspectiveOrigin = '50% 50%'
        this.el.style.perspectiveOrigin = '50% 50%'

        this.inner = new Object3D().addTo(this.el)
        this.inner.el.style.width = '0'
        this.inner.el.style.height = '0'

        var self = this
        var width, height, perspective

        Object.defineProperty(this, 'width', {
            get: function () {
                return width
            },
            set: function (val) {
                if (typeof val !== 'number') return
                width = val
                self.el.style.width = val + 'px'
            }
        })

        Object.defineProperty(this, 'height', {
            get: function () {
                return height
            },
            set: function (val) {
                if (typeof val !== 'number') return
                height = val
                self.el.style.height = val + 'px'
            }
        })

        Object.defineProperty(this, 'perspective', {
            get: function () {
                return perspective
            },
            set: function (val) {
                if (typeof val !== 'number') return
                perspective = val
                self.el.style[perspectiveProp] = val + 'px'
                self.inner.z = -val - self.camera.z
            }
        })

        this.camera = new Object3D()
        this.camera.el = null
        this.inner.setRotationOrigin(this.camera)

    }

    Scene.prototype = {

        constructor: Scene,

        add: function () {
            Object3D.prototype.add.apply(this.inner, arguments)
            return this
        },

        remove: function () {
            Object3D.prototype.remove.apply(this.inner, arguments)
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
    MX.Scene = Scene

    // center positioning getter setter
    Object.defineProperty(MX, 'positionAtCenter', {
        get: function () {
            return positionAtCenter
        },
        set: function (val) {
            if (typeof val !== 'boolean') return
            positionAtCenter = val
            if (positionAtCenter) {
                injectCenteringCSS()
            } else {
                removeCenteringCSS()
            }
        }
    })

    return MX

})()