var EventEmitter = require('events').EventEmitter,
  util = require('util'),
  joinBlobs = require('../function/joinBlobs')

var NUM_SEGMENTS = 4

var BlobEmitter = function() {
  EventEmitter.call(this)

  this._blobFinders = []
  this._blobs = []

  for(var i = 0; i < NUM_SEGMENTS; i++) {
    var worker = new Worker('blob_finder_worker.js')
    worker.onmessage = function(index, event) {
      this._blobs[index] = event.data

      this.emit('worker-' + index + '-complete')
    }.bind(this, i)

    this._blobFinders.push(worker)
  }

  this._inRequest = false
}
util.inherits(BlobEmitter, EventEmitter)

BlobEmitter.prototype.setPixelData = function(context, width, height, sensitivity, join_distance, increment, targets) {
  if(this._inRequest) {
    return
  }

  this._inRequest = true

  var waitingFor = NUM_SEGMENTS
  var events = ['worker-0-complete', 'worker-1-complete', 'worker-2-complete', 'worker-3-complete']
  events.forEach(function(event) {

    this.once(event, function() {
      waitingFor--

      if(waitingFor == 0) {
        this.emit('all-workers-complete')
      }
    }.bind(this))
  }.bind(this))

  this.once('all-workers-complete', function() {
    var blobs = joinBlobs(join_distance, this._blobs[0], this._blobs[1], this._blobs[2], this._blobs[3])

    console.info(blobs.length, 'blobs found')

    this._inRequest = false

    this.emit('blobs', blobs)
  }.bind(this))

  var pixelData = context.getImageData(0, 0, width, height).data
  var boundary = pixelData.length / NUM_SEGMENTS

  for(var i = 0; i < NUM_SEGMENTS; i++) {
    var slice = Array.prototype.slice.call(pixelData, i * boundary, (i * boundary) + boundary)

    var message = {
      pixels: slice,
      width: width,
      height: height / NUM_SEGMENTS,
      sensitivity: sensitivity,
      join_distance: join_distance,
      increment: increment,
      targets: targets
    }

    this._blobFinders[i].postMessage(message)
  }
}

module.exports = BlobEmitter
