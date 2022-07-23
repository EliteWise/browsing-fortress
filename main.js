chrome.tabs.onUpdated.addListener(function
    (tabId, changeInfo, tab) {
        chrome.runtime.reload();
        console.log("Client Url: " + changeInfo.url);
      // read changeInfo data and do something with it (like read the url)
      if (changeInfo.url) {
        
      }
    }
  );