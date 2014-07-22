
function unique(arr) {
/// Returns an object with the counts of unique elements in arr
/// unique([1,2,1,1,1,2,3,4]) === { 1:4, 2:2, 3:1, 4:1 }

    var value, counts = {};
    var i, l = arr.length;

    for(i=0; i<l; i+=1) {
        value = arr[i];

        if(counts[value]) {
            counts[value] += 1
        } else {
            counts[value] = 1
        }
    }

    return counts
}

module.exports = unique
