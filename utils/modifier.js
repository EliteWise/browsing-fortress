function isObjectEmpty(object) {
    return JSON.stringify(object) === "{}";
}
  
function extractRoot(url) {
    return url.substr(url.indexOf("/") + 2).split('/')[0];
}