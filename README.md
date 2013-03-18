### work in progress

[Examples](http://sketch.evanyou.me/matrix/example/)

A mini CSS 3D engine. Similar to Three.js CSS3D Renderer, but less intrusive and much lighter-weight (< 300 lines), arguably faster (and of course much smaller feature set).

Originally I wanted to use matrix3d() for everything, hence the name. Ironically it turned out that using native CSS transform functions is faster than multiplying matrices in JavaScript, so I eneded up not using matrices at all.

Roughly tested on Chrome/Safari on Mac OS X Lion and iPhone 5 - the max amount of elements for 60fps performance seems to be around 200 ~ 300 depending on hardware and complexity of transforms. It does run in Firefox but as of now Firefox doesn't use GPU for CSS 3D transforms, so don't expect it to work well.