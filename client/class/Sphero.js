var contains = require('../function/contains')

Sphero = function(socket, colour, blobEmitter) {
  this._socket = socket
  this._targetLocation = null
  this._colour = colour

  blobEmitter.on('blobs', this._onBlobs)
}

Sphero.prototype._onBlobs = function(blobs) {
  this._ball = null

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
    // have we hit our target location yet?
    var found = blobs.some(function(blob) {
      if(blob.target.average.hex == this._colour.average.hex) {
        if(contains(blob, this._ball)) {


          return true
        }
      }
    }.bind(this))

    if(found) {
      this._targetLocation = null
    }

    return
  }
}

Sphero.prototype.getTargetLocation = function() {
  return this._targetLocation

  return {
    x: 100,
    y: 200,
    width: (this._colour.bottomRight.x - this._colour.topLeft.x) - 2,
    height: (this._colour.bottomRight.y - this._colour.topLeft.y) - 2,
  }
}

module.exports = Sphero
