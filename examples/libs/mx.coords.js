MX.Coords = (function () {

    var colors = {
        x: '#f33',
        y: '#3f3',
        z: '#66f'
    }

    var Axis = MX.Object3D.extend({
        init: function (axis, size) {

            var label = document.createElement('span')
            label.textContent = axis.toUpperCase()
            label.style.position = 'absolute'
            label.style.right = '0px'
            label.style.bottom = '3px'
            this.el.appendChild(label)

            var faceA = new MX.Object3D(),
                faceB = new MX.Object3D()
            faceA.rotationX = 90
            this.add(faceA, faceB)

            this.el.style.color =
            faceA.el.style.backgroundColor = 
            faceB.el.style.backgroundColor = colors[axis]

            this.el.style.width =
            faceA.el.style.width =
            faceB.el.style.width = size + 'px'

            this.el.style.height =
            faceA.el.style.height =
            faceB.el.style.height = Math.round(size / 100) + 'px'

            if (axis === 'y') {
                this.rotationZ = -90
            } else if (axis === 'z') {
                this.rotationY = 90
            }
        }
    })

    var Coords = MX.Object3D.extend({
        init: function (size) {
            size = size || 100
            var x = new Axis('x', size),
                y = new Axis('y', size),
                z = new Axis('z', size)
            this.add(x, y, z)
            this.update()
            this.updateChildren = false
        }
    })

    return Coords

})()