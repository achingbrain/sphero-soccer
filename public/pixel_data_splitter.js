(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);throw new Error("Cannot find module '"+o+"'")}var f=n[o]={exports:{}};t[o][0].call(f.exports,function(e){var n=t[o][1][e];return s(n?n:e)},f,f.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){

var NUM_SEGMENTS = 4

onmessage = function(event) {
  var pixelData = event.data
  var boundary = pixelData.length / NUM_SEGMENTS
/*
  for(var i = 0; i < NUM_SEGMENTS; i++) {
    postMessage({
      section: i,
      // pixelData is an "array like" object. Sigh
      pixels: Array.prototype.slice.call(pixelData, i * boundary, (i * boundary) + boundary)
    })
  }
*/
  postMessage({
    section: 3,
    // pixelData is an "array like" object. Sigh
    pixels: Array.prototype.slice.call(pixelData, 0)
  })
}

},{}]},{},[1]);