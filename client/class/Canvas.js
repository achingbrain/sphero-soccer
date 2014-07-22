
var Canvas = function(id) {
  this._renderers = []

  this._element = document.getElementById('c')
  this._context = this._element.getContext('2d')

  this.width = this._element.clientWidth
  this.height = this._element.clientHeight

  var buffer = document.createElement('canvas')
  buffer.width = this.width
  buffer.height = this.height

  this.buffer = buffer.getContext('2d')
}

Canvas.prototype.addRenderer = function(func) {
  return this._renderers.push(func) - 1
}

Canvas.prototype.removeRenderer = function(renderer) {
  for(var i = 0; i < this._renderers.length; i++) {
    if(this._renderers[i] == renderer) {
      this._renderers.splice(i, 1)
      i--
    }
  }
}

Canvas.prototype.draw = function() {
  this._renderers.forEach(function(renderer) {
    renderer(this.buffer, this.width, this.height)
  }.bind(this))

  this._context.putImageData(this.buffer.getImageData(0, 0, this.width, this.height), 0, 0);
}

module.exports = Canvas
