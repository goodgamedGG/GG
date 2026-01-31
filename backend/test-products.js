// Test with full error details
const http = require('http');

const makeRequest = (url) => {
    return new Promise((resolve, reject) => {
        http.get(url, (res) => {
            let data = '';
            res.on('data', (chunk) => data += chunk);
            res.on('end', () => {
                try {
                    resolve({ status: res.statusCode, headers: res.headers, data: JSON.parse(data) });
                } catch (e) {
                    resolve({ status: res.statusCode, headers: res.headers, data: data });
                }
            });
        }).on('error', reject);
    });
};

(async () => {
    console.log('Testing /api/admin/products endpoint...\n');

    try {
        const result = await makeRequest('http://localhost:5000/api/admin/products?page=1&limit=20');
        console.log('Status:', result.status);
        console.log('Response:', JSON.stringify(result.data, null, 2));
    } catch (error) {
        console.error('Error:', error.message);
    }
})();
