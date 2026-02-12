const http = require('http');

// Helper wrapper for HTTP requests
function httpRequest(method, path, data = null, token = null, csrfToken = null) {
    return new Promise((resolve, reject) => {
        const options = {
            hostname: 'localhost',
            port: 5000,
            path: '/api' + path,
            method: method,
            headers: {
                'Content-Type': 'application/json'
            }
        };

        if (token) {
            options.headers['Authorization'] = `Bearer ${token}`;
        }

        if (csrfToken) {
            options.headers['x-csrf-token'] = csrfToken;
        }

        let bodyString = '';
        if (data) {
            bodyString = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);
        }

        const req = http.request(options, (res) => {
            let responseData = '';
            res.on('data', (chunk) => { responseData += chunk; });
            res.on('end', () => {
                let parsedData;
                try {
                    parsedData = JSON.parse(responseData);
                } catch (e) {
                    parsedData = responseData;
                }
                resolve({
                    statusCode: res.statusCode,
                    headers: res.headers, // Capture headers
                    data: parsedData
                });
            });
        });

        req.on('error', (e) => {
            reject(e);
        });

        if (bodyString) {
            req.write(bodyString);
        }
        req.end();
    });
}

async function debug() {
    try {
        console.log('1. Logging in...');
        const loginRes = await httpRequest('POST', '/auth/login', {
            email: 'admin@gamingstore.com',
            password: 'Admin@123456'
        });

        if (loginRes.statusCode !== 200) {
            console.error('Login failed:', loginRes.statusCode, loginRes.data);
            return;
        }

        const token = loginRes.data.data.token;
        // Capture CSRF token from login response headers
        let csrfToken = loginRes.headers['x-csrf-token'];
        console.log('Login successful. CSRF Token captured:', csrfToken ? 'Yes' : 'No');

        console.log('2. Fetching Category...');
        // We can skip this if we just reuse the CSRF token from login?
        // But get request creates NEW token.
        // And we might need category ID.
        // Let's create new token from category request to be fresh.
        const catRes = await httpRequest('GET', '/categories', null, token);

        // Update CSRF token from this response
        if (catRes.headers['x-csrf-token']) {
            csrfToken = catRes.headers['x-csrf-token'];
            console.log('Category Fetch: New CSRF Token captured');
        }

        let categories = [];
        if (catRes.data.data && catRes.data.data.categories) {
            categories = catRes.data.data.categories;
        } else if (catRes.data.categories) {
            categories = catRes.data.categories;
        }

        if (!categories || categories.length === 0) {
            console.error('No categories found.');
            return;
        }

        const categoryId = categories[0]._id;
        console.log('Using Category ID:', categoryId);

        console.log('3. Creating Product...');
        const productData = {
            name: 'API Debug Product',
            description: 'Testing via script',
            price: 99.99,
            stock: 10,
            category: categoryId,
            type: 'game',
            platform: 'PC',
            region: 'Middle East', // Testing this value
            isActive: true
        };

        const createRes = await httpRequest('POST', '/products', productData, token, csrfToken);
        console.log('Create Response Status:', createRes.statusCode);
        console.log('Create Response Data:', JSON.stringify(createRes.data, null, 2));

    } catch (error) {
        console.error('Script Error:', error);
    }
}

debug();
