chrome.runtime.onInstalled.addListener(() => {
    console.log('Extension installed');
});

chrome.webRequest.onBeforeRequest.addListener(
    function(details) {
        console.log('API Call intercepted:', details.url);
    },
    {
        urls: ["https://partitionwala.kryzetech.com/api/categories*"]
    }
);