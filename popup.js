window.onload = function() {
    console.log("onload" + Date())
  }

var port = chrome.runtime.connect();
port.onMessage.addListener(function(msg) {

    /*if(chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }*/

    var url = document.getElementById("url");
    url.style.textDecoration = "underline";
    url.style.fontSize = "17";
    url.innerHTML = msg.url;

    switch(msg.isSafe) {
      case true:
        document.getElementById("safe").innerHTML = "Safe: Yes";
        document.body.style.background = 'linear-gradient(to right, #00b09b, #96c93d)';
        break;
      case false:
        document.getElementById("safe").innerHTML = "Safe: No";
        document.body.style.background = 'linear-gradient(to right, #870000, #190a05)';
        break;
    }
    
});