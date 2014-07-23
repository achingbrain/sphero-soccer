
function padHexString(n) {
  var output = ''

  if(n < 0xF) {
    output += '0'
  }

  return output + n.toString(16)
}

module.exports = function(r, g, b, a, sensitivity) {
  return {
    red: {
      upper: parseInt(Math.min(r + (r * sensitivity), 255), 10),
      lower: parseInt(Math.max(r * sensitivity, 0), 10)
    },
    green: {
      upper: parseInt(Math.min(g + (g * sensitivity), 255), 10),
      lower: parseInt(Math.max(g * sensitivity, 0), 10)
    },
    blue: {
      upper: parseInt(Math.min(b + (b * sensitivity), 255), 10),
      lower: parseInt(Math.max(b * sensitivity, 0), 10)
    },
    average: {
      red: r,
      green: g,
      blue: b,
      alpha: a,
      hex: '#' + padHexString(r) + padHexString(g) + padHexString(b)
    }
  }
}
