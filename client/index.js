var getUserMedia = require('getusermedia'),
  getPosition = require('./getPosition'),
  Canvas = require('./Canvas')
  VideoBuffer = require('./VideoBuffer'),
  findColour = require('./findColour'),
  colourMatch = require('./colourMatch'),
  mapColour = require('./mapColour')

var teams = [] // [{red: {lower: int, upper: in}, green: {lower...}}]
var ball // {red: {lower: int, upper: in}, green: {lower...}}

// how similar a colour should be to the selected hue - RGB values should be +/- this
var sensitivity = 50

// how large a sample area under the mouse click to use to get an average colour
var range = 20

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
    var pixelData = pixels.data;

    for (var i = 0; i < pixelData.length; i+=4) {
      var r = pixelData[i + 0], g = pixelData[i + 1], b = pixelData[i + 2]

      if(ball && colourMatch(r, b, b, ball)) {

        var average = parseInt((r+g+b)/3);
        pixelData[parseInt(i+0)]=average;
        pixelData[parseInt(i+1)]=average;
        pixelData[parseInt(i+2)]=average;
        pixelData[parseInt(i+3)]=255;
      }
    }

    pixels.data = pixelData;
    context.putImageData(pixels, 0, 0);
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
    sensitivity = $('#colour_sensitivity').val()

    if(ball) {
      ball = mapColour(ball.average.red, ball.average.green, ball.average.blue, sensitivity)
    }

    for(var i = 0; i < teams.length; i++) {
      teams[i] = mapColour(teams[i].average.red, teams[i].average.green, teams[i].average.blue, sensitivity)
    }

    $('#sensitivity').text(sensitivity)
  })

  $('#sensitivity').text(sensitivity)
}

init()