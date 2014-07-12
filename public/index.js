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
var getPosition = require('./getPosition')

var findColour = function(canvas, range, distance, event) {
  var position = getPosition(event);

  // get the average colour
  var avgRed = avgGreen = avgBlue = pixelCount = 0
  var pixels = canvas.buffer.getImageData(position.x - (range/2), position.y - (range/2), range, range);
  var pixelData = pixels.data;

  for (var i = 0; i < pixelData.length; i+=4) {
    avgRed += pixelData[i+0]
    avgGreen += pixelData[i+1]
    avgBlue += pixelData[i+2]
    pixelCount++
  }

  avgRed /= pixelCount
  avgGreen /= pixelCount
  avgBlue /= pixelCount

  avgRed = parseInt(avgRed, 10)
  avgGreen = parseInt(avgGreen, 10)
  avgBlue = parseInt(avgBlue, 10)

  return {
    red: {
      upper: avgRed + distance,
      lower: avgRed - distance
    },
    green: {
      upper: avgGreen + distance,
      lower: avgGreen - distance
    },
    blue: {
      upper: avgBlue + distance,
      lower: avgBlue - distance
    },
    position: position,
    average: {
      red: avgRed,
      green: avgGreen,
      blue: avgBlue
    }
  }
}

module.exports = findColour

},{"./getPosition":4}],4:[function(require,module,exports){

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
  findColour = require('./findColour')

var teams = [] // {red: {lower: int, upper: in}, green: {lower...}}
var ball // {lower: int, upper: in}
var distance = 20
var range = 20

var init = function() {
  var canvas = new Canvas('c')
  var videoBuffer = new VideoBuffer(canvas.width, canvas.height)

  canvas.addRenderer(function(context, width, height) {
    context.drawImage(videoBuffer.element, 0, 0, width, height)
  })

/*  function inBounds(value, target, distance) {
    var upper = target + ((target / 100) * distance)
    var lower = target - ((target / 100) * distance)

    if(upper > 255) {
      upper = 255
    }

    if(lower < 0) {
      lower = 0
    }

    return value >= lower && value <= upper
  }

  function findRed(w, h) {
    var pixels = bCtx.getImageData(0, 0, w, h);
    var pixelData = pixels.data;

    for (var i = 0; i < pixelData.length; i+=4) {
      //pixelData.data[i+0]=r;
      var rr = pixelData[i+0];
      var gg = pixelData[i+1];
      var bb = pixelData[i+2];

      if(inBounds(rr, avgRed, distance) &&
        inBounds(gg, avgGreen, distance) &&
        inBounds(bb, avgBlue, distance)) {
        var average = parseInt((rr+gg+bb)/3);
        pixelData[parseInt(i+0)]=average;
        pixelData[parseInt(i+1)]=average;
        pixelData[parseInt(i+2)]=average;
        pixelData[parseInt(i+3)]=255;
      }
    }

    pixels.data = pixelData;
    gCtx.putImageData(pixels, 0, 0);
  }
*/
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

  console.info('creating websocket connection to', window.location.origin)
  var socket = io(window.location.origin)
  socket.on('connect', function() {
    console.info('connected to websocket')
    socket.on('event', function(data){
      console.info('incoming event', data)
    })

    socket.on('sphero:warn', function(message) {
      console.warn(message)
    })
    socket.on('sphero:info', function(message) {
      console.info(message)
    })

    socket.emit('sphero:stop')
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
    var bounds = findColour(canvas, range, distance, event)

    // was it the ball or a team?
    if(!ball) {
      ball = bounds

      $('#players').append('<li style="background-color: rgb(' + bounds.average.red + ', ' + bounds.average.green + ', ' + bounds.average.blue + ')">Ball</li>')
    } else {
      teams.push(bounds)

      $('#players').append('<li style="background-color: rgb(' + bounds.average.red + ', ' + bounds.average.green + ', ' + bounds.average.blue + ')">Team</li>')
    }
  })
}

init()

},{"./Canvas":1,"./VideoBuffer":2,"./findColour":3,"./getPosition":4,"getusermedia":6}],6:[function(require,module,exports){
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