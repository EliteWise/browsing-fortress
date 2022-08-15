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

    document.getElementById("safe").innerHTML = msg.isSafe === true ? "Safe: Yes" : "Safe: No";
    
});