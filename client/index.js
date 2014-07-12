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
