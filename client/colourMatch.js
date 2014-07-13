
var colours = ['red', 'green', 'blue']

module.exports = function(pixel, target) {
  if(!pixel || !target) {
    return false
  }

  var matches = 0

  colours.forEach(function(colour) {
    if(pixel[colour] > target[colour].lower && pixel[colour] < target[colour].upper) {
      matches++
    }
  })

  return matches == 3
}
