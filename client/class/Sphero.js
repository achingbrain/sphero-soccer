var contains = require('../function/contains')

Sphero = function(socket, colour, blobEmitter) {
  this._socket = socket
  this._targetLocation = null
  this._colour = colour
  this._moving = false

  blobEmitter.on('blobs', this._onBlobs.bind(this))
}

Sphero.prototype._onBlobs = function(blobs) {
  this._ball = null

  // find the ball
  blobs.some(function(blob) {
    if(blob.target.average.hex == this._colour.average.hex) {
      this._ball = blob

      return true
    }
  }.bind(this))

  if(!this._ball) {
    return
  }

  if(this._targetLocation) {
    if(!this._moving) {
      // move the ball to the target position
    }

    // have we hit our target location yet?
    if(this._ball.coordinates.topLeft.x < this._targetLocation.x &&
      this._ball.coordinates.topLeft.y < this._targetLocation.y &&
      this._ball.coordinates.bottomRight.x > (this._targetLocation.x + this._targetLocation.width) &&
      this._ball.coordinates.bottomRight.y > (this._targetLocation.y + this._targetLocation.height)) {
      this._targetLocation = null
    }
  }
}

Sphero.prototype.getTargetLocation = function() {
  return this._targetLocation
}

Sphero.prototype.moveTo = function(x, y) {
  if(!this._ball) {
    return
  }

  var width = (this._ball.coordinates.bottomRight.x - this._ball.coordinates.topLeft.x) / 2
  var height = (this._ball.coordinates.bottomRight.y - this._ball.coordinates.topLeft.y) / 2

  this._targetLocation = {
    x: x - (width / 2),
    y: y - (height / 2),
    width: width,
    height: height
  }
}

module.exports = Sphero
