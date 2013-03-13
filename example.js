window.addEventListener('load', function () {

    var Box = MX.Object3D.extend({

        init: function () {
            this.el = document.createElement('div')
            this.el.classList.add('box')
            this.setTransformStyle('preserve-3d')

            var top = new MX.Object3D('div.face')
            top.rotationX = toRad(-90)
            top.y = -50

            var bottom = new MX.Object3D('div.face')
            bottom.rotationX = toRad(90)
            bottom.y = 50

            var left = new MX.Object3D('div.face')
            left.rotationY = toRad(-90)
            left.x = -50

            var right = new MX.Object3D('div.face')
            right.rotationY = toRad(90)
            right.x = 50

            var front = new MX.Object3D('div.face')
            front.z = -50

            var back = new MX.Object3D('div.face')
            back.z = 50

            this.addChild(top, bottom, left, right, front, back)
            this.update()
            this.updateChildren = false
        }

    })

    var box = new Box().appendTo('body')
    var box2 = new Box().appendTo('body')
    box2.x = -120
    box2.y = -120
    var box3 = new Box().appendTo('body')
    box3.x = 120
    box3.y = 120

    animate()
    function animate () {
        requestAnimationFrame(animate)

        box.rotationX += toRad(1)
        box.update()

        box2.rotationY += toRad(1)
        box2.update()

        box3.rotationZ += toRad(1)
        box3.update()
    }

    function toRad (deg) {
        return deg / 180 * Math.PI
    }

})