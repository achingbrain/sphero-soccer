var EventEmitter = require('events').EventEmitter,
  util = require('util')

var NUM_SEGMENTS = 4

var BlobEmitter = function() {
  EventEmitter.call(this)

  //this._pixelDataSplitter = new Worker('pixel_data_splitter.js')

  this._blobFinders = []
  this._blobs = []

  for(var i = 0; i < NUM_SEGMENTS; i++) {
    var worker = new Worker('blob_finder_worker.js')
    worker.onmessage = function(event) {
      this._blobs[i] = event.data

      this.emit('worker-' + i + '-complete')
    }.bind(this)

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

/*
  this._pixelDataSplitter.onmessage = function(event) {
    pixels = event.data

    console.info('got pixels', event.data.pixels.length, 'section', event.data.section)

    if(event.data.section == 3) {
      console.info('done')
      this._inRequest = false
    }
  }.bind(this)
*/
  //
  //

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
    console.info('found blobs')
    this._inRequest = false
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




/*
  var count = 0

  var start = Date.now()

  for(var n = 0; n < 100; n++) {
    var pixelData = context.getImageData(0, 0, width, height).data
    var boundary = pixelData.length / NUM_SEGMENTS

    for(var i = 0; i < NUM_SEGMENTS; i++) {
      var slice = Array.prototype.slice.call(pixelData, i * boundary, (i * boundary) + boundary)

      for(var n = 0; n < slice.length; n++) {
        count += slice[n]
      }
    }
  }

  console.info('Array.slice', Date.now() - start, count)



/*
  start = Date.now()
  count = 0

  var boundary = height / NUM_SEGMENTS

  for(var n = 0; n < 100; n++) {
    for(var i = 0; i < NUM_SEGMENTS; i++) {
      var slice = context.getImageData(0, i * boundary, width, boundary).data

      for(var j = 0; j < slice.length; j++) {
        count += slice[j]
      }
    }
  }

  console.info('context.getImageData', Date.now() - start, count)
*/

/*
  var size = 4
  var boundary = height / size

  for(var i = 0; i < size; i++) {
    var pixelData = context.getImageData(0, i * boundary, width, boundary).data

    this._pixelDataSplitter.postMessage(pixelData)
  }
*/



/*
  // data.pixels is an "array like" object. Sigh
  var pixels = []

  for(var i = 0; i < pixelData.length; i++) {
    pixels[i] = pixelData[i]
  }

  var message = {
    pixels: pixels,
    width: width,
    height: height,
    sensitivity: sensitivity,
    join_distance: join_distance,
    increment: increment,
    targets: [ball].concat(teams)
  }

  var blobs = []
  var blobRequests = 0
  var blobFinder = new Worker('blob_finder.js')
  blobFinder.onmessage = function(event) {
    // the finder has given us blobs!
    blobRequests--
    blobs = event.data
  }*/
}

module.exports = BlobEmitter
