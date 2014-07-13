//var onecolor = require('onecolor')

var colours = ['red', 'green', 'blue']

module.exports = function(pixel, target, sensitivity) {
  if(!pixel || !target) {
    return false
  }

  //var incoming = onecolor([pixel.red, pixel.green, pixel.blue, pixel.alpha])
  //var aim = onecolor([target.average.red, target.average.green, target.average.blue, target.average.alpha])

  //return incoming.equals(aim, sensitivity)

  var matches = 0

  colours.forEach(function(colour) {
    if(pixel[colour] > target[colour].lower && pixel[colour] < target[colour].upper) {
      matches++
    }
  })

  return matches == 3
}
