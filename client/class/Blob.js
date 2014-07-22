
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

module.exports = Blob
