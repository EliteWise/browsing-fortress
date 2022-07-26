chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        chrome.runtime.reload();
        console.log("Client Url: " + changeInfo.url);
        // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        
      }
    }
  );

chrome.runtime.onMessage.addListener((msg, sender, response) => {

  chrome.tabs.query({active: true, lastFocusedWindow: true}, tabs => {
    let url = tabs[0].url;
    console.log('Active Tab Url: ' + url)
    // asynchronous //
  });

    var requestBody = {
      "client": {
        "clientId": "yourcompanyname",
        "clientVersion": "1.5.2"
      },
      "threatInfo": {
        "threatTypes":      ["MALWARE", "SOCIAL_ENGINEERING"],
        "platformTypes":    ["WINDOWS"],
        "threatEntryTypes": ["URL"],
        "threatEntries": [
          {"url": "www.assurancesmaladie.net"}
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
    }).then(res => res.json())
    .then(data => console.log('API Response: ' + JSON.stringify(data)));

    });

    return true;
});