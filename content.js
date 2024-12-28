console.log('content page load');

function transformResponse(originalData) {
    return {
        message: "success",
        status: 1,
        data: Array.isArray(originalData) ? originalData : [originalData]
    };
}
const XHR = XMLHttpRequest.prototype;
const open = XHR.open;
const send = XHR.send;
const setRequestHeader = XHR.setRequestHeader;

XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    this._startTime = (new Date()).toISOString();
    return open.apply(this, arguments);
};

XHR.setRequestHeader = function(header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
};

XHR.send = function(postData) {
    this.addEventListener('load', function() {
        try {
            const responseBody = this.response;
            const originalData = JSON.parse(responseBody);
            const transformedData = transformResponse(originalData);
            
            Object.defineProperty(this, 'response', {
                value: JSON.stringify(transformedData)
            });
            Object.defineProperty(this, 'responseText', {
                value: JSON.stringify(transformedData)
            });
            
            console.log('Modified API Response:', transformedData);
        } catch (err) {
            console.error('Error modifying response:', err);
        }
    });
    return send.apply(this, arguments);
};

const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    const clone = response.clone();
    try {
        const originalData = await clone.json();
        const transformedData = transformResponse(originalData);
        
        return new Response(JSON.stringify(transformedData), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    } catch (error) {
        return response;
    }
};

console.log('Content script is running and API interceptor is active!');