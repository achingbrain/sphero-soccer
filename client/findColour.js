var getPosition = require('./getPosition'),
  mapColour = require('./mapColour')

var findColour = function(canvas, range, sensitivity, event) {
  var position = getPosition(event);

  // get the average colour
  var avgRed = avgGreen = avgBlue = pixelCount = 0
  var pixels = canvas.buffer.getImageData(position.x - (range/2), position.y - (range/2), range, range);
  var pixelData = pixels.data;

  for (var i = 0; i < pixelData.length; i+=4) {
    avgRed += pixelData[i+0]
    avgGreen += pixelData[i+1]
    avgBlue += pixelData[i+2]
    pixelCount++
  }

  avgRed /= pixelCount
  avgGreen /= pixelCount
  avgBlue /= pixelCount

  avgRed = parseInt(avgRed, 10)
  avgGreen = parseInt(avgGreen, 10)
  avgBlue = parseInt(avgBlue, 10)

  return mapColour(avgRed, avgGreen, avgBlue, sensitivity)
}

module.exports = findColour
