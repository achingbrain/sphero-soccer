var fs = require('fs')

var PATTERN = 'tty.Sphero'

module.exports = function(callback) {
  fs.readdir('/dev', function(error, files) {
    if(error) return callback(error)

    var sphero

    files.forEach(function(file) {
      if(file.substring(0, PATTERN.length) == PATTERN) {
        sphero = file
      }
    })

    if(sphero) {
      return callback(null, '/dev/' + sphero)
    }

    return callback(new Error('Could not find Sphero'))
  })
}
