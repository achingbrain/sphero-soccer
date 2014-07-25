var contains = require('../function/contains')

Sphero = function(socket, colour, blobEmitter, width, height) {
  this._socket = socket
  this._targetLocation = null
  this._colour = colour
  this._movementVector = false
  this._height = height
  this._width = width
  this._movementInterval = null
  this._ballDegrees = 0
  this._movementInfo = {}

  blobEmitter.on('blobs', this._onBlobs.bind(this))
}

Sphero.prototype._onBlobs = function(blobs) {
  this._lastBall = this._ball
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

  this._movementInfo.currentPosition = this._ball.center

  if(this._movementInfo.target) {
    // how far from the edge before we stop
    var gap = 10

    // if we are about to go out of bounds, stop
    if(this._ball.coordinates.topLeft.x <= gap ||
      this._ball.coordinates.topLeft.y <= gap ||
      this._ball.coordinates.bottomRight.x >= (this._width - gap) ||
      this._ball.coordinates.bottomRight.y >= (this._height - gap)) {

      this._stop()

      return
    }

    // have we hit our target location yet?
    if(this._ball.coordinates.topLeft.x < this._movementInfo.target.x &&
      this._ball.coordinates.topLeft.y < this._movementInfo.target.y &&
      this._ball.coordinates.bottomRight.x > (this._movementInfo.target.x + this._movementInfo.target.width) &&
      this._ball.coordinates.bottomRight.y > (this._movementInfo.target.y + this._movementInfo.target.height)) {

      this._stop()

      return
    }

    // move the ball to the target position
    this._movementInfo.targetVector = {
      start: this._ball.center,
      end: this._movementInfo.target.center
    }

    if(this._lastBall) {
      // http://www.mathsisfun.com/equation_of_line.html
      // y = mx + c
      // m = gradient
      // c = y-intercept
      // c = y - mx

      var gradient = (this._ball.center.y - this._lastBall.center.y) /
        (this._ball.center.x - this._lastBall.center.x)

      var c = this._ball.center.y - (gradient * this._ball.center.x)

      this._movementInfo.currentVector = {
        start: {
          x: 0,
          y: parseInt(c, 10)
        },
        end: {
          x: 1280,
          y: parseInt((gradient * 1280) + c, 10)
        }
      }

      // moving in the other direction..
      if(this._ball.center.x < this._lastBall.center.x) {
        var end = this._movementInfo.currentVector.end

        this._movementInfo.currentVector.end = this._movementInfo.currentVector.start
        this._movementInfo.currentVector.start = end
      }
    }

    if(!this._movementInterval) {
      this._movementInterval = setInterval(function() {
        if(this._lastBall && this._ball) {
          var angle = this._findAngle(this._movementInfo.currentVector.end, this._ball.center, this._movementInfo.targetVector.end)



          console.info('current vector end', this._movementInfo.currentVector.end.x, this._movementInfo.currentVector.end.y)
          console.info('target', this._movementInfo.targetVector.end.x, this._movementInfo.targetVector.end.y)

          console.info('heading', this._ballDegrees, 'to', angle)
        }
      }.bind(this), 1000)
    }
  }
}

// http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
Sphero.prototype._findAngle = function(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2))
    var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2))
    var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2))

    return this._toDegrees(Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)))
}

Sphero.prototype._toDegrees = function(radians) {
  return radians * 180 / Math.PI
}

Sphero.prototype._rotate = function(coords, degrees) {
  return {
    x: (coords.x * Math.cos(degrees)) - (coords.y * Math.sin(degrees)),
    y: (coords.x * Math.sin(degrees)) + (coords.y * Math.cos(degrees))
  }
}

Sphero.prototype.getMovementInfo = function() {
  return this._movementInfo
}

Sphero.prototype._stop = function() {
  clearInterval(this._movementInterval)
  this._movementInterval = null
  this._movementInfo = {}
  this._socket.emit('sphero:stop')
}

Sphero.prototype.moveTo = function(x, y) {
  if(!this._ball) {
    return
  }

  var reduction = 8

  var width = (this._ball.coordinates.bottomRight.x - this._ball.coordinates.topLeft.x) / reduction
  var height = (this._ball.coordinates.bottomRight.y - this._ball.coordinates.topLeft.y) / reduction

  this._movementInfo.target = {
    x: x - (width / 2),
    y: y - (height / 2),
    width: width,
    height: height,
    center: {
      x: x,
      y: y
    }
  }
}

module.exports = Sphero
