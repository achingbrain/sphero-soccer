
module.exports = function(r, g, b, a, sensitivity) {
  return {
    red: {
      upper: r + (r * sensitivity),
      lower: r - (r * sensitivity)
    },
    green: {
      upper: g + (g * sensitivity),
      lower: g - (g * sensitivity)
    },
    blue: {
      upper: b + (b * sensitivity),
      lower: b - (b * sensitivity)
    },
    average: {
      red: r,
      green: g,
      blue: b,
      alpha: a
    }
  }
}
