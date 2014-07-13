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

},{"./getPosition":4,"./mapColour":6}],4:[function(require,module,exports){

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

},{}],5:[function(require,module,exports){
var getUserMedia = require('getusermedia'),
  getPosition = require('./getPosition'),
  Canvas = require('./Canvas')
  VideoBuffer = require('./VideoBuffer'),
  findColour = require('./findColour'),
  mapColour = require('./mapColour')

var teams = [] // [{red: {lower: int, upper: in}, green: {lower...}}]
var ball // {red: {lower: int, upper: in}, green: {lower...}}

// how similar a colour should be to the selected hue - RGB values should be +/- this
var sensitivity = 0.2

// how large a sample area under the mouse click to use to get an average colour
var range = 20

// how close groups should be before they are joined
var join_distance = 10

var init = function() {
  var blobs = []
  var blobRequests = 0
  var blobFinder = new Worker('blob_finder.js')
  blobFinder.onmessage = function(event) {
    // the finder has given us blobs!
    blobRequests--
    blobs = event.data
  }

  var canvas = new Canvas('c')
  var videoBuffer = new VideoBuffer(canvas.width, canvas.height)

  canvas.addRenderer(function(context, width, height) {
    context.drawImage(videoBuffer.element, 0, 0, width, height)
  })

  canvas.addRenderer(function(context, width, height) {
    // if we've got any blobs, draw them on the screen
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

  var count = 0

  canvas.addRenderer(function(context, width, height) {
    if(blobRequests != 0) {
      return
    }

    var pixelData = context.getImageData(0, 0, width, height).data

    // data.pixels is an "array like" object. Sigh
    var pixels = []

    for(var i = 0; i < pixelData.length; i++) {
      pixels[i] = pixelData[i]
    }

    var message = {
      pixels: pixels,
      width: width,
      height: height,
      sensitivity: sensitivity,
      join_distance: join_distance,
      targets: [ball].concat(teams)
    }

    blobRequests++
    blobFinder.postMessage(message)
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

},{"./Canvas":1,"./VideoBuffer":2,"./findColour":3,"./getPosition":4,"./mapColour":6,"getusermedia":7}],6:[function(require,module,exports){

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

},{}],7:[function(require,module,exports){
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

},{}]},{},[5]);