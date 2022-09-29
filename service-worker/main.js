try {
  importScripts('./notifications.js', '../utils/date.js', './chrome-storage.js', '../utils/modifier.js', '../utils/constant.js');
} catch (e) {
  console.error(e);
}

chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        // chrome.runtime.reload();
        // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        
      }
    }
  );

async function checkUrl (url) {
  const config = await fetch(chrome.runtime.getURL('../config.json')).then((resp) => resp.json()).then(result => result);
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
      "clientId": "Url-Ckecker",
      "clientVersion": "1.0.0"
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
    fetch(chrome.runtime.getURL('../credentials.json')),
    fetch(chrome.runtime.getURL('../config.json')),
  ])
  .then((resp) => Promise.all(resp.map(r => r.json())))
  .then(function (files) {

    fetch(files[1]["safebrowsing-url"] + "/threatMatches:find?key=" + files[0]["safebrowsingAPI-key"], {
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
      chrome.action.setIcon({path: SECURE_SHIELD_ICON_PATH});

      updateChromeStorageCounter(url, true);
      urlsInfos.pushUniqueUrl({url: extractRoot(url), isSafe: true});
    } else {
      // Url isn't Safe //
      var jsonData = JSON.stringify(data);
      addUrl(jsonData.url, false, jsonData.threatType, serverAddress);

      messagePopup({url: extractRoot(jsonData.url), isSafe: false, threatType: jsonData.threatType});
      sendNotification(MALICIOUS_WEBSITE_TEXT + extractRoot(jsonData.url));
      chrome.action.setIcon({path: UNSECURE_SHIELD_ICON_PATH});

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

      updateIconNotifs(resp.isSafe, resp.url);
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
    updateIconNotifs(urlInfo.isSafe, url);
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

Array.prototype.pushUniqueUrl = function(obj) {
  urlsInfos.findIndex(elem => elem.url == obj.url) === -1 ? urlsInfos.push(obj) : null;
};

function preventUrlErrors(url) {
  if(url == undefined || url == null || url == 'chrome://newtab/' || url == 'chrome://extensions/' || url.length === 0) return true;
}
