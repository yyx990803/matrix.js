var MX = MX || (function (undefined) {

    // ========================================================================
    //  Compatibility
    // ========================================================================

    var prefix,
        transformProp,
        transitionProp,
        transformOriginProp,
        transformStyleProp,
        perspectiveProp

    window.addEventListener('DOMContentLoaded', sniff)

    function sniff () {
        var s = document.body.style
        prefix = MX.prefix =
            'webkitTransform' in s ? 'webkit' :
            'mozTransform' in s ? 'moz' :
            'msTransform' in s ? 'ms' : null
        var t = prefix ? prefix + 'T' : 't'
        transformProp = t + 'ransform'
        transitionProp = t + 'ransition'
        transformOriginProp = t + 'ransformOrigin'
        transformStyleProp = t + 'ransformStyle'
        perspectiveProp = (prefix ? prefix + 'P' : 'p') + 'erspective'

        var vendors = ['webkit', 'moz', 'ms']
        for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
            window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame']
            window.cancelAnimationFrame =
              window[vendors[x]+'CancelAnimationFrame'] ||
              window[vendors[x]+'CancelRequestAnimationFrame']
        }
    }

    // ========================================================================
    //  Matrix Math
    // ========================================================================

    function multiplyMatrix (a, b) {
        var result = [],
            row, col,
            i = 16
        while (i--) {
            row = Math.floor(i/4)
            col = i%4
            result[i] = a[row*4] * b[col]
                + a[row*4+1] * b[4+col]
                + a[row*4+2] * b[8+col]
                + a[row*4+3] * b[12+col]
        }
        return result
    }

    function buildScaleMatrix (sx, sy, sz) {
        return [
            sx, 0, 0, 0,
            0, sy, 0, 0,
            0, 0, sz, 0,
            0, 0, 0, 1
        ]
    }

    function buildRotateMatrixX (r) {
        return [
            1, 0, 0, 0,
            0, Math.cos(r).toFixed(10), Math.sin(-r).toFixed(10), 0,
            0, Math.sin(r).toFixed(10), Math.cos(r).toFixed(10), 0,
            0, 0, 0, 1
        ]
    }

    function buildRotateMatrixY (r) {
        return [
            Math.cos(r).toFixed(10), 0, Math.sin(r).toFixed(10), 0,
            0, 1, 0, 0,
            Math.sin(-r).toFixed(10), 0, Math.cos(r).toFixed(10), 0,
            0, 0, 0, 1
        ]
    }

    function buildRotateMatrixZ (r) {
        return [
            Math.cos(r).toFixed(10), Math.sin(-r).toFixed(10), 0, 0,
            Math.sin(r).toFixed(10), Math.cos(r).toFixed(10), 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]
    }

    function buildTraslateMatrix (x, y, z) {
        return [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            x, y, z, 1
        ]
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

        this.matrix = [
            1, 0, 0, 0,
            0, 1, 0, 0,
            0, 0, 1, 0,
            0, 0, 0, 1
        ]

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

        this.dirty = false
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
                this.matrix = multiplyMatrix(this.matrix, buildScaleMatrix(this.scaleX / this.__scaleX, this.scaleY / this.__scaleY, this.scaleZ / this.__scaleZ))
                this.__scaleX = this.scaleX
                this.__scaleY = this.scaleY
                this.__scaleZ = this.scaleZ
                this.dirty = true
            }

            if (this.scale !== this.__scale) {
                var s = this.scale / this.__scale
                this.matrix = multiplyMatrix(this.matrix, buildScaleMatrix(s, s, s))
                this.__scale = this.scale
                this.dirty = true
            }

            var rx = this.rotationX !== this.__rotationX,
                ry = this.rotationY !== this.__rotationY,
                rz = this.rotationZ !== this.__rotationZ

            if (rx || ry || rz) {
                // offset the translation
                this.matrix = multiplyMatrix(this.matrix, buildTraslateMatrix(-this.__x, -this.__y, -this.__z))
                if (rx) {
                    this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixX(this.rotationX - this.__rotationX))
                    this.__rotationX = this.rotationX
                }

                if (ry) {
                    this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixY(this.rotationY - this.__rotationY))
                    this.__rotationY = this.rotationY
                }

                if (rz) {
                    this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixZ(this.rotationZ - this.__rotationZ))
                    this.__rotationZ = this.rotationZ
                }
                this.matrix = multiplyMatrix(this.matrix, buildTraslateMatrix(this.__x, this.__y, this.__z))
                this.dirty = true
            }

            if (this.x !== this.__x || this.y !== this.__y || this.z !== this.__z) {
                this.matrix = multiplyMatrix(this.matrix, buildTraslateMatrix(this.x - this.__x, this.y - this.__y, this.z - this.__z))
                this.__x = this.x
                this.__y = this.y
                this.__z = this.z
                this.dirty = true
            }

            if (this.dirty) {
                this.el.style[transformProp] = 'matrix3d(' + this.matrix.join(',') + ')'
                this.dirty = false
            }

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
        var Sub = function () {
                Super.call(this)
                props.init && props.init.apply(this, arguments)
            }
        Sub.prototype.__proto__ = Super.prototype
        for (var prop in props) {
            if (props.hasOwnProperty(prop) && prop !== 'init') {
                Sub.prototype[prop] = props[prop]
            }
        }
        Sub.extend = extend.bind(Sub)
        return Sub
    }

    // ========================================================================
    //  Expose API
    // ========================================================================

    var MX = {
        Object3D: Object3D
    }

    return MX

})()