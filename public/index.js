(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
var Canvas = function(id) {
  this._renderers = []

  this._element = document.getElementById('c')
  this._context = this._element.getContext('2d')

  this.width = this._element.clientWidth
  this.height = this._element.clientHeight

  var buffer = document.createElement('canvas')
  buffer.width = this.width
  buffer.height = this.height

  this.buffer = buffer.getContext('2d')
}

Canvas.prototype.addRenderer = function(func) {
  return this._renderers.push(func) - 1
}

Canvas.prototype.removeRenderer = function(renderer) {
  for(var i = 0; i < this._renderers.length; i++) {
    if(this._renderers[i] == renderer) {
      this._renderers.splice(i, 1)
      i--
    }
  }
}

Canvas.prototype.draw = function() {
  this._renderers.forEach(function(renderer) {
    renderer(this.buffer, this.width, this.height)
  }.bind(this))

  this._context.putImageData(this.buffer.getImageData(0, 0, this.width, this.height), 0, 0);
}

module.exports = Canvas

},{}],2:[function(require,module,exports){

var VideoBuffer = function(width, height) {
  this.element = document.createElement('video')
  this.element.width = width
  this.element.height = height
}

VideoBuffer.prototype.setStream = function(stream) {
  this.element.src = URL.createObjectURL(stream);
  this.element.play();
}

module.exports = VideoBuffer

},{}],3:[function(require,module,exports){
//var onecolor = require('onecolor')

var colours = ['red', 'green', 'blue']

module.exports = function(pixel, target, sensitivity) {
  if(!pixel || !target) {
    return false
  }

  //var incoming = onecolor([pixel.red, pixel.green, pixel.blue, pixel.alpha])
  //var aim = onecolor([target.average.red, target.average.green, target.average.blue, target.average.alpha])

  //return incoming.equals(aim, sensitivity)

  var matches = 0

  colours.forEach(function(colour) {
    if(pixel[colour] > target[colour].lower && pixel[colour] < target[colour].upper) {
      matches++
    }
  })

  return matches == 3
}

},{}],4:[function(require,module,exports){
var PixelBuffer = function(pixels, width, height) {
  this._pixelData = pixels.data
  this._rowSize = this._pixelData.length / height
  this._pixels = []
  this._width = width
  this._height = height
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
  return this.get(pixel.y - 1, pixel.x)
}

PixelBuffer.prototype.northEast = function(pixel) {
  return this.get(pixel.y - 1, pixel.x + 1)
}

PixelBuffer.prototype.east = function(pixel) {
  return this.get(pixel.y, pixel.x + 1)
}

PixelBuffer.prototype.southEast = function(pixel) {
  return this.get(pixel.y + 1, pixel.x + 1)
}

PixelBuffer.prototype.south = function(pixel) {
  return this.get(pixel.y + 1, pixel.x)
}

PixelBuffer.prototype.southWest = function(pixel) {
  return this.get(pixel.y + 1, pixel.x - 1)
}

PixelBuffer.prototype.west = function(pixel) {
  return this.get(pixel.y, pixel.x - 1)
}

PixelBuffer.prototype.northWest = function(pixel) {
  return this.get(pixel.y - 1, pixel.x - 1)
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

var findBlobs = function(pixels, width, height, sensitivity, join_distance, targets) {
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

  console.info(blobs.length, 'blobs, joined', joined.length, 'output', output.length)

  if(output.length > 0) {
    console.info('max', output[0].size, 'min', output[output.length - 1].size)
  }

  return joined
}

module.exports = findBlobs

},{}],5:[function(require,module,exports){
var getPosition = require('./getPosition'),
  mapColour = require('./mapColour')

var findColour = function(canvas, range, sensitivity, event) {
  var position = getPosition(event);

  // get the average colour
  var avgRed, avgGreen, avgBlue, avgAlpha, pixelCount
  avgRed = avgGreen = avgBlue = avgAlpha = pixelCount = 0
  var pixels = canvas.buffer.getImageData(position.x - (range/2), position.y - (range/2), range, range);
  var pixelData = pixels.data;

  for (var i = 0; i < pixelData.length; i+=4) {
    avgRed += pixelData[i+0]
    avgGreen += pixelData[i+1]
    avgBlue += pixelData[i+2]
    avgAlpha += pixelData[i+3]
    pixelCount++
  }

  avgRed /= pixelCount
  avgGreen /= pixelCount
  avgBlue /= pixelCount
  avgAlpha /= pixelCount

  avgRed = parseInt(avgRed, 10)
  avgGreen = parseInt(avgGreen, 10)
  avgBlue = parseInt(avgBlue, 10)
  avgAlpha = parseInt(avgAlpha, 10)

  return mapColour(avgRed, avgGreen, avgBlue, avgAlpha, sensitivity)
}

module.exports = findColour

},{"./getPosition":6,"./mapColour":8}],6:[function(require,module,exports){

module.exports = function getPosition(e) {
  //this section is from http://www.quirksmode.org/js/events_properties.html
  var targ

  if (!e) {
    e = window.event
  }

  if (e.target) {
    targ = e.target
  } else if (e.srcElement) {
    targ = e.srcElement
  }

  if (targ.nodeType == 3) {
    // defeat Safari bug
    targ = targ.parentNode
  }

  // jQuery normalizes the pageX and pageY
  // pageX,Y are the mouse positions relative to the document
  // offset() returns the position of the element relative to the document
  var x = e.pageX - $(targ).offset().left
  var y = e.pageY - $(targ).offset().top

  return {"x": x, "y": y}
}

},{}],7:[function(require,module,exports){
var getUserMedia = require('getusermedia'),
  getPosition = require('./getPosition'),
  Canvas = require('./Canvas')
  VideoBuffer = require('./VideoBuffer'),
  findColour = require('./findColour'),
  colourMatch = require('./colourMatch'),
  mapColour = require('./mapColour'),
  findBlobs = require('./findBlobs')

var teams = [] // [{red: {lower: int, upper: in}, green: {lower...}}]
var ball // {red: {lower: int, upper: in}, green: {lower...}}

// how similar a colour should be to the selected hue - RGB values should be +/- this
var sensitivity = 0.2

// how large a sample area under the mouse click to use to get an average colour
var range = 20

// how close groups should be before they are joined
var join_distance = 10

var init = function() {
  var canvas = new Canvas('c')
  var videoBuffer = new VideoBuffer(canvas.width, canvas.height)

  canvas.addRenderer(function(context, width, height) {
    context.drawImage(videoBuffer.element, 0, 0, width, height)
  })

  var count = 0

  canvas.addRenderer(function(context, width, height) {
    if(count < 30) {
      count++
      return
    }

    count = 0

    var pixels = context.getImageData(0, 0, width, height);

    var blobs = findBlobs(pixels, width, height, sensitivity, join_distance, [ball].concat(teams))

    blobs.forEach(function(blob) {
      var coordinates = blob.coordinates

      context.beginPath()
      context.lineWidth = '5'
      context.strokeStyle = 'red'
      context.rect(coordinates.topLeft.x, coordinates.topLeft.y,
        coordinates.bottomRight.x - coordinates.topLeft.x,
        coordinates.bottomRight.y - coordinates.topLeft.y);
      context.stroke();
    })
  })

  function draw() {
    canvas.draw()

    window.requestAnimationFrame(draw)
  }

  getUserMedia({
      video: {
        mandatory: {
          minWidth: 1280,
          minHeight: 720
        }
      }
    }, function(error, stream) {
    if(error) throw error

    videoBuffer.setStream(stream)

    window.requestAnimationFrame(draw)
  });

  var socket = io(window.location.origin)
  socket.on('connect', function() {
    socket.on('sphero:warn', function(message) {
      console.warn(message)
    })
    socket.on('sphero:info', function(message) {
      console.info(message)
    })
  })

  var buttons = ['sphero_start', 'sphero_stop', 'sphero_startcalibration', 'sphero_stopcalibration']
  buttons.forEach(function(name) {
    $('#' + name).on('click', function(event) {
      socket.emit(name.replace('_', ':'))
      event.preventDefault()
      return false
    })
  })

  $('canvas').on('click', function(event) {
    var bounds = findColour(canvas, range, sensitivity, event)

    // was it the ball or a team?
    if(!ball) {
      ball = bounds

      $('#players').append('<li style="background-color: rgb(' + bounds.average.red + ', ' + bounds.average.green + ', ' + bounds.average.blue + ')">Ball</li>')
    } else {
      teams.push(bounds)

      $('#players').append('<li style="background-color: rgb(' + bounds.average.red + ', ' + bounds.average.green + ', ' + bounds.average.blue + ')">Team</li>')
    }
  })

  $('#colour_sensitivity').on('change', function(event) {
    var input = $('#colour_sensitivity').val()
    sensitivity = parseFloat(input)

    if(ball) {
      ball = mapColour(ball.average.red, ball.average.green, ball.average.blue, ball.average.alpha, sensitivity)
    }

    for(var i = 0; i < teams.length; i++) {
      teams[i] = mapColour(teams[i].average.red, teams[i].average.green, teams[i].average.blue, teams[i].average.alpha, sensitivity)
    }

    $('#sensitivity').text(parseInt((100 * sensitivity)) + '%')
  })

  $('#sensitivity').text(parseInt((100 * sensitivity)) + '%')

  $('#join_distance').on('change', function(event) {
    var input = $('#join_distance').val()
    join_distance = parseInt(input)

    $('#distance').text(join_distance + ' pixels')
  })

  $('#distance').text(join_distance + ' pixels')
}

init()

},{"./Canvas":1,"./VideoBuffer":2,"./colourMatch":3,"./findBlobs":4,"./findColour":5,"./getPosition":6,"./mapColour":8,"getusermedia":10}],8:[function(require,module,exports){

module.exports = function(r, g, b, a, sensitivity) {
  return {
    red: {
      upper: r + (r * sensitivity),
      lower: r - (r * sensitivity)
    },
    green: {
      upper: g + (g * sensitivity),
      lower: g - (g * sensitivity)
    },
    blue: {
      upper: b + (b * sensitivity),
      lower: b - (b * sensitivity)
    },
    average: {
      red: r,
      green: g,
      blue: b,
      alpha: a
    }
  }
}

},{}],9:[function(require,module,exports){

function unique(arr) {
/// Returns an object with the counts of unique elements in arr
/// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

    var value, counts = {};
    var i, l = arr.length;

    for(i=0; i<l; i+=1) {
        value = arr[i];

        if(counts[value]) {
            counts[value] += 1
        } else {
            counts[value] = 1
        }
    }

    return counts
}

module.exports = unique

},{}],10:[function(require,module,exports){
// getUserMedia helper by @HenrikJoreteg
var func = (window.navigator.getUserMedia ||
            window.navigator.webkitGetUserMedia ||
            window.navigator.mozGetUserMedia ||
            window.navigator.msGetUserMedia);


module.exports = function (constraints, cb) {
    var options;
    var haveOpts = arguments.length === 2;
    var defaultOpts = {video: true, audio: true};
    var error;
    var denied = 'PermissionDeniedError';
    var notSatified = 'ConstraintNotSatisfiedError';

    // make constraints optional
    if (!haveOpts) {
        cb = constraints;
        constraints = defaultOpts;
    }

    // treat lack of browser support like an error
    if (!func) {
        // throw proper error per spec
        error = new Error('MediaStreamError');
        error.name = 'NotSupportedError';
        return cb(error);
    }

    func.call(window.navigator, constraints, function (stream) {
        cb(null, stream);
    }, function (err) {
        var error;
        // coerce into an error object since FF gives us a string
        // there are only two valid names according to the spec
        // we coerce all non-denied to "constraint not satisfied".
        if (typeof err === 'string') {
            error = new Error('MediaStreamError');
            if (err === denied) {
                error.name = denied;
            } else {
                error.name = notSatified;
            }
        } else {
            // if we get an error object make sure '.name' property is set
            // according to spec: http://dev.w3.org/2011/webrtc/editor/getusermedia.html#navigatorusermediaerror-and-navigatorusermediaerrorcallback
            error = err;
            if (!error.name) {
                // this is likely chrome which
                // sets a property called "ERROR_DENIED" on the error object
                // if so we make sure to set a name
                if (error[denied]) {
                    err.name = denied;
                } else {
                    err.name = notSatified;
                }
            }
        }

        cb(error);
    });
};

},{}]},{},[1,2,3,4,5,6,7,8,9]);