var PngReader = {
  removeTransparency: function(array) {
    for(var i = 0; i < array.length; i++) {
      array[i].splice(3, 1);
    }
    return array;
  },

  inGroupsOf: function(array, number) {
    // if(array.length % length != 0) { /* Firebug.Console.log("bad matrix array"); */ }
    var slices = [];
    var index = 0;
    while((index += number) < array.length) {
      slices.push(array.slice(index, index+number));
    }
    return slices;
  },

  containsArray: function(haystack, needle) {
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
  },


  transpose: function(array) {
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
  },

  flatten: function(array) {
    var data = [];
    for(var i = 0; i < array.length; i++) {
      data = data.concat(array[i]);
    }
    return data;
  },

  toChars: function(array) {
    charArray = [];
    for(var i in array) {
      charArray.push(String.fromCharCode(array[i]));
    }
    return charArray;
  },

  toHex: function(array) {
    string = "";
    for(var i in array) {
      string += array[i].toString(16);
    }
    return string;
  },

  retrieveInteger: function(data) {
    if(String.fromCharCode(data[0]) == 'i') {
      data.shift(); // remove the 'i'
    } else {
      console.log('could not get metadata at ' + String.fromCharCode(data[0]));
    }

    metadata = "";
    var limit = 0; // To make sure we don't go through the whole file
    while(String.fromCharCode(data[0]) != 'e' && (limit < 30)) {
      metadata = metadata + String.fromCharCode(data.shift());
      limit = limit + 1;
    }
    data.shift(); // remove the 'e'
    return metadata;
  },

  retrieveString: function(data) {
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
    return this.toChars(result).join('');
  },

  adjustForLineHeight: function(data, initialPosition, newHeight, imgHeight) {
    var contentLength = newHeight * 3;
    var lineLength = imgHeight * 3;
    var output = [];
    var position = initialPosition;

    while(position + contentLength < data.length) {
      output = output.concat(data.slice(position, position + contentLength));
      position = position + lineLength;
    }
    return output;
  },

  readPng: function(img) {
    var canvas = document.getElementById('tmpCanvas');
    if(!canvas) {
      canvas = document.createElement('canvas');
      canvas.style.display = "none";
    }
    var context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    var key = [104, 105, 100, 105, 109, 32, 105, 115, 32, 116, 111, 114, 114, 101, 110, 116, 115, 33];
    var data = context.getImageData(0, 0, img.width, img.height).data;

    // Split the raw data into pixels (r, g, b, a)
    var pixels = this.inGroupsOf(data, 4);

    // Alpha is always set to fully opaque; we're not using it to store data so remove the alpha byte
    pixels = this.removeTransparency(pixels);

    // Group the pixel data into a matrix of rows, and reverse them since we are going to be reading upwards
    var rows = this.inGroupsOf(pixels, img.width).reverse();

    // Since we're scanning vertically instead of horizontally we need to transpose
    var transposed = this.transpose(rows);

    // Convert the matrix to a data array
    var torrent = this.flatten(this.flatten(transposed));

    // Find the beginning of our data by looking for the key
    var dataStart = this.containsArray(torrent, key);
    if(dataStart) {
      console.log("Image contains an embedded torrent.");
    } else {
      console.log("Image does not contain an embedded torrent.");
      return false;
    }

    // Read in some initial data just to check the line height
    var initialData = torrent.slice(dataStart + key.length);

    var lineHeight = this.retrieveInteger(initialData);
    console.log("line height: " + lineHeight);

    // Adjust the array so that we only read the data inside the data block
    var torrentData = this.adjustForLineHeight(torrent, dataStart, parseInt(lineHeight), img.height);

    // Fast-forward past the data we've already read
    var offset = key.length + lineHeight.length + 2;
    torrentData.splice(0, offset);

    var torrentFilename = this.retrieveString(torrentData);
    console.log("torrent filename: " + torrentFilename);

    var torrentHash = this.retrieveString(torrentData);
    console.log("torrent sha1: " + torrentHash);

    var contentLength = this.retrieveInteger(torrentData);
    console.log("torrent content length: " + contentLength);

    var content = this.toChars(torrentData.slice(0, parseInt(contentLength))).join('');

    var computedHash = SHA1.hex_sha1(content + "");
    console.log("computed sha1: " + computedHash);

    var result = {
      file: {
	data: content,
	sha1: computedHash
      },
      fileName: torrentFilename,
      sha1: torrentHash,
      length: contentLength,
      pixelHeight: lineHeight
    };

    return result;
  }
}