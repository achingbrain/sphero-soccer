var getPosition = require('./getPosition')

var findColour = function(canvas, range, distance, event) {
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

  return {
    red: {
      upper: avgRed + distance,
      lower: avgRed - distance
    },
    green: {
      upper: avgGreen + distance,
      lower: avgGreen - distance
    },
    blue: {
      upper: avgBlue + distance,
      lower: avgBlue - distance
    },
    position: position,
    average: {
      red: avgRed,
      green: avgGreen,
      blue: avgBlue
    }
  }
}

module.exports = findColour
