var colourMatch = require('./colourMatch')

var PixelBuffer = function(pixels, width, height, increment) {
  this._pixelData = pixels
  this._rowSize = this._pixelData.length / height
  this._pixels = []
  this._width = width
  this._height = height
  this._increment = increment
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
  return this.get(pixel.y - this._increment, pixel.x)
}

PixelBuffer.prototype.northEast = function(pixel) {
  return this.get(pixel.y - this._increment, pixel.x + this._increment)
}

PixelBuffer.prototype.east = function(pixel) {
  return this.get(pixel.y, pixel.x + this._increment)
}

PixelBuffer.prototype.southEast = function(pixel) {
  return this.get(pixel.y + this._increment, pixel.x + this._increment)
}

PixelBuffer.prototype.south = function(pixel) {
  return this.get(pixel.y + this._increment, pixel.x)
}

PixelBuffer.prototype.southWest = function(pixel) {
  return this.get(pixel.y + this._increment, pixel.x - this._increment)
}

PixelBuffer.prototype.west = function(pixel) {
  return this.get(pixel.y, pixel.x - this._increment)
}

PixelBuffer.prototype.northWest = function(pixel) {
  return this.get(pixel.y - this._increment, pixel.x - this._increment)
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
  var joined = [].concat(blobs)

  // pixels
  var distance = join_distance

  for(var i = 0; i < joined.length; i++) {
    var blob = joined[i]

    for(var k = 0; k < joined.length; k++) {
      other = joined[k]

      if(blob == other) {
        continue
      }

      // increase the dimensions of the other group
      var dims = {
        topLeft: {
          x: other.coordinates.topLeft.x - distance,
          y: other.coordinates.topLeft.y - distance
        },
        bottomRight: {
          x: other.coordinates.bottomRight.x + distance,
          y: other.coordinates.bottomRight.y + distance
        }
      }

      // do they overlap?
      var overlap = !(
        dims.bottomRight.x < blob.coordinates.topLeft.x ||
        dims.topLeft.x > blob.coordinates.bottomRight.x ||
        dims.bottomRight.y < blob.coordinates.topLeft.y ||
        dims.topLeft.y > blob.coordinates.bottomRight.y
      )

      if(overlap) {
        // join the other group to this one
        blob.size += other.size
        blob.coordinates.topLeft.x = Math.min(blob.coordinates.topLeft.x, other.coordinates.topLeft.x)
        blob.coordinates.topLeft.y = Math.min(blob.coordinates.topLeft.y, other.coordinates.topLeft.y)
        blob.coordinates.bottomRight.x = Math.max(blob.coordinates.bottomRight.x, other.coordinates.bottomRight.x)
        blob.coordinates.bottomRight.y = Math.max(blob.coordinates.bottomRight.y, other.coordinates.bottomRight.y)

        // remove the other group from the list
        joined.splice(k, 1)
        k--
      }
    }
  }

  var output = joined.filter(function(blob) {
    return blob.size > 100
  })

  output = output.sort(function(a, b){
    return b.size - a.size
  })

  /*console.info(blobs.length, 'blobs, joined', joined.length, 'output', output.length)

  if(output.length > 0) {
    console.info('max', output[0].size, 'min', output[output.length - 1].size)
  }*/

  return joined
}

module.exports = findBlobs
