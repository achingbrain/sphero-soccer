
// returns true if blobA contains blobB
module.exports = function(blobA, blobB) {
  return blobA.coordinates.topLeft.x < blobB.coordinates.topLeft.x && blobA.coordinates.topLeft.y < blobB.coordinates.topLeft.y &&
    blobA.coordinates.bottomRight.x > blobB.coordinates.bottomRight.x && blobA.coordinates.bottomRight.y > blobB.coordinates.bottomRight.y
}
