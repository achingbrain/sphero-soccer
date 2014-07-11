
var VideoBuffer = function(width, height) {
  this.element = document.createElement('video')
  this.element.width = width
  this.element.height = height
}

VideoBuffer.prototype.setStream = function(stream) {
  this.element.src = URL.createObjectURL(stream);
  this.element.play();
}

module.exports = VideoBuffer
