
var colours = ['red', 'green', 'blue']

module.exports = function(red, green, blue, target) {
  var subject = {
    red: red,
    green: green,
    blue: blue
  }

  var matches = 0

  colours.forEach(function(colour) {
    if(subject[colour] > target[colour].lower && subject[colour] < target[colour].upper) {
      matches++
    }
  })

  return matches == 3
}
