
var getUserMedia = navigator.getUserMedia ||
                   navigator.webkitGetUserMedia ||
                   navigator.mozGetUserMedia ||
                   navigator.msGetUserMedia ||
                   function(_, _, error) {
                     error('GetUserMedia is not supported in this browser')
                   }

module.exports = getUserMedia.bind(navigator)
