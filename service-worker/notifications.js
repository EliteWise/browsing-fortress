function sendNotification(message, requireInteraction, isSafe) {
    chrome.notifications.create(
      "general-notif",
      {
        type: "basic",
        iconUrl: isSafe ? SECURE_SHIELD_ICON_PATH : UNSECURED_SHIELD_ICON_PATH,
        title: "Browsing Fortress",
        message: message,
        requireInteraction: requireInteraction,
      },
      function () {}
    );
  }

  function sendInstallUpdateNotification(message) {
    chrome.notifications.create(
      "install-update-notif",
      {
        type: "basic",
        iconUrl: MAIN_SHIELD_ICON_PATH,
        title: "Browsing Fortress",
        message: message,
        requireInteraction: false,
      },
      function () {}
    );
  }

// Popup notification in the right corner //

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
      // Confirmation of data collection policies
      chrome.tabs.create({ url: "policies.html" })

      // Handle a first install
      sendInstallUpdateNotification("The extension is successfully installed!");
  } else if(details.reason == "update"){
      // Handle an update
      sendInstallUpdateNotification("The extension is successfully updated!");
  }
});

function updateIconNotifs(isSafe, url) {
  chrome.action.setTitle({ title: "Click to display the popup!" });
  chrome.action.setIcon({path: SECURE_SHIELD_ICON_PATH});
  if(!isSafe) {
    chrome.action.setIcon({path: UNSECURED_SHIELD_ICON_PATH});
    sendNotification(MALICIOUS_WEBSITE_TEXT + extractRoot(url), true, isSafe);
  }
}