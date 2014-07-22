

workerCallback = function(event) {

  var blobs = findBlobs(
    event.data.pixels,
    event.data.width,
    event.data.height,
    event.data.sensitivity,
    event.data.join_distance,
    event.data.increment,
    event.data.targets
  )

  postMessage(blobs);
}

onmessage = function(event) {
  var workers = 1
  var blobs = []

  for(var i = 0; i < workers; i++) {
    var worker = new Worker('blob_finder_worker.js')
    worker.onmessage = function(event) {
      blobs = data.concat(event.data.blobs)

      workers--

      if(workers != 0) {
        // still waiting for other workers
        return
      }

      postMessage(blobs);
    }

    var message = {
      pixels: event.data.pixels,
      width: event.data.width,
      height: event.data.height,
      sensitivity: event.data.sensitivity,
      join_distance: vent.data.join_distance,
      increment: event.data.increment,
      targets: event.data.targets
    }

    worker.postMessage(message)
  }
};
