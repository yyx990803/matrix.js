window.addEventListener('load', function () {

    // function Card (el) {
    //     MX.Object3D.call(this, el)
    //     this.el.classList.add('card')
    // }

    // Card.prototype = {

    //     __proto__: MX.Object3D.prototype,

    //     spin: function () {
    //         var o = this
    //         o.rotationX += toRad(2)
    //         o.rotationY += toRad(1)
    //         o.rotationZ += toRad(1)
    //         o.x += .2
    //         o.y += .2
    //         o.z -= .2
    //         //o.scaleX += 0.005
    //         //o.scale += 0.005
    //     }

    // }

    var Card = MX.Object3D.extend({
        init: function (el) {
            this.el = el || document.createElement('div')
            this.el.classList.add('card')
            this.setTransformStyle('preserve-3d')
        },
        spin: function () {
            var o = this
            o.rotationX += toRad(2)
            o.rotationY += toRad(1)
            o.rotationZ += toRad(1)
            o.x += .2
            o.y += .2
            o.z -= .2
            //o.scaleX += 0.005
            //o.scale += 0.005
        }
    })

    var o = new Card(),
        p = new Card()

    o.addChild(p)

    document.body.appendChild(o.el)

    animate()
    function animate () {
        requestAnimationFrame(animate)
        p.spin()
        o.spin()
        o.update()
    }

    function toRad (deg) {
        return deg / 180 * Math.PI
    }

})