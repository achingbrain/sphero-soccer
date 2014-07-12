var Cylon = require('cylon'),
  app = require('express')(),
  server = require('http').createServer(app),
  io = require('socket.io').listen(server)

var sphero

Cylon.robot({
  connection: { name: 'sphero', adaptor: 'sphero', port: '/dev/tty.Sphero-BRG-AMP-SPP-6' },
  device: {name: 'sphero', driver: 'sphero'},

  work: function(my) {
    sphero = my.sphero

    console.info('connected')

    my.sphero.setColor('yellow')

    //every((1).second(), function() {
    //  my.sphero.roll(60, Math.floor(Math.random() * 360));
    //})

    console.info('stopping')
    my.sphero.stop()
  }
}).start()

io.sockets.on('connection', function (socket) {
  socket.on('sphero:stop', function (data) {
    if(!sphero) {
      socket.emit('sphero:warn', 'Not connected to sphero');
      return
    }

    sphero.stop()
    socket.emit('sphero:info', 'Sphero stopped');
  })

  socket.on('sphero:startcalibration', function (data) {
    if(!sphero) {
      socket.emit('sphero:warn', 'Not connected to sphero');
      return
    }

    sphero.startCalibration()
    socket.emit('sphero:info', 'Sphero calibration started');
  })

  socket.on('sphero:stopcalibration', function (data) {
    if(!sphero) {
      socket.emit('sphero:warn', 'Not connected to sphero');
      return
    }

    sphero.finishCalibration()
    socket.emit('sphero:info', 'Sphero calibration stopped');
  })


})

exports = module.exports = server;
// delegates use() function
exports.use = function() {
  app.use.apply(app, arguments);
}
