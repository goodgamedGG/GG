const http = require('http');
const { exec } = require('child_process');

function httpRequest(method, path, data = null) {
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

        if (data) {
            const bodyString = JSON.stringify(data);
            options.headers['Content-Length'] = Buffer.byteLength(bodyString);

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
                        headers: res.headers,
                        data: parsedData
                    });
                });
            });
            req.on('error', (e) => reject(e));
            req.write(bodyString);
            req.end();
        } else {
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
                        headers: res.headers,
                        data: parsedData
                    });
                });
            });
            req.on('error', (e) => reject(e));
            req.end();
        }
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
            console.error('Login failed:', loginRes.statusCode);
            return;
        }

        const token = loginRes.data.data.token;
        const csrfToken = loginRes.headers['x-csrf-token'];
        console.log('Login successful.');

        const categoryId = '6973fdd6f6b832e8bbbc193b';

        console.log('2. Creating Product via CURL (Multipart)...');

        // Use a dummy file for upload? I don't have one easily accessible relative to script.
        // Curl can use `-F "images=@/path/to/file"`.
        // I need an image file.
        // I'll create a dummy text file and rename to .txt (GridFS accepts anything, but filter checks mimetype).
        // My middleware checks `mimetype.startsWith('image/')`.
        // Curl handles MIME type based on extension.
        // I'll create `test.jpg` (empty or random bytes).
        require('fs').writeFileSync('test.jpg', 'dummy image content');

        const cmd = `curl -X POST http://localhost:5000/api/products \
            -H "Authorization: Bearer ${token}" \
            -H "x-csrf-token: ${csrfToken || ''}" \
            -F "name=GridFS Product" \
            -F "description=Testing GridFS" \
            -F "price=10.00" \
            -F "stock=100" \
            -F "category=${categoryId}" \
            -F "type=game" \
            -F "platform=PC" \
            -F "region=Europe" \
            -F "isActive=true" \
            -F "images=@test.jpg"`;

        console.log('Running Curl...');
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Curl error: ${error.message}`);
                return;
            }
            console.log(`Curl stdout: ${stdout}`);

            try {
                const response = JSON.parse(stdout);
                if (response.success && response.data.product.images.length > 0) {
                    const imageUrl = response.data.product.images[0];
                    console.log('Image URL:', imageUrl);

                    // fetch image
                    const fetchOptions = {
                        hostname: 'localhost',
                        port: 5000,
                        path: imageUrl.replace('http://localhost:5000', ''), // Extract path
                        method: 'GET'
                    };

                    const req = http.request(fetchOptions, (res) => {
                        console.log('Image Fetch Status:', res.statusCode);
                        console.log('Content-Type:', res.headers['content-type']);
                    });
                    req.end();
                } else {
                    console.log('No images in response product.');
                }
            } catch (e) {
                console.log('Failed to parse curl output');
            }

            // Cleanup
            require('fs').unlinkSync('test.jpg');
        });

    } catch (error) {
        console.error('Script Error:', error);
    }
}

debug();
