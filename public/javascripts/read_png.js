var PngReader = {
  removeTransparency: function(array) {
    for(var i = 0; i < array.length; i++) {
      array[i].splice(3, 1);
    }
    return array;
  },

  inGroupsOf: function(arr, number) {
    if(typeof(arr.slice) == "undefined") {
      arr.slice = Array.prototype.slice;
    }

    var slices = [];
    var index = -number;
    while((index += number) < arr.length) {
      slices.push(arr.slice(index, index+number));
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
    var r = [];
    for(var i = 0; i < array.length; i++) {
      r.push.apply(r,array[i]);
    }
    return r;
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
      // Firebug.Console.log('could not get metadata at ' + this.toChars(data.slice(0, 10)).join(''));
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

  extractFromImg: function(img) {
    var canvas = document.getElementById('tmpCanvas');
    if(!canvas) {
      canvas = document.createElement('canvas');
    }
    var context = canvas.getContext('2d');

    canvas.width = img.width;
    canvas.height = img.height;
    context.drawImage(img, 0, 0);

    return context.getImageData(0, 0, img.width, img.height).data;
  },

  debugTable: function(img, container) {
    var data = this.extractFromImg(img);

    // Split the raw data into pixels (r, g, b, a)
    var pixels = this.inGroupsOf(data, 4);

    // Alpha is always set to fully opaque; we're not using it to store data so remove the alpha byte
    pixels = this.removeTransparency(pixels);

    // Group the pixel data into a matrix of rows, and reverse them since we are going to be reading upwards
    var rows = this.inGroupsOf(pixels, img.width).reverse();

    // Since we're scanning vertically instead of horizontally we need to transpose
    var transposed = this.transpose(rows);

    var table = document.createElement('table');

    for(var i = 0; i < transposed.length; i++) {
      var row = transposed[i];
      var tr = document.createElement('tr');
      for(var j = 0; j < row.length; j++) {
	var pixel = row[j];
	var color = "rgb("+ pixel.join(', ') + ")";
	for(var k = 0; k < pixel.length; k++) {
	  var td = document.createElement('td');
	  td.innerHTML = pixel[k];
	  tr.appendChild(td);
	  td.style.backgroundColor = color;
	}
      }
      table.appendChild(tr);
    }

    container.appendChild(table);
  },

  readPng: function(img) {
    var key = [104, 105, 100, 105, 109, 32, 105, 115, 32, 116, 111, 114, 114, 101, 110, 116, 115, 33];
    var data = this.extractFromImg(img);

    // Split the raw data into pixels (r, g, b, a)
    var pixels = this.inGroupsOf(data, 4);

    // Alpha is always set to fully opaque; we're not using it to store data so remove the alpha byte
    pixels = this.removeTransparency(pixels);

    // Group the pixel data into a matrix of rows, and reverse them since we are going to be reading upwards
    var rows = this.inGroupsOf(pixels, img.width).reverse();

    // Since we're scanning vertically instead of horizontally we need to transpose
    var transposed = this.transpose(rows);

    // Convert the matrix to a 1-dimensional array
    var torrent = this.flatten(this.flatten(transposed));

    // Find the beginning of our data by looking for the key
    var dataStart = this.containsArray(torrent, key);
    if(dataStart) {
      // Firebug.Console.log("Image contains an embedded torrent.");
    } else {
      // Firebug.Console.log("Image does not contain an embedded torrent.");
      return false;
    }

    // Read in some initial data just to check the line height
    var initialData = torrent.slice(dataStart + key.length);

    var lineHeight = this.retrieveInteger(initialData);
    // Firebug.Console.log("line height: " + lineHeight);

    // Adjust the array so that we only read the data inside the data block
    var torrentData = this.adjustForLineHeight(torrent, dataStart, parseInt(lineHeight), img.height);

    // Fast-forward past the data we've already read
    var offset = key.length + lineHeight.length + 2;
    torrentData.splice(0, offset);

    var torrentFilename = this.retrieveString(torrentData);
    // Firebug.Console.log("torrent filename: " + torrentFilename);
    // Firebug.Console.log(this.toChars(torrentData.slice(0, 50)).join(''));

    var torrentHash = this.retrieveString(torrentData);
    // Firebug.Console.log("torrent sha1: " + torrentHash);

    var contentLength = this.retrieveInteger(torrentData);
    // Firebug.Console.log("torrent content length: " + contentLength);

    var content = this.toChars(torrentData.slice(0, parseInt(contentLength))).join('');

    if(typeof(SHA1) == "undefined") {
      var computedHash = null;
    } else {
      var computedHash = SHA1.hex_sha1(content + "");
    }
    // Firebug.Console.log("computed sha1: " + computedHash);

    if(typeof(BitTorrent) == "undefined") {
      var bdecoded = null;
    } else {
      try {
        var bdecoded = BitTorrent.bdecode(content);
      } catch(err) {}
    }

    var result = {
      file: {
	data: content,
	sha1: computedHash
      },
      torrent: bdecoded,
      fileName: torrentFilename,
      sha1: torrentHash,
      length: contentLength,
      pixelHeight: lineHeight
    };

    return result;
  }
};
