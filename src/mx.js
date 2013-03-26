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
        version: '0.1.0',
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
        perspectiveProp,
        transitionEndEvent

    var positionAtCenter = true, // whether to auto center objects
        centeringCSS // styles to inject for center positioning

    document.addEventListener('DOMContentLoaded', setup)

    function setup () {

        // sniff prefix

        var s = document.body.style

        MX.prefix =
            'webkitTransform' in s ? 'webkit' :
            'mozTransform' in s ? 'moz' :
            'msTransform' in s ? 'ms' : ''
            
        transformProp       = MX.transformProp       = addPrefix('transform')
        transitionProp      = MX.transitionProp      = addPrefix('transition')
        transformOriginProp = MX.transformOriginProp = addPrefix('transformOrigin')
        transformStyleProp  = MX.transformStyleProp  = addPrefix('transformStyle')
        perspectiveProp     = MX.perspectiveProp     = addPrefix('perspective')
        transitionEndEvent  = MX.transitionEndEvent  = MX.prefix === 'webkit' ? 'webkitTransitionEnd' : 'transitionend'

        // shiv rAF

        var vendors = ['webkit', 'moz', 'ms']
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] ||
              window[vendors[x]+'CancelRequestAnimationFrame']
        }

        // inject centering css

        centeringCSS = document.createElement('style')
        centeringCSS.type = 'text/css'
        centeringCSS.innerHTML =
            '.mx-object3d {'
            + 'position: absolute;'
            + 'top: 50%;'
            + 'left: 50%;}'
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

    function buildRotationTranslation (obj) {

        // used when rotationOrigin is set

        var origin = obj.rotationOrigin
        if (!origin) {
            return
        } else {
            var dx = origin.x - obj.x,
                dy = -(origin.y - obj.y),
                dz = -(origin.z - obj.z)
            return {
                before: 'translate3d(' + dx +'px,' + dy + 'px,' + dz + 'px) ',
                after: 'translate3d(' + (-dx) + 'px,' + (-dy) + 'px,' + (-dz) + 'px) '
            }
        }
    }

    function addPrefix (string) {
        if (MX.prefix) {
            string = MX.prefix + string.charAt(0).toUpperCase() + string.slice(1)
        }
        return string
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

        this.inverseLookAt  = false

        this.reset()

        var width, height,
            self = this

        Object.defineProperty(this, 'width', {
            get: function () {
                return width
                    || parseInt(self.el.style.width, 10)
                    || 0
            },
            set: function (val) {
                width = val
                this.el.style.width = width + 'px'
            }
        })

        Object.defineProperty(this, 'height', {
            get: function () {
                return height
                    || parseInt(self.el.style.height, 10)
                    || 0
            },
            set: function (val) {
                height = val
                this.el.style.height = height + 'px'
            }
        })
    }

    Object3D.prototype = {

        constructor: Object3D,

        reset: function () {
            this.x = this.__x                       = 0
            this.y = this.__y                       = 0
            this.z = this.__z                       = 0
            this.rotationX = this.__rotationX       = 0
            this.rotationY = this.__rotationY       = 0
            this.rotationZ = this.__rotationZ       = 0
            this.scaleX = this.__scaleX             = 1
            this.scaleY = this.__scaleY             = 1
            this.scaleZ = this.__scaleZ             = 1
            this.scale = this.__scale               = 1
            this.perspective = this.__perspective   = 0
            this.rotationOrigin                     = undefined
            this.followTarget                       = undefined
            this.dirty                              = true
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

            if (this.perspective !== this.__perspective) {
                this.__perspective = this.perspective
                this.dirty = true
            }

            if (this.dirty && this.el) {

                var rotationTranslation = buildRotationTranslation(this),
                    rotation = 'rotateX(' + this.rotationX.toFixed(floatPrecision) + MX.rotationUnit + ') '
                        + 'rotateY(' + this.rotationY.toFixed(floatPrecision) + MX.rotationUnit + ') '
                        + 'rotateZ(' + this.rotationZ.toFixed(floatPrecision) + MX.rotationUnit + ') '

                var transformString =
                    (MX.positionAtCenter ? 'translate3d(-50%, -50%, 0) ' : '')
                    + (this.perspective ? 'perspective(' + this.perspective + 'px) ' : '')
                    + 'translate3d('
                        + this.x.toFixed(floatPrecision) + 'px,'
                        + (-this.y).toFixed(floatPrecision) + 'px,'
                        + (-this.z).toFixed(floatPrecision) + 'px) '
                    + 'scale3d('
                        + this.scaleX.toFixed(floatPrecision) + ','
                        + this.scaleY.toFixed(floatPrecision) + ','
                        + this.scaleZ.toFixed(floatPrecision) + ') '

                if (rotationTranslation) {
                    transformString += rotationTranslation.before
                        + rotation
                        + rotationTranslation.after

                } else {
                    transformString += rotation
                }
                    
                this.el.style[transformProp] = transformString
                this.dirty = false
            }

            return this

        },

        lookAt: function (target, update) {
            var r = this.getLookAtEuler(target)
            this.setRotation(r)
            if (update !== false) this.update()
            return this
        },

        getLookAtEuler: function (target) {
            // euler order XYZ
            var r = {},
                dx = target.x - this.x,
                dy = target.y - this.y,
                dz = target.z - this.z
            if (this.inverseLookAt) {
                dx = -dx
                dy = -dy
                dz = -dz
            }
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
                if (!child instanceof Object3D) return
                parent.el.appendChild(child.el)
                if (!parent.children) parent.children = []
                parent.children.push(child)
                child.parent = parent
            })
            return this
        },

        remove: function () {
            var parent = this
            Array.prototype.forEach.call(arguments, function (child) {
                var index = parent.children.indexOf(child)
                if (index !== -1) {
                    parent.children.splice(index, 1)
                    child.parent = undefined
                }
            })
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

        removeElement: function () {
            if (this.el.parentNode) {
                this.el.parentNode.removeChild(this.el)
            }
        },

        setPosition: function (tar) {
            this.x = (tar.x || tar.x === 0) ? tar.x : this.x
            this.y = (tar.y || tar.y === 0) ? tar.y : this.y
            this.z = (tar.z || tar.z === 0) ? tar.z : this.z
        },

        setRotation: function (tar) {
            this.rotationX = (tar.x || tar.x === 0) ? tar.x : this.rotationX
            this.rotationY = (tar.y || tar.y === 0) ? tar.y : this.rotationY
            this.rotationZ = (tar.z || tar.z === 0) ? tar.z : this.rotationZ
        },

        setScale: function (tar) {
            this.scaleX = (tar.x || tar.x === 0) ? tar.x : this.scaleX
            this.scaleY = (tar.y || tar.y === 0) ? tar.y : this.scaleY
            this.scaleZ = (tar.z || tar.z === 0) ? tar.z : this.scaleZ
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
        },

        onTransitionEnd: function (callback) {
            this.cancelTransitionEnd()
            var el = this.el
            el.addEventListener(transitionEndEvent, onEnd)
            function onEnd () {
                el.removeEventListener(transitionEndEvent, onEnd)
                callback()
            }
        },

        cancelTransitionEnd: function () {
            this.el.removeEventListener(transitionEndEvent)
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
    MX.toRad = toRad
    MX.toDeg = toDeg

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