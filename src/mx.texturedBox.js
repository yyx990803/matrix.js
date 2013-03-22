MX.TexturedBox = MX.Object3D.extend({

    init: function (ops) {

        // width, height, depth, texture, region

        if (!ops.width || !ops.height || !ops.depth || !ops.texture) {
            console.warn('TextureBox: missing arguments')
            return
        }

        // faces
        var angle = MX.rotationUnit === 'deg' ? 90 : (Math.PI / 2),
            offsetX = ops.offset ? (ops.offset.x || 0) : 0,
            offsetY = ops.offset ? (ops.offset.y || 0) : 0

        var top = this.top = new MX.Object3D()
        top.width = ops.width
        top.height = ops.depth
        top.rotationX = angle
        top.y = ops.height / 2
        top.el.style.backgroundPosition =
            (-(offsetX + ops.depth) + 'px ') +
            (-offsetY + 'px')

        var bottom = this.bottom = new MX.Object3D()
        bottom.width = ops.width
        bottom.height = ops.depth
        bottom.rotationX = -angle
        bottom.y = -ops.height / 2
        bottom.el.style.backgroundPosition =
            (-(offsetX + ops.depth + ops.width) + 'px ') +
            (-offsetY + 'px')

        var left = this.left = new MX.Object3D()
        left.width = ops.depth
        left.height = ops.height
        left.rotationY = -angle
        left.x = -ops.width / 2
        left.el.style.backgroundPosition =
            (-offsetX + 'px ') +
            (-(offsetY + ops.depth) + 'px')

        var right = this.right = new MX.Object3D()
        right.width = ops.depth
        right.height = ops.height
        right.rotationY = angle
        right.x = ops.width / 2
        right.el.style.backgroundPosition =
            (-(offsetX + ops.depth + ops.width) + 'px ') +
            (-(offsetY + ops.depth) + 'px')

        var front = this.front = new MX.Object3D()
        front.width = ops.width
        front.height = ops.height
        front.z = -ops.depth / 2
        front.el.style.backgroundPosition =
            (-(offsetX + ops.depth) + 'px ') +
            (-(offsetY + ops.depth) + 'px')

        var back = this.back = new MX.Object3D()
        back.width = ops.width
        back.height = ops.height
        back.rotationY = angle * 2
        back.z = ops.depth / 2
        top.el.style.backgroundPosition =
            (-(offsetX + ops.depth * 2 + ops.width) + 'px ') +
            (-(offsetY + ops.depth) + 'px')

        this.add(top, bottom, left, right, front, back)

        this.children.forEach(function (c) {
            c.el.style.backgroundImage = 'url(' + ops.texture + ')'
        })

    }

})