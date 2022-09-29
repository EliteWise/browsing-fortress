const CHECKER_LIMIT_FIELD = 'checker-limit';

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
  
  function updateChromeStorageTimerLimit() {
    var dateNow = new Date();
    var limitTimer = 'limit-timer';
    chrome.storage.sync.get([limitTimer], function(result) {
      if(result[limitTimer] === undefined) {
        chrome.storage.sync.set({limitTimer: date});
        return;
      } else if(DateDiff.inDays(new Date(result[limitTimer]), dateNow) >= 1) {
        chrome.storage.sync.remove([CHECKER_LIMIT_FIELD]);
      }
    });
  }

// Used to prevent request abuse from user, it set and update request counter in chrome storage //

function updateCheckerLimit(url) {
    if(urlsInfos.find(elem => elem.url === url) != undefined) return;
  
    chrome.storage.sync.get([CHECKER_LIMIT_FIELD]).then(result => {
      var checkerLimitValue = result[CHECKER_LIMIT_FIELD];
      console.log("Limit Value: " + checkerLimitValue);
  
      if(checkerLimitValue == undefined || checkerLimitValue == null) {
        chrome.storage.sync.set({[CHECKER_LIMIT_FIELD]: 1});
      } else {
        chrome.storage.sync.set({[CHECKER_LIMIT_FIELD]: checkerLimitValue + 1});
      }
    });
  
  }
  
  function limitReached() {
    return new Promise(function(resolve, reject) {
      chrome.storage.sync.get([CHECKER_LIMIT_FIELD], function(result) {
      
        result[CHECKER_LIMIT_FIELD] >= 50 ? resolve(true) : resolve(false);
      });
    });
  }