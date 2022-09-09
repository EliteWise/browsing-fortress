window.onload = function() {
  console.log(Date());

  var dc = document.getElementById("discord-contact");
  
  if(dc) {
    dc.addEventListener("click", (elem) => {
      chrome.tabs.create({url: elem.target.getAttribute("href")});
    });
  }

  var ec = document.getElementById("email-contact");
  
  if(ec) {
    ec.addEventListener("click", (elem) => {
      chrome.tabs.create({url: elem.target.getAttribute("href")});
    });
  }
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
    
    // Is Safe Update //

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