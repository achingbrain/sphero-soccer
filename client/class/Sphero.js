
Sphero = function(socket, blobEmitter) {
  this._socket = socket
  this._targetLocation = null

  blobEmitter.on('blobs', this._onBlobs)
}

Sphero.prototype._onBlobs = function(blobs) {

}

Sphero.prototype.getTargetLocation = function() {
  return this._targetLocation

  return {
    x: 100,
    y: 200,
    width: 300,
    height: 300
  }
}

module.exports = Sphero
