
var PixelBuffer = function(pixels, width, height, increment) {
  this._pixelData = pixels
  this._pixelDataLength = this._pixelData.length
  this._rowSize = this._pixelDataLength / height
  this._pixels = []
  this._width = width
  this._height = height
  this._increment = increment
}

PixelBuffer.prototype.get = function(row, column) {
  var index = this._rowSize * row
  index += (column * 4)

  if(index >= this._pixelDataLength || index < 0) {
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

module.exports = PixelBuffer
