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
        const myUrl = this._url;
        
        if (myUrl.includes('/api/categories')) {
            const responseBody = this.response;
            try {
                const data = JSON.parse(responseBody);
                if (data.length >= 2) {
                    let temp = data[0];
                    data[0] = data[1];
                    data[1] = temp;
                }
                
                Object.defineProperty(this, 'response', {
                    value: JSON.stringify(data)
                });
                Object.defineProperty(this, 'responseText', {
                    value: JSON.stringify(data)
                });
                
                console.log('Modified API Response:', data);
            } catch (err) {
                console.error('Error modifying response:', err);
            }
        }
    });
    return send.apply(this, arguments);
};

const originalFetch = window.fetch;
window.fetch = async function(...args) {
    const response = await originalFetch(...args);
    
    if (args[0].includes('/api/categories')) {
        const clone = response.clone();
        const data = await clone.json();
        
        if (data.length >= 2) {
            let temp = data[0];
            data[0] = data[1];
            data[1] = temp;
        }
        
        return new Response(JSON.stringify(data), {
            status: response.status,
            statusText: response.statusText,
            headers: response.headers
        });
    }
    
    return response;
};

console.log('Content script is running and API interceptor is active!');