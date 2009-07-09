/* Hidim Reader */

var HidimReader = {
  init: function() {
    alert('Now click on the hidim...');

    // Initialize helper scripts
    var helpers = ["sha1.js", "base64.js", "read_png.js"];
    for(var i = 0; i < helpers.length; i++) {
      var n = document.createElement('script');
      n.setAttribute('language', 'Javascript');
      n.setAttribute('src', 'http://localhost:3000/javascripts/'+helpers[i]);
      document.body.appendChild(n);
    }

    var images = document.getElementsByTagName('img');

    for(var i = 0; i < images.length; i++) {
      var image = images[i];
      image.addEventListener('click', this.decodeHidim, false);
    }
  },

  decodeHidim: function() {
    var a = PngReader.readPng(this);
    document.location.href = "data:application/x-bittorrent;base64,"+Base64.encode(a.file.data);
  }
};

HidimReader.init();