chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        //chrome.runtime.reload();
        // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        
      }
    }
  );

function isObjectEmpty(object) {
  return JSON.stringify(object) === "{}";
}

async function checkUrl (url) {
  const response = await fetch("http://localhost:3000/check-url", {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({"url": url})
    }); 

    if(await response.status === 204) {
      // The url doesn't exist, we call the safe browsing API //
      requestSafeBrowsingAPI(url);
      return null;
    }

    // The url exist, we return a json object, containing the fields 'url' and 'isSafe' //
    return await response.json();
}

function requestSafeBrowsingAPI(url) {
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

  fetch(chrome.runtime.getURL('/credentials.json'))
  .then((resp) => resp.json())
  .then(function (credentials) {

    fetch("https://safebrowsing.googleapis.com/v4/threatMatches:find?key=" + credentials[0]["webBrowsingAPI-key"], {
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
  .then(data => console.log("API Response: " + (isObjectEmpty(data) ? 'Safe' : JSON.stringify(data))));
  });
}

chrome.runtime.onMessage.addListener((msg, sender, response) => {

  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    console.log('Active Tab Url: ' + url)

    // asynchronous call //

    checkUrl(url).then(resp =>
      console.log(resp)
      // Check if the url is safe, then alert the client //
    );

  });

    return true;
});