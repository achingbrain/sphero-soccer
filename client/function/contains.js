
// returns true if blobA contains blobB
module.exports = function(blobA, blobB) {
  return blobA.topLeft.x < blobB.topLeft.x && blobA.topLeft.y < blobB.topLeft.y &&
    blobA.bottomRight.x > blobB.bottomRight.x && blobA.bottomRight.y > blobB.bottomRight.y
}
