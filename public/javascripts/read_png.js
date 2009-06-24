  function removeTransparency(array) {
    for(var i = 0; i < array.length; i++) {
      array[i].splice(3, 1);
    }
    return array;
  }

  function inGroupsOf(array, length) {
    if(array.length % length != 0) { console.error("bad matrix array"); }
    matrix = [];
    var i = 0;
    while(array.length > 0) {
      matrix.push(array.slice(0, length));
      array.splice(0, length);
      i = i + 1;
    }
    return matrix;
  }

  function containsArray(haystack, needle) {
    var matched = 0;

    for(var i in haystack) {
      if(haystack[i] == needle[matched]) {
        matched = matched + 1;
        if(matched == needle.length) {
          return i - matched + 1;
        }
      } else { matched = 0; }
    }
    return false;
  }


  function transpose(array) {
    var height = array.length;
    var width = array[0].length;
    var transposed = []

    for(var i = 0; i < width; i++) {
      for(var j = 0; j < height; j++) {
	if(transposed[i] == null) { transposed[i] = []; }
        transposed[i][j] = array[j][i];
      }
    }
    return transposed;
  }

  function toData(array) {
    var data = [];
    for(var i in array) {
      data = data.concat(array[i]);
    }
    return data;
  }

  var canvas = $('canvas').get(0);
  var context = canvas.getContext('2d');

  var img = $('img.hidim');
  canvas.width = img.width();
  canvas.height = img.height();
  context.drawImage(img.get(0), 0, 0);

  var key = [104, 105, 100, 105, 109, 32, 105, 115, 32, 116, 111, 114, 114, 101, 110, 116, 115, 33];

  var data = context.getImageData(0, 0, img.width(), img.height()).data;

  // Split the raw data into pixels (r, g, b, a)
  var pixels = inGroupsOf(data, 4);

  // Alpha is always set to fully opaque; we're not using it to store data so remove the alpha byte
  pixels = removeTransparency(pixels);

  // Group the pixel data into a matrix of rows, and reverse them since we are going to be reading upwards
  var rows = inGroupsOf(pixels, img.width()).reverse();

  // Since we're scanning vertically instead of horizontally we need to transpose
  var transposed = transpose(rows);

  // Convert the matrix to a data array
  var torrent = toData(toData(transposed));

  var dataStart = containsArray(torrent, key);
  if(dataStart) {
    console.info("Image contains an embedded torrent.");
  } else {
    console.error("Image does not contain an embedded torrent.");
  }

  var torrentData = torrent.slice(dataStart + key.length);

  if(String.fromCharCode(torrentData[0]) == 'i') {
    torrentData.shift();
  } else {
    console.error('could not get metadata at ' + String.fromCharCode(torrentData[0]));
  }

  torrentSizeString = "";
  while(String.fromCharCode(torrentData[0]) != 'e') {
    torrentSizeString = torrentSizeString + String.fromCharCode(torrentData.shift());
  }
  torrentData.shift();

  torrentSize = parseInt(torrentSizeString);
  console.info("torrent size: " + torrentSize);

  console.log(String.fromCharCode(torrentData[0]));

  for(var i = dataStart + key.length; i < torrentData.length; i++) {
   // console.log(String.fromCharCode(torrentData[i]));
  }