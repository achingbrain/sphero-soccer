var colourMatch = require('./colourMatch'),
  joinBlobs = require('./joinBlobs'),
  PixelBuffer = require('../class/PixelBuffer'),
  Blob = require('../class/Blob')

var findBlobs = function(pixels, width, height, sensitivity, pixel_increment, targets, heightOffset) {
  var blobs = []
  var pixelBuffer = new PixelBuffer(pixels, width, height, pixel_increment)

  for(var row = 0; row < height; row += pixel_increment) {
    for(var column = 0; column < width; column += pixel_increment) {

      targets.forEach(function(target) {
        var pixel = pixelBuffer.get(row, column)

        if(colourMatch(pixel, target, sensitivity)) {
          // do any of the surrounding pixels match the same colour?
          var west = pixelBuffer.west(pixel)
          var northWest = pixelBuffer.northWest(pixel)
          var north = pixelBuffer.north(pixel)

          var blob = west && west.blob ? west.blob :
              northWest && northWest.blob ? northWest.blob :
                north && north.blob ? north.blob : null

          // if not, create a new blob
          if(!blob) {
            blob = new Blob(target, width, height)
            blobs.push(blob)
          }

          pixel.blob = blob
          pixel.blob.add(pixel)
        }
      })
    }
  }

  // add height offset to blobs
  blobs.forEach(function(blob) {
    blob.coordinates.topLeft.y += heightOffset
    blob.coordinates.bottomRight.y += heightOffset
  })

  return blobs
}

module.exports = findBlobs
