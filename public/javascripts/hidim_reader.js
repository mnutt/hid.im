/* Hidim Reader */

var HidimReader = {
  init: function() {
    var helpBox = document.createElement('div');
    helpBox.style.backgroundColor = "rgba(0, 0, 0, 0.9)";
    helpBox.style.color = "#FFFFFF";
    helpBox.style.fontSize = "12px";
    helpBox.style.fontFamily = '"Droid Sans", Helvetica, sans-serif;';
    helpBox.style.padding = "8px";
    helpBox.style.position = "fixed";
    helpBox.style.display = "block";
    helpBox.style.visibility = "normal";
    helpBox.style.top = "30px";
    helpBox.style.textAlign = "center";
    helpBox.style.MozBorderRadius = "5px";
    helpBox.style.WebkitBorderRadius = "5px";
    helpBox.style.left = ((document.body.clientWidth / 2) - 250) + "px";
    helpBox.style.width = "500px";

    var titleLabel = document.createElement('div');
    titleLabel.style.fontSize = "24px";
    titleLabel.innerHTML = "Hidim Decoder";

    helpBox.appendChild(titleLabel);
    helpBox.innerHTML += "Click on a hidim on this page to download it.  ";
    helpBox.innerHTML += "Refresh the page to close the Hidim Decoder.  ";
    helpBox.innerHTML += "Tested in FireFox 3 and Safari 4.";

    document.body.appendChild(helpBox);

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
      image.addEventListener('click', this.addInfo, false);
    }
  },

  addInfo: function() {
    var a = PngReader.readPng(this);
    var data = "data:application/x-bittorrent;base64,"+Base64.encode(a.file.data);

    var infoButton = document.createElement('div');
    infoButton.style.backgroundColor = "#000000";
    infoButton.style.color = "#FFFFFF";
    infoButton.style.fontSize = "10px";
    infoButton.style.fontFamily = '"Droid Sans", Helvetica, sans-serif;';
    infoButton.style.padding = "4px";
    infoButton.style.position = "absolute";
    infoButton.style.display = "block";
    infoButton.style.visibility = "normal";
    infoButton.style.top = (this.offsetTop + this.height) + "px";
    infoButton.style.left = (this.offsetLeft) + "px";
    infoButton.style.width = (Math.max(300, this.width) - 8) + "px";

    infoButton.innerHTML = " <b>" + a.fileName + "</b>";
    infoButton.innerHTML += " <br> Torrent Length: " + parseInt(a.length / 1024) + "KB";
    infoButton.innerHTML += " <br> SHA1 Hash: " + a.file.sha1;
    if(a.file.sha1 == a.sha1) {
      infoButton.innerHTML += " (PASS)";
    } else {
      infoBUtton.innerHTML += " (FAIL)";
    }
    infoButton.innerHTML += " <br>";

    var downloadLink = document.createElement('a');
    downloadLink.href = data;
    downloadLink.style.color = "#FFFFFF";
    downloadLink.style.backgroundColor = "#000000";
    downloadLink.innerHTML = "download";
    infoButton.appendChild(downloadLink);

    document.body.appendChild(infoButton);
    return false;
  },

  decodeHidim: function() {
    document.location.href = "data:application/x-bittorrent;base64,"+Base64.encode(a.file.data);
  }
};

HidimReader.init();