var findBlobs = require('./function/findBlobs')

onmessage = function(event) {
  var blobs = findBlobs(
    event.data.pixels,
    event.data.width,
    event.data.height,
    event.data.sensitivity,
    event.data.join_distance,
    event.data.increment,
    event.data.targets,
    event.data.heightOffset
  )

  postMessage(blobs);
};
