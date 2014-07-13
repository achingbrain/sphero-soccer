var PixelBuffer = function(pixels, width, height) {
  this._pixelData = pixels.data
  this._rowSize = this._pixelData.length / height
  this._pixels = []
  this._width = width
  this._height = height
}

PixelBuffer.prototype.get = function(row, column) {
  if(row < 0 || column < 0 || row > this._height || column > this._width) {
    return null
  }

  var index = this._rowSize * row
  index += (column * 4)

  if(index >= this._pixelData.length) {
    return null
  }

  var pixel = this._pixels[index]

  if(!pixel) {
    pixel = {
      red: this._pixelData[index],
      green: this._pixelData[index + 1],
      blue: this._pixelData[index + 2],
      alpha: this._pixelData[index + 3],
      x: column,
      y: row
    }

    this._pixels[index] = pixel
  }

  if(!pixel.red && pixel.red !== 0) {
    pixel.toString()
  }

  return pixel
}

PixelBuffer.prototype.north = function(pixel) {
  return this.get(pixel.y - 1, pixel.x)
}

PixelBuffer.prototype.northEast = function(pixel) {
  return this.get(pixel.y - 1, pixel.x + 1)
}

PixelBuffer.prototype.east = function(pixel) {
  return this.get(pixel.y, pixel.x + 1)
}

PixelBuffer.prototype.southEast = function(pixel) {
  return this.get(pixel.y + 1, pixel.x + 1)
}

PixelBuffer.prototype.south = function(pixel) {
  return this.get(pixel.y + 1, pixel.x)
}

PixelBuffer.prototype.southWest = function(pixel) {
  return this.get(pixel.y + 1, pixel.x - 1)
}

PixelBuffer.prototype.west = function(pixel) {
  return this.get(pixel.y, pixel.x - 1)
}

PixelBuffer.prototype.northWest = function(pixel) {
  return this.get(pixel.y - 1, pixel.x - 1)
}

var Blob = function(target, width, height) {
  this.target = target
  this.size = 0
  this.coordinates = {
    topLeft: {x: width, y: height},
    bottomRight: {x: 0, y: 0}
  }
}

Blob.prototype.add = function(pixel) {
  this.size++

  if(pixel.x < this.coordinates.topLeft.x) {
    this.coordinates.topLeft.x = pixel.x
  }

  if(pixel.y < this.coordinates.topLeft.y) {
    this.coordinates.topLeft.y = pixel.y
  }

  if(pixel.x > this.coordinates.bottomRight.x) {
    this.coordinates.bottomRight.x = pixel.x
  }

  if(pixel.y > this.coordinates.bottomRight.y) {
    this.coordinates.bottomRight.y = pixel.y
  }
}

function hasBlobForTarget(other, target) {
  if(other) {
    if(other.blob) {
      return other.blob
    }
  }

  return undefined
}

var findBlobs = function(pixels, width, height, targets) {
  var blobs = []
  var pixelBuffer = new PixelBuffer(pixels, width, height)
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
  for(var row = 0; row < height; row++) {
    for(var column = 0; column < width; column++) {

      targets.forEach(function(target) {
        if(!target) {
          return
        }

        var pixel = pixelBuffer.get(row, column)

        if(colourMatch(pixel, target)) {
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

  var output = blobs.filter(function(blob) {
    return blob.size > 10
  })

  console.info(blobs.length, 'blobs, output', output.length)

  return output
}

module.exports = findBlobs
