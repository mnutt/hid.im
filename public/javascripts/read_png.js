if (!Array.prototype.map)
{
  Array.prototype.map = function(fun /*, thisp*/)
  {
    var len = this.length;
    if (typeof fun != "function")
      throw new TypeError();

    var res = new Array(len);
    var thisp = arguments[1];
    for (var i = 0; i < len; i++)
    {
      if (i in this)
        res[i] = fun.call(thisp, this[i], i, this);
    }

    return res;
  };
}

Hidim = function(data, width, height) {
  this.init(data, width, height);
};

$.extend(Hidim.prototype, {
  // This key has been arbitrarily chosen to identify a hidim
  key: [104, 105, 100, 105, 109, 32, 105, 115, 32,
        116, 111, 114, 114, 101, 110, 116, 115, 33],

  init: function(data, width, height) {
    this.data = data;
    this.width = width;
    this.height = height;
  },

  pixels: function() {
    if(_pixels) { return _pixels; }
    var alphaPixels = inGroupsOf(this.data, 4);
    var _pixels = this.removeTransparency(alphaPixels);
    return _pixels;
  },

  rows: function() {
    if(_rows) { return _rows; }
    var _rows = inGroupsOf(this.pixels(), this.width).reverse();
    return _rows;
  }

});

BetterArray = function(array) {
  this.init(array);
};

$.extend(BetterArray.prototype, {
  flatten: function() {

  }
});

MatrixArray = function(array, width) {
  this.init(array, width);
};

$.extend(MatrixArray.prototype, {
  init: function(array, width) {
    this.array = array;
    this.width = width;
    this.matrix = inGroupsOf(this.array, this.width);
    return this;
  },

  toChars: function() {
    return this.matrix.map(function(row) {
      return row.map(function(cell) {
	return String.fromChar(cell);
      });
    });
  }


});

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
  var transposed = [];

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

function toChars(array) {
  charArray = [];
  for(var i in array) {
    charArray.push(String.fromCharCode(array[i]));
  }
  return charArray;
}

function retrieveInteger(data) {
  if(String.fromCharCode(data[0]) == 'i') {
    data.shift(); // remove the 'i'
  } else {
    console.error('could not get metadata at ' + String.fromCharCode(torrentData[0]));
  }

  metadata = "";
  var limit = 0; // To make sure we don't go through the whole file
  while(String.fromCharCode(data[0]) != 'e' && (limit < 30)) {
    metadata = metadata + String.fromCharCode(data.shift());
    limit = limit + 1;
  }
  data.shift(); // remove the 'e'
  return metadata;
}

function retrieveString(data) {
  var size = "";
  var limit = 0; // To make sure we don't go through the whole file
  while(String.fromCharCode(data[0]) != ':' && (limit < 30)) {
    size = size + String.fromCharCode(data.shift());
    limit = limit + 1;
  }
  data.shift(); // remove the ':'
  size = parseInt(size);
  var result = data.slice(0, size);
  data.splice(0, size);
  return toChars(result).join('');
}

function adjustForLineHeight(data, initialPosition, newHeight, imgHeight) {
  var output = [];
  var position = initialPosition;
  while(position < data.length) {
    output = output.concat(data.slice(position, position + newHeight));
    position = position + imgHeight - 2;
  }
  return output;
}

var canvas = document.createElement('canvas');
var context = canvas.getContext('2d');

var img = $('img.hidim').get(0);
canvas.width = img.width;
canvas.height = img.height;
context.drawImage(img, 0, 0);

var key = [104, 105, 100, 105, 109, 32, 105, 115, 32, 116, 111, 114, 114, 101, 110, 116, 115, 33];

var data = context.getImageData(0, 0, img.width, img.height).data;

// Split the raw data into pixels (r, g, b, a)
var pixels = inGroupsOf(data, 4);

// Alpha is always set to fully opaque; we're not using it to store data so remove the alpha byte
pixels = removeTransparency(pixels);

// Group the pixel data into a matrix of rows, and reverse them since we are going to be reading upwards
var rows = inGroupsOf(pixels, img.width).reverse();

// Since we're scanning vertically instead of horizontally we need to transpose
var transposed = transpose(rows);

// Convert the matrix to a data array
var torrent = toData(toData(transposed));

// Find the beginning of our data by looking for the key
var dataStart = containsArray(torrent, key);
if(dataStart) {
  console.info("Image contains an embedded torrent.");
} else {
  console.error("Image does not contain an embedded torrent.");
}

// Read in some initial data just to check the line height
var initialData = torrent.slice(dataStart + key.length);

var lineHeight = retrieveInteger(initialData);
console.info("line height: " + lineHeight);

// Adjust the array so that we only read the data inside the data block
var torrentData = adjustForLineHeight(torrent, dataStart, parseInt(lineHeight), img.height);

// Fast-forward past the data we've already read
torrentData.splice(0, key.length + lineHeight.length + 2);

var torrentFilename = retrieveString(torrentData);
console.info("torrent filename: " + torrentFilename);

var torrentHash = retrieveString(torrentData);
console.info("torrent hash: " + torrentHash);

var contentLength = retrieveInteger(torrentData);
console.info("torrent content length: " + contentLength);

var content = torrentData.slice(0, parseInt(contentLength));
