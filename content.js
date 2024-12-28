console.log('content page load');

function transformResponse(originalData) {
    return {
        message: "success",
        status: 1,
        data: Array.isArray(originalData) ? originalData : [originalData]
    };
}

const originalFetch = window.fetch;

window.fetch = async function(...args) {
    console.log('Intercepted fetch call:', args[0]);
    
    const response = await originalFetch(...args);
    
    if (args[0].includes('partitionwala.kryzetech.com/api/categories')) {
        console.log('Intercepting categories API response');
        
        const clone = response.clone();
        try {
            const originalData = await clone.json();
            const transformedData = transformResponse(originalData);
            
            console.log('Transformed response:', transformedData);
            
            return new Response(JSON.stringify(transformedData), {
                status: response.status,
                statusText: response.statusText,
                headers: response.headers
            });
        } catch (error) {
            console.error('Error transforming response:', error);
            return response;
        }
    }
    
    return response;
};

const XHR = XMLHttpRequest.prototype;
const open = XHR.open;
const send = XHR.send;
const setRequestHeader = XHR.setRequestHeader;

XHR.open = function(method, url) {
    this._method = method;
    this._url = url;
    this._requestHeaders = {};
    return open.apply(this, arguments);
};

XHR.setRequestHeader = function(header, value) {
    this._requestHeaders[header] = value;
    return setRequestHeader.apply(this, arguments);
};

XHR.send = function(postData) {
    this.addEventListener('load', function() {
        if (this._url.includes('partitionwala.kryzetech.com/api/categories')) {
            try {
                const originalData = JSON.parse(this.responseText);
                const transformedData = transformResponse(originalData);
                
                Object.defineProperty(this, 'response', {
                    value: JSON.stringify(transformedData)
                });
                Object.defineProperty(this, 'responseText', {
                    value: JSON.stringify(transformedData)
                });
                
                console.log('Modified XHR Response:', transformedData);
            } catch (err) {
                console.error('Error in XHR intercept:', err);
            }
        }
    });
    return send.apply(this, arguments);
};

console.log('Content script is running and API interceptor is active!');