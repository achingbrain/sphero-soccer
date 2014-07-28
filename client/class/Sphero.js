var EventEmitter = require('events').EventEmitter,
  util = require('util')

Sphero = function(socket, colour, speed, blobEmitter) {
  EventEmitter.call(this)

  this._socket = socket
  this._colour = colour
  this._movementInterval = null
  this._movementInfo = {}
  this._evasionInterval = null

  this.speed = speed

  this._moving = false

  //blobEmitter.on('blobs', this._onBlobs.bind(this))
  blobEmitter.on('blobs', function(blobs) {
    this._onBlobs(blobs)
  }.bind(this))
}
util.inherits(Sphero, EventEmitter)

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

  if(!this._ball || !this._lastBall) {
    return
  }

  this._movementInfo.currentPosition = this._ball.center

  var oldMoving = this._moving

  this._moving = this._ball.center.x != this._lastBall.center.x &&
    this._ball.center.y != this._lastBall.center.y

  if(!this._moving) {
    if(oldMoving) {
      // was moving previously
      this.emit('stopped', this, this._ball.center)
    } else {
      // still stopped
      this.emit('stationary', this, this._ball.center)
    }

    return
  }

  // work out our current vector
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

  this.emit('moving', this, this._ball.center, this._movementInfo.currentVector)
}

Sphero.prototype.getMovementInfo = function() {
  return this._movementInfo
}

Sphero.prototype.getCurrentVector = function() {
  return this._movementInfo.currentVector
}

Sphero.prototype.getCoordinates = function() {
  if(this._ball) {
    return this._ball.coordinates
  }
}

Sphero.prototype.getPosition = function() {
  if(this._ball) {
    return this._ball.center
  }
}
/*
Sphero.prototype.moveTo = function(x, y) {
  if(!this._ball) {
    return
  }

  // increase target size by this modifier
  var sizeModifier = 5

  var width = (this._ball.coordinates.bottomRight.x - this._ball.coordinates.topLeft.x) * sizeModifier
  var height = (this._ball.coordinates.bottomRight.y - this._ball.coordinates.topLeft.y) * sizeModifier

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
}*/

Sphero.prototype.roll = function(heading, speed) {
  if(!speed) {
    speed = this.speed
  }

  this._socket.emit('sphero:roll', speed, heading)
}

Sphero.prototype.start = function(x, y) {
  if(this._evasionInterval) {
    return
  }

  // every five seconds, work out the biggest space
  // between all blobs and move the ball there
  this._evasionInterval = setInterval(function() {
    // find the two blobs furthest apart

    //
  }, 5000)
}

Sphero.prototype.stop = function(x, y) {
  clearInterval(this._evasionInterval)
  this._evasionInterval = null

  clearInterval(this._movementInterval)
  this._movementInterval = null

  this._movementInfo = {}
  this._socket.emit('sphero:stop')
}

Sphero.prototype.setColour = function(colour) {
  this._socket.emit('sphero:colour', colour)
}

Sphero.prototype.turnOnStabilisation = function() {
  this._socket.emit('sphero:stabilisation', true)
}

Sphero.prototype.turnOffStabilisation = function() {
  this._socket.emit('sphero:stabilisation', false)
}

module.exports = Sphero
