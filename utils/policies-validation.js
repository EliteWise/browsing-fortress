document.getElementById('consentButton').addEventListener('click', handleConsent);

function handleConsent() {
    chrome.tabs.getCurrent(function(tab) {
        if(tab && tab.id) chrome.tabs.remove(tab.id);
    });
}