
module.exports = function(r, g, b, sensitivity) {
  return {
    red: {
      upper: r + sensitivity,
      lower: r - sensitivity
    },
    green: {
      upper: g + sensitivity,
      lower: g - sensitivity
    },
    blue: {
      upper: b + sensitivity,
      lower: b - sensitivity
    },
    average: {
      red: r,
      green: g,
      blue: b
    }
  }
}
