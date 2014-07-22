var getUserMedia = require('getusermedia'),
  getPosition = require('./function/getPosition'),
  Canvas = require('./class/Canvas')
  VideoBuffer = require('./class/VideoBuffer'),
  findColour = require('./function/findColour'),
  mapColour = require('./function/mapColour'),
  BlobEmitter = require('./class/BlobEmitter')

var teams = [] // [{red: {lower: int, upper: in}, green: {lower...}}]
var ball // {red: {lower: int, upper: in}, green: {lower...}}

// how similar a colour should be to the selected hue - RGB values should be +/- this in %
var sensitivity = 0.5

// how large a sample area under the mouse click to use to get an average colour
var range = 20

// how close groups should be before they are joined
var join_distance = 50

// process every n pixels
var increment = 2

var blobEmitter = new BlobEmitter()

var init = function() {
  var blobs = []
  var blobFreq = 0

  blobEmitter.on('blobs', function(found) {
    blobs = found
    blobFreq++
  })

  setInterval(function() {
    $('#fps').text(blobFreq + ' fps')
    blobFreq = 0
  }, 1000)

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
    var targets = []

    if(ball) {
      targets.push(ball)
    }

    targets = targets.concat(teams)

    blobEmitter.setPixelData(context, width, height, sensitivity, join_distance, increment, targets)
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

  $('#pixel_increment').on('change', function(event) {
    var input = $('#pixel_increment').val()
    increment = parseInt(input)

    $('#increment').text(increment + ' pixels')
  })

  $('#increment').text(increment + ' pixels')
}

init()
