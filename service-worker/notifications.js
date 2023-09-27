function sendNotification(message, requireInteraction, isSafe) {
    chrome.notifications.create(
      "install-notif",
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

// Popup notification in the right corner //

chrome.runtime.onInstalled.addListener(function(details){
  if(details.reason == "install"){
      // Confirmation of data collection policies
      chrome.tabs.create({ url: "policies.html" })

      // Handle a first install
      sendNotification("The extension is successfully installed!", false, true);
  } else if(details.reason == "update"){
      // Handle an update
      sendNotification("The extension is successfully updated!", false, true);
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