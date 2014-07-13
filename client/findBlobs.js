var PixelBuffer = function(pixels, width, height) {
  this._pixelData = pixels.data
  this._rowIndex = 0
  this._columnIndex = 0

  this._rowSize = this._pixelData.length / height
  this._pixels = []
}

PixelBuffer.prototype.get = function(row, column) {
  var index = this._rowSize * row
  index += (column * 4)

  if(!this._pixels[index]) {
    this._pixels[index] = {
      red: this._pixelData[index],
      green: this._pixelData[index + 1],
      blue: this._pixelData[index + 2],
      alpha: this._pixelData[index + 3],
      x: row,
      y: column
    }
  }

  return this._pixels[index]
}

PixelBuffer.prototype.north = function(pixel) {
  return this.get(pixel.x - 1, pixel.y)
}

PixelBuffer.prototype.northEast = function(pixel) {
  return this.get(pixel.x - 1, pixel.y + 1)
}

PixelBuffer.prototype.east = function(pixel) {
  return this.get(pixel.x, pixel.y + 1)
}

PixelBuffer.prototype.southEast = function(pixel) {
  return this.get(pixel.x + 1, pixel.y + 1)
}

PixelBuffer.prototype.south = function(pixel) {
  return this.get(pixel.x + 1, pixel.y)
}

PixelBuffer.prototype.southWest = function(pixel) {
  return this.get(pixel.x + 1, pixel.y - 1)
}

PixelBuffer.prototype.west = function(pixel) {
  return this.get(pixel.x, pixel.y - 1)
}

PixelBuffer.prototype.northWest = function(pixel) {
  return this.get(pixel.x - 1, pixel.y - 1)
}

var Blob = function(target) {
  this.target = target
  this._size = 0
  this._topLeft = {x: 1280, y: 720}
  this._bottomRight = {x: 0, y: 0}

  Object.defineProperty(this, 'size', {
    get: function() {
      return this._size
    }.bind(this)
  })

  Object.defineProperty(this, 'coordinates', {
    get: function() {
      return [this._topLeft, this._bottomRight]
    }.bind(this)
  })
}

Blob.prototype.add = function(pixel) {
  this._size++

  if(pixel.x < this._topLeft.x) {
    this._topLeft.x = pixel.x
  }

  if(pixel.y < this._topLeft.y) {
    this._topLeft.y = pixel.y
  }

  if(pixel.x > this._bottomRight.x) {
    this._bottomRight.x = pixel.x
  }

  if(pixel.y > this._bottomRight.y) {
    this._bottomRight.y = pixel.y
  }
}

function hasBlobForTarget(other, target) {
  if(other && other.blob) {
    return other.blob
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
          var blob = hasBlobForTarget(pixelBuffer.north(pixel), target) ||
            hasBlobForTarget(pixelBuffer.northEast(pixel), target) ||
            hasBlobForTarget(pixelBuffer.east(pixel), target) ||
            hasBlobForTarget(pixelBuffer.southEast(pixel), target) ||
            hasBlobForTarget(pixelBuffer.south(pixel), target) ||
            hasBlobForTarget(pixelBuffer.southWest(pixel), target) ||
            hasBlobForTarget(pixelBuffer.west(pixel), target) ||
            hasBlobForTarget(pixelBuffer.northWest(pixel), target)

          // if not, create a new blob
          if(!blob) {
            blob = new Blob(target)
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
