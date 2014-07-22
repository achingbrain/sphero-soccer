
var NUM_SEGMENTS = 4

onmessage = function(event) {
  var pixelData = event.data
  var boundary = pixelData.length / NUM_SEGMENTS
/*
  for(var i = 0; i < NUM_SEGMENTS; i++) {
    postMessage({
      section: i,
      // pixelData is an "array like" object. Sigh
      pixels: Array.prototype.slice.call(pixelData, i * boundary, (i * boundary) + boundary)
    })
  }
*/
  postMessage({
    section: 3,
    // pixelData is an "array like" object. Sigh
    pixels: Array.prototype.slice.call(pixelData, 0)
  })
}
