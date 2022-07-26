chrome.runtime.sendMessage({name: 'callAPI'}, (response) => {
    console.log(response);
});