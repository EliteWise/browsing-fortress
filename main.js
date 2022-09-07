chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        // chrome.runtime.reload();
        // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        
      }
    }
  );

function isObjectEmpty(object) {
  return JSON.stringify(object) === "{}";
}

function extractRoot(url) {
  return url.substr(url.indexOf("/") + 2).split('/')[0];
}

async function checkUrl (url) {
  const config = await fetch(chrome.runtime.getURL('/config.json')).then((resp) => resp.json()).then(result => result);
  const response = await fetch(config["server-ip"] + "/check-url", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"url": extractRoot(url)})
    }).catch(err => {
      console.log(err);
    });

    // When the server doesn't respond //
    if(response === undefined) {
      throw new Error('Check-url request error.');
    }

    if(await response.status === 204) {
      // The url doesn't exist, we call the safe browsing API //
      await requestSafeBrowsingAPI(url);
      return null;
    }

    // The url exist, we return a json object, containing the fields 'url' and 'isSafe' //
    // Status should be 200 //
    return await response.json();
}

function addUrl(url, isSafe, threatType, serverAddress) {
  fetch(serverAddress + "/add-url", {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({url: extractRoot(arguments[0]), isSafe: arguments[1], threatType: arguments[2]}),
  }).catch(err => {
    console.log(err);
  });
}

async function requestSafeBrowsingAPI(url) {
  const isLimitReached = await limitReached().then(result => result);
  if(isLimitReached) return;

  updateCheckerLimit(extractRoot(url));

  var requestBody = {
    "client": {
      "clientId": "yourcompanyname",
      "clientVersion": "1.5.2"
    },
    "threatInfo": {
      "threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING", "POTENTIALLY_HARMFUL_APPLICATION", "UNWANTED_SOFTWARE", "THREAT_TYPE_UNSPECIFIED"],
      "platformTypes":    ["WINDOWS"],
      "threatEntryTypes": ["URL"],
      "threatEntries": [
        {"url": url}
      ]
    }
  }

  Promise.all([
    fetch(chrome.runtime.getURL('/credentials.json')),
    fetch(chrome.runtime.getURL('/config.json')),
  ])
  .then((resp) => Promise.all(resp.map(r => r.json())))
  .then(function (files) {

    fetch("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + files[0]["webBrowsingAPI-key"], {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json'
    },
    body: JSON.stringify(requestBody),
  }).then(function(response) {
    console.log("API Reponse Status: " + response.status); // Will show the status
    if (!response.ok) {
        throw new Error("HTTP Status " + response.status);
    }
    return response.json();
})
  .then(data => {
    var serverAddress = files[1]["server-ip"];
    if(isObjectEmpty(data)) {
      // Url is Safe // 
      addUrl(url, true, null, serverAddress);

      messagePopup({url: extractRoot(url), isSafe: true});
      chrome.action.setIcon({path: "./images/secure-shield.png"});

      updateChromeStorageCounter(url, true);
      urlsInfos.pushUniqueUrl({url: extractRoot(url), isSafe: true});
    } else {
      // Url isn't Safe //
      var jsonData = JSON.stringify(data);
      addUrl(jsonData.url, false, jsonData.threatType, serverAddress);

      messagePopup({url: extractRoot(jsonData.url), isSafe: false, threatType: jsonData.threatType});
      sendNotification("The extension has detected a malicious site: " + extractRoot(jsonData.url));
      chrome.action.setIcon({path: "./images/unsecured-shield.png"});

      updateChromeStorageCounter(url, false);
      urlsInfos.pushUniqueUrl({url: extractRoot(url), isSafe: false, threatType: jsonData.threatType});
    }
  }).catch(err => {
    console.log(err);
  });
  }).catch(err => {
    console.log(err);
  });
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {

  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let url = tabs[0].url;

    // asynchronous call //

    checkUrl(url).then(resp => {

      // If error listed below is detected, execution will stop here //
      
      if(preventUrlErrors(resp)) return;

      // Check if the url is safe, then alert the client //
      messagePopup(resp);

      updateChromeStorageCounter(resp.url, resp.isSafe);
      urlsInfos.pushUniqueUrl(resp);

      updateIcon(resp.isSafe);
    });

  });

    return true;
});

// Array of objects, to store urls infos after the user has typed it //
var urlsInfos = [];

chrome.tabs.onActivated.addListener(function(activeInfo) {
  chrome.tabs.query({active: true, currentWindow: true}, tabs => {
    let url = tabs[0].url;
    console.log('Active Tab Url: ' + url);

    let urlInfo = urlsInfos.find(obj => obj['url'] == extractRoot(url));
    
    // If error listed below is detected, execution will stop here //

    if(preventUrlErrors(url)) return;

    messagePopup(urlInfo);

    // Check if the url is safe, then alert the client //
    updateIcon(urlInfo.isSafe);
  });
});

// Used to send data through a connection to popup.js //

function messagePopup(data) {
  chrome.runtime.onConnect.addListener(function(port) {
    console.log('Popup Connection Established.');
    port.postMessage(data);
    port.onMessage.addListener(function(msg) {
      port.postMessage(data);
    });
  });
}

function sendNotification(message, requireInteraction) {
  chrome.notifications.create(
    "install-notif",
    {
      type: "basic",
      iconUrl: "./images/secure-shield.png",
      title: "Url Checker",
      message: message,
      requireInteraction: requireInteraction,
    },
    function () {}
  );
}

function updateIcon(isSafe) {
  isSafe === true ? chrome.action.setIcon({path: "./images/secure-shield.png"}) : chrome.action.setIcon({path: "./images/unsecured-shield.png"});
  chrome.action.setTitle({ title: "Click to display the popup!" });
}

// Access Chrome Storage to store counters of the user //

function updateChromeStorageCounter(url, isSafe) {
  if(urlsInfos.find(elem => elem.url === url) != undefined) return;
    switch(isSafe) {
      case true:
        chrome.storage.sync.get(['countSafeUrls'], function(result) {
          chrome.storage.sync.set({countSafeUrls: (result.countSafeUrls == undefined ? 1 : result.countSafeUrls + 1)}, function() {
          });
        });
        break;
      case false:
        chrome.storage.sync.get(['countUnsafeUrls'], function(result) {
          chrome.storage.sync.set({countUnsafeUrls: (result.countUnsafeUrls == undefined ? 1 : result.countUnsafeUrls + 1)}, function() {
          });
        });
        break;
    }
}

var DateDiff = {
 
  inDays: function(d1, d2) {
      var t2 = d2.getTime();
      var t1 = d1.getTime();

      return Math.floor((t2-t1)/(24*3600*1000));
  }

}

function updateChromeStorageTimerLimit() {
  var dateNow = new Date();
  var limitTimer = 'limit-timer';
  chrome.storage.sync.get([limitTimer], function(result) {
    if(result[limitTimer] === undefined) {
      chrome.storage.sync.set({limitTimer: date});
      return;
    } else if(DateDiff.inDays(new Date(result[limitTimer]), dateNow) >= 1) {
      chrome.storage.sync.remove(['checker-limit']);
    }
  });
}

// Popup notification in the right corner //

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
      // Handle a first install
      sendNotification("The extension is successfully installed!", false);
  } else if(details.reason == "update"){
      // Handle an update
      sendNotification("The extension is successfully updated!", false);
  }
});

Array.prototype.pushUniqueUrl = function(obj) {
  urlsInfos.findIndex(elem => elem.url == obj.url) === -1 ? urlsInfos.push(obj) : null;
};

function preventUrlErrors(url) {
  if(url == undefined || url == null || url == 'chrome://newtab/' || url == 'chrome://extensions/' || url.length === 0) return true;
}

// Used to prevent request abuse from user, it set and update request counter in chrome storage //

function updateCheckerLimit(url) {
  if(urlsInfos.find(elem => elem.url === url) != undefined) return;

  chrome.storage.sync.get(['checker-limit']).then(result => {
    var checkerLimitValue = result['checker-limit'];
    console.log("Limit Value: " + checkerLimitValue);

    if(checkerLimitValue == undefined || checkerLimitValue == null) {
      chrome.storage.sync.set({'checker-limit': 1});
    } else {
      chrome.storage.sync.set({'checker-limit': checkerLimitValue + 1});
    }
  });

}

function limitReached() {
  return new Promise(function(resolve, reject) {
    chrome.storage.sync.get(['checker-limit'], function(result) {
    
      result['checker-limit'] >= 50 ? resolve(true) : resolve(false);
    });
  });
}
