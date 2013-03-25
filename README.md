## Pre-alpha work in progress!

[Examples](http://sketch.evanyou.me/matrix/examples/)

A featherweight CSS 3D engine. Similar to Three.js CSS3D Renderer, but less intrusive and much lighter in weight. Better suited to add 3D stuff to a normal DOM heavy page. Doesn't provide any vector/matrix math utilities though.

### But there are no matrices in the source code!

Originally I wanted to use matrix3d() for everything, hence the name. Ironically it turned out that using native CSS transform functions is faster than multiplying matrices in JavaScript, so I eneded up not using matrices at all.

### Compatibility

Mostly it has to do with the Browser's capability of handling CSS3D transforms. Works best in Chrome, very good in Safari (both desktop and iOS), and not so good in Firefox (not hardware accelerated and has some z-index issues). Doesn't work in IE10 because IE10 doesn't support `transform-style: preserve-3d` yet.