var app = require('express')(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server),
  withSphero = require('./server/withSphero')

io.sockets.on('connection', function(socket) {
  socket.on('sphero:start', function() {
    withSphero(function(sphero) {
      sphero.stop()
      socket.emit('sphero:info', 'Sphero started');
    })
  })

  socket.on('sphero:stop', function() {
    withSphero(function(sphero) {
      sphero.stop()
      socket.emit('sphero:info', 'Sphero stopped');
    })
  })

  socket.on('sphero:startcalibration', function() {
    withSphero(function(sphero) {
      sphero.startCalibration()
      socket.emit('sphero:info', 'Sphero calibration started');
    })
  })

  socket.on('sphero:stopcalibration', function() {
    withSphero(function(sphero) {
      sphero.finishCalibration()
      socket.emit('sphero:info', 'Sphero calibration stopped');
    })
  })

  socket.on('sphero:roll', function(speed, heading, state) {
    withSphero(function(sphero) {
      sphero.roll(speed, heading, state)
      socket.emit('sphero:info', 'Sphero rolling');
    })
  })
})

exports = module.exports = server;
// delegates use() function
exports.use = function() {
  app.use.apply(app, arguments);
}
