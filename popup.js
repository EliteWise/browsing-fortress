window.onload = function() {
  console.log("onload" + Date())
}

var port = chrome.runtime.connect();
port.onMessage.addListener(function(msg) {

    /*if(chrome.runtime.lastError) {
      console.log(chrome.runtime.lastError.message);
    }*/

    // URL Update //

    var url = document.getElementById("url");
    url.style.textDecoration = "underline";
    url.style.fontSize = "17";
    url.innerHTML = msg.url;
    
    var safeCounter = document.getElementById("safeCounter");
    safeCounter.innerHTML = msg.isSafe;

<<<<<<< HEAD
  
    var unsafeCounter = document.getElementById("unsafeCounter");
    unsafeCounter.innerHTML = msg.isSafe;
    
    
    
=======
    // Is Safe Update //

>>>>>>> 3e1e27606043db5433809922784f1135d63de26e
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

    // Counter Update //
    
    chrome.storage.sync.get(['countSafeUrls', 'countUnsafeUrls']).then(result => {
      document.getElementById("safe-counter").innerHTML = result.countSafeUrls;
      document.getElementById("unsafe-counter").innerHTML = (result.countUnsafeUrls === undefined ? 0 : result.countUnsafeUrls);
    });

});