var Cylon = require('cylon'),
  findSphero = require('./findSphero')

var sphero

findSphero(function(error, port) {
  if(error) throw error

  console.info('Connecting to Sphero at', port)

  Cylon.robot({
    connection: { name: 'sphero', adaptor: 'sphero', port: port },
    device: {name: 'sphero', driver: 'sphero'},

    work: function(my) {
      sphero = my.sphero

      console.info('Connected to Sphero at', port)

      my.sphero.setRandomColor()
    }
  }).start()
})

var withSphero = function(callback) {
  if(sphero) {
    return callback(sphero)
  }

  console.info('Deferring sphero execution')
  setTimeout(withSphero.bind(withSphero, callback), 1000)
}

module.exports = withSphero
