var Object3D = Object3D || (function () {

    // all transformation matrices are 4x4 matrices represented
    // by an Array with length 16
    function multiplyMatrix (a, b) {
        var result = [],
            row, col
        for (var i = 0; i < 16; i++) {
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
            0, Math.cos(r), Math.sin(-r), 0,
            0, Math.sin(r), Math.cos(r), 0,
            0, 0, 0, 1
        ]
    }

    function buildRotateMatrixY (r) {
        return [
            Math.cos(r), 0, Math.sin(r), 0,
            0, 1, 0, 0,
            Math.sin(-r), 0, Math.cos(r), 0,
            0, 0, 0, 1
        ]
    }

    function buildRotateMatrixZ (r) {
        return [
            Math.cos(r), Math.sin(-r), 0, 0,
            Math.sin(r), Math.cos(r), 0, 0,
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

    function Object3D (el) {

        if (typeof el === 'string') {
            this.el = document.querySelector(el)
        } else if (el instanceof HTMLElement) {
            this.el = el
        }

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
    }

    Object3D.prototype.update = function () {

        if (this.x !== this.__x || this.y !== this.__y || this.z !== this.__z) {
            this.matrix = multiplyMatrix(this.matrix, buildTraslateMatrix(this.x - this.__x, this.y - this.__y, this.z - this.__z))
            this.__x = this.x
            this.__y = this.y
            this.__z = this.z
        }

        if (this.scaleX !== this.__scaleX || this.scaleY !== this.__scaleY || this.scaleZ !== this.__scaleZ) {
            this.matrix = multiplyMatrix(this.matrix, buildScaleMatrix(this.scaleX / this.__scaleX, this.scaleY / this.__scaleY, this.scaleZ / this.__scaleZ))
            this.__scaleX = this.scaleX
            this.__scaleY = this.scaleY
            this.__scaleZ = this.scaleZ
        }

        if (this.scale !== this.__scale) {
            var s = this.scale / this.__scale
            this.matrix = multiplyMatrix(this.matrix, buildScaleMatrix(s, s, s))
            this.__scale = this.scale
        }

        if (this.rotationX !== this.__rotationX) {
            this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixX(this.rotationX - this.__rotationX))
            this.__rotationX = this.rotationX
        }

        if (this.rotationY !== this.__rotationY) {
            this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixY(this.rotationY - this.__rotationY))
            this.__rotationY = this.rotationY
        }

        if (this.rotationZ !== this.__rotationZ) {
            this.matrix = multiplyMatrix(this.matrix, buildRotateMatrixZ(this.rotationZ - this.__rotationZ))
            this.__rotationZ = this.rotationZ
        }

        if (this.el) {
            this.el.style.webkitTransform = 'matrix3d(' + this.matrix.join(',') + ')'
        }

        return this

    }

    // need extend method?

    return Object3D

})()