var boxoverlap = require("boxoverlap")

// join blobs together if they are close
// arguments[0] = how many pixels is 'close'
// arguments[1..n] = arrays of blobs
module.exports = function() {
  var joined = []
  var distance = arguments[0]

  for(var i = 1; i < arguments.length; i++) {
    joined = joined.concat(arguments[i])
  }

  for(var i = 0; i < joined.length; i++) {
    var blob = joined[i]

    for(var k = 0; k < joined.length; k++) {
      other = joined[k]

      if(blob == other) {
        continue
      }

      // are they for the same target?
      if(blob.target.average.hex != other.target.average.hex) {
        continue
      }

      // increase the dimensions of the other group
      var dims = {
        topLeft: {
          x: other.coordinates.topLeft.x - distance,
          y: other.coordinates.topLeft.y - distance
        },
        bottomRight: {
          x: other.coordinates.bottomRight.x + distance,
          y: other.coordinates.bottomRight.y + distance
        }
      }

      var overlap = boxoverlap([
        [[dims.topLeft.x, dims.topLeft.y], [dims.bottomRight.x, dims.bottomRight.y]],
        [[blob.coordinates.topLeft.x, blob.coordinates.topLeft.y], [blob.coordinates.bottomRight.x, blob.coordinates.bottomRight.y]]
        ])

      if(overlap.length > 0) {
        // join the other group to this one
        blob.size += other.size
        blob.coordinates.topLeft.x = Math.min(blob.coordinates.topLeft.x, other.coordinates.topLeft.x)
        blob.coordinates.topLeft.y = Math.min(blob.coordinates.topLeft.y, other.coordinates.topLeft.y)
        blob.coordinates.bottomRight.x = Math.max(blob.coordinates.bottomRight.x, other.coordinates.bottomRight.x)
        blob.coordinates.bottomRight.y = Math.max(blob.coordinates.bottomRight.y, other.coordinates.bottomRight.y)

        // remove the other group from the list
        joined.splice(k, 1)
        k--
      }
    }
  }

  var output = joined.filter(function(blob) {
    return blob.size > 100
  })

  output = output.sort(function(a, b){
    return b.size - a.size
  })

  // calculate center points
  output.forEach(function(blob) {
    blob.center = {
      x: blob.coordinates.topLeft.x + ((blob.coordinates.bottomRight.x - blob.coordinates.topLeft.x) / 2),
      y: blob.coordinates.topLeft.y + ((blob.coordinates.bottomRight.y - blob.coordinates.topLeft.y) / 2),
    }
  })

  return output
}
