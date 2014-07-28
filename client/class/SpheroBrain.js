var contains = require('../function/contains'),
  boxoverlap = require("boxoverlap")

SpheroBrain = function(sphero, width, height) {
  this._sphero = sphero

  this._height = height
  this._width = width
  this._movementInterval = null

  this.target = {}

  this._sphero.on('stopped', function(ball, position) {
    if(!this.target.vector) {
      return
    }

    console.info('Moving ball in random direction')

    // dead stop, move slowly in a random direction
    ball.roll(parseInt(Math.random() * 360, 10))
  }.bind(this))

  this._sphero.on('moving', function(ball, position, direction) {
    console.info('moving', direction)
    // how far from the edge before we stop
    var gap = 10
    var coordinates = ball.getCoordinates()

    if(!coordinates) {
      return
    }

    // if we are about to go out of bounds, stop
    if(coordinates.topLeft.x <= gap ||
      coordinates.topLeft.y <= gap ||
      coordinates.bottomRight.x >= (this._width - gap) ||
      coordinates.bottomRight.y >= (this._height - gap)) {
      console.info('Sphero out of bounds!')

      if(this.target.vector) {
        return ball.roll(180)
      }

      return ball.stop()
    }

    if(!this.target.vector) {
      ball.stop()
      ball.turnOffStabilisation()
      return
    }

    // have we hit our target location yet?
    var overlap = boxoverlap([
      [[this.target.topLeft.x, this.target.topLeft.y], [this.target.bottomRight.x, this.target.bottomRight.y]],
      [[coordinates.topLeft.x, coordinates.topLeft.y], [coordinates.bottomRight.x, coordinates.bottomRight.y]]
      ])

    if(overlap.length > 0) {
      console.info('Sphero hit target!')

      this.target = {}
      ball.stop()
      ball.turnOffStabilisation()
      return
    }

    // update vector to target
    this.target.vector = {
      start: position,
      end: this.target.center
    }

    if(this._movementInterval) {
      return
    }

    this._movementInterval = setInterval(function() {
        var position = this._sphero.getPosition()
        var currentVector = this._sphero.getCurrentVector()

        if(!position || !currentVector) {
          console.warn('Lost Sphero')
          this._sphero.stop()

          return clearInterval(this._movementInterval)
        }

        var angle = this._findAngle(currentVector.end, position, this.target.vector.end)
        angle = parseInt(angle, 10)

        // there must be a smarter way of doing this
        var isLeft = this._isLeft(currentVector.end, position, this.target.vector.end)

        var heading = isLeft ? (360 - angle) : angle

        if(isNaN(heading)) {
          heading = 0
        }

        console.info('turn %s by %d°, new heading: %d', isLeft ? 'left' : 'right', angle, heading)

        this._sphero.roll(heading)
    }.bind(this), 1000)
  }.bind(this))
}
// http://stackoverflow.com/questions/17763392/how-to-calculate-in-javascript-angle-between-3-points
SpheroBrain.prototype._findAngle = function(A,B,C) {
    var AB = Math.sqrt(Math.pow(B.x - A.x, 2) + Math.pow(B.y - A.y, 2))
    var BC = Math.sqrt(Math.pow(B.x - C.x, 2) + Math.pow(B.y - C.y, 2))
    var AC = Math.sqrt(Math.pow(C.x - A.x, 2) + Math.pow(C.y - A.y, 2))

    return this._toDegrees(Math.acos((BC * BC + AB * AB - AC * AC) / (2 * BC * AB)))
}

// http://www.gamedev.net/topic/508445-left-or-right-direction
SpheroBrain.prototype._isLeft = function(a, b, c) {

  var dot = function(a, b) {
    return (a.y * b.x) + (a.x * b.y)
  }

  var perp_dot = function(a, b) {
    return ((a.y * b.x) * -1) + (a.x * b.y)
  }

  var sign = function(value) {
    return (value < 0) ? -1 : (value > 0 ? 1 : 0)
  }

  var ba = {
    x: a.x - b.x,
    y: a.y - b.y
  }

  var bc = {
    x: c.x - b.x,
    y: c.y - b.y
  }

  return this._toDegrees(sign(perp_dot(ba, bc))) < 0
}

SpheroBrain.prototype._toDegrees = function(radians) {
  return radians * 180 / Math.PI
}

SpheroBrain.prototype.moveTo = function(x, y) {
  var coordinates = this._sphero.getCoordinates()
  var position = this._sphero.getPosition()

  if(!coordinates) {
    return
  }

  // increase target size by this modifier
  var sizeModifier = 5

  var width = (coordinates.bottomRight.x - coordinates.topLeft.x) * sizeModifier
  var height = (coordinates.bottomRight.y - coordinates.topLeft.y) * sizeModifier

  width = Math.min(width, 200)
  height = Math.min(height, 200)

  this.target = {
    topLeft: {
      x: x - (width / 2),
      y: y - (height / 2)
    },
    bottomRight: {
      x: x + (width / 2),
      y: y + (height / 2)
    },
    center: {
      x: x,
      y: y
    },
    width: width,
    height: height,
    vector: {
      start: position,
      end: {
        x: x,
        y: y
      }
    }
  }

  console.info('moving sphero forward')
  this._sphero.turnOnStabilisation()
  this._sphero.roll(0)
}

SpheroBrain.prototype.start = function() {
  if(this._evasionInterval) {
    return
  }

  // every five seconds, work out the biggest space
  // between all blobs and move the ball there
  this._evasionInterval = setInterval(function() {
    var rand = parseInt((Math.random() * 100), 10)

    if(rand > 90) {
      console.info('Crazy Ivan!')
      this.moveTo(
        Math.floor(Math.random() * (this._width - 200)) + 101,
        Math.floor(Math.random() * (this._height - 200)) + 101
      )
    }
  }.bind(this), 5000)
}

SpheroBrain.prototype.stop = function() {
  clearInterval(this._evasionInterval)

  this._sphero.stop()
}

module.exports = SpheroBrain
