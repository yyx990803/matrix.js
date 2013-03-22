MX.Box = MX.Object3D.extend({

    // this will be called within the contructor
    init: function (size, color, borderColor) {

        size = size || 100
        color = color || 'rgba(0, 255, 122, .1)'
        borderColor = borderColor || '#0f3'

        // an Object3D's associated DOM node is the "el" property
        this.el.classList.add('box')

        var angle = MX.rotationUnit === 'deg' ? 90 : (Math.PI / 2)

        var top = this.top = new MX.Object3D('.face')
        top.rotationX = angle
        top.y = size / 2

        var bottom = this.bottom = new MX.Object3D('.face')
        bottom.rotationX = -angle
        bottom.y = -size / 2

        var left = this.left = new MX.Object3D('.face')
        left.rotationY = -angle
        left.x = -size / 2

        var right = this.right = new MX.Object3D('.face')
        right.rotationY = angle
        right.x = size / 2

        var front = this.front = new MX.Object3D('.face')
        front.z = -size / 2

        var back = this.back = new MX.Object3D('.face')
        back.rotationY = angle * 2
        back.z = size / 2

        // adding children, must also be instances of Object3D
        this.add(top, bottom, left, right, front, back)

        this.children.forEach(function (face) {
            face.width = size - 2
            face.height = size - 2
            face.el.style.backgroundColor = color
            face.el.style.border = '1px solid ' + borderColor
        })

        // this applies the updated CSS style
        // required for any change to take effect
        // when a parent object's update() is called
        // all its children will be updated as well
        this.update()

        // if this object's children won't move by themselves
        this.updateChildren = false
    }

    // other properties will be mixed into the prototype of the new constructor

})