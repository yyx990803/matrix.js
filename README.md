## Work in progress

[Examples](http://sketch.evanyou.me/matrix/examples/)

A featherweight CSS 3D engine. Similar to Three.js CSS3D Renderer, but less intrusive and much lighter in weight. Better suited to add 3D stuff to a normal DOM heavy page. Doesn't provide any vector/matrix math utilities though.

### But there are (almost) no matrices in the source code!

Originally I wanted to use matrix3d() for everything, hence the name. Ironically it turned out that using native CSS transform functions is faster than multiplying matrices in JavaScript, so I eneded up only using matrices where transform functions won't do.

### Compatibility

Roughly tested on Chrome/Safari on Mac OS X Lion and iPhone 5 - the max amount of elements for 60fps performance seems to be around 200 ~ 300 depending on hardware and complexity of transforms. It does run in Firefox but as of now Firefox doesn't use GPU for CSS 3D transforms, so don't expect it to work well. Note that some examples don't have prefixes for Firefox.