var Cylon = require('cylon'),
  findSphero = require('./findSphero')

var sphero

findSphero(function(error, port) {
  //if(error) throw error
  if(error) return console.error(error)

  Cylon.robot({
    connection: { name: 'sphero', adaptor: 'sphero', port: port },
    device: {name: 'sphero', driver: 'sphero'},

    work: function(my) {
      sphero = my.sphero

      my.sphero.setRGB(0, 0, 0)
    }
  }).start()
})

var withSphero = function(callback) {
  if(sphero) {
    return callback(sphero)
  }

  setTimeout(withSphero.bind(withSphero, callback), 1000)
}

module.exports = withSphero
