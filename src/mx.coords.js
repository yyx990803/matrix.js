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
            label.style.fontSize = Math.round(size / 10) + 'px'
            this.el.appendChild(label)

            var faceA = new MX.Object3D(),
                faceB = new MX.Object3D()
            faceA.rotationX = 90
            this.add(faceA, faceB)

            this.el.style.color =
            faceA.el.style.backgroundColor = 
            faceB.el.style.backgroundColor = colors[axis]

            this.width =
            faceA.width =
            faceB.width = size

            this.height =
            faceA.height =
            faceB.height = Math.round(size / 100)

            var angle = MX.rotationUnit === 'deg' ? 90 : (Math.PI / 2)

            if (axis === 'y') {
                this.rotationZ = -angle
            } else if (axis === 'z') {
                this.rotationY = angle
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