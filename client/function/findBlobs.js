var colourMatch = require('./colourMatch'),
  joinBlobs = require('./joinBlobs'),
  PixelBuffer = require('../class/PixelBuffer'),
  Blob = require('../class/Blob')

function hasBlobForTarget(other, target) {
  if(other) {
    if(other.blob) {
      return other.blob
    }
  }

  return undefined
}

var findBlobs = function(pixels, width, height, sensitivity, join_distance, pixel_increment, targets) {
  var blobs = []
  var pixelBuffer = new PixelBuffer(pixels, width, height, pixel_increment)
/*
  var otherCanvas = document.getElementById('c2')
  var otherContext = otherCanvas.getContext('2d')
  var otherPixelData = otherContext.getImageData(0, 0, width, height);
  var otherRowSize = otherPixelData.data.length / height

  for(var row = 0; row < height; row++) {
    for(var column = 0; column < width; column++) {
      var pixel = pixelBuffer.get(row, column)

      var offset = otherRowSize * row
      offset += (column * 4)

      otherPixelData.data[offset] = pixel.red
      otherPixelData.data[offset + 1] = pixel.green
      otherPixelData.data[offset + 2] = pixel.blue
      otherPixelData.data[offset + 3] = pixel.alpha
    }
  }

  otherContext.putImageData(otherPixelData, 0, 0);
*/
  for(var row = 0; row < height; row += pixel_increment) {
    for(var column = 0; column < width; column += pixel_increment) {

      targets.forEach(function(target) {
        if(!target) {
          return
        }

        var pixel = pixelBuffer.get(row, column)

        if(colourMatch(pixel, target, sensitivity)) {
          // do any of the surrounding pixels match the same colour?
          var west = pixelBuffer.west(pixel)
          var northWest = pixelBuffer.northWest(pixel)
          var north = pixelBuffer.north(pixel)

          var blob = hasBlobForTarget(west, target) ||
            hasBlobForTarget(northWest, target) ||
            hasBlobForTarget(north, target)

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

  // join blobs together if they are close
  return joinBlobs(join_distance, blobs)
}

module.exports = findBlobs
