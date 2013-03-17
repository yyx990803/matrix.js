window.addEventListener('load', function () {

    var container = new MX.Object3D('div#container').addTo('body')

    var Box = MX.Object3D.extend({

        init: function (size) {

            this.el.classList.add('box')

            var top = new MX.Object3D('div.face')
            top.el.innerHTML = '<p class="text">Matrix.js</p>'
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

            this.add(top, bottom, left, right, front, back)

            this.scale = size / 100

            this.update()
            this.updateChildren = false
        }

    })

    var boxes = [],
        axes = ['X', 'Y', 'Z'],
        w = window.innerWidth,
        h = window.innerHeight

    for (var i = 0; i < 30; i++) {
        var box = new Box(Math.random() * 70 + 30)
        box.x = Math.random() * w - w/2
        box.y = Math.random() * h - h/2
        box.z = Math.random() * 500 - 250
        box.axis = axes[Math.floor(Math.random() * 3)]
        container.add(box)
    }

    var step = toRad(.5)

    animate()
    function animate () {
        requestAnimationFrame(animate)

        container.children.forEach(function (box) {
            box['rotation' + box.axis] += step
        })

        container.rotationX += step
        container.update()
    }

    function toRad (deg) {
        return deg / 180 * Math.PI
    }

})