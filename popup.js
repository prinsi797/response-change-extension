document.getElementById('testApi').addEventListener('click', async () => {
    const resultDiv = document.getElementById('result');
    try {
        const [tab] = await chrome.tabs.query({ active: true, currentWindow: true });
        
        chrome.scripting.executeScript({
            target: { tabId: tab.id },
            function: async () => {
                const response = await fetch('https://partitionwala.kryzetech.com/api/categories', {
                    method: 'GET',
                    headers: {
                        'Accept': 'application/json',
                        'Content-Type': 'application/json'
                    }
                });
                return await response.json();
            }
        }, (results) => {
            if (results && results[0] && results[0].result) {
                resultDiv.textContent = JSON.stringify(results[0].result, null, 2);
                console.log('Modified data:', results[0].result);
            }
        });
    } catch (error) {
        resultDiv.textContent = 'Error: ' + error.message;
        console.error('Error:', error);
    }
});