const http = require('http');
const { exec } = require('child_process');

// Reuse existing httpRequest for login
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
                    headers: res.headers,
                    data: parsedData
                });
            });
        });

        req.on('error', (e) => reject(e));
        if (bodyString) req.write(bodyString);
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
            console.error('Login failed:', loginRes.statusCode);
            return;
        }

        const token = loginRes.data.data.token;
        const csrfToken = loginRes.headers['x-csrf-token'];
        console.log('Login successful.');

        // Get Category ID (hardcoded or fetched)
        // Ensure we have a valid ID. I'll fetch it.
        // Assuming Fetch works with token.
        // I'll skip fetch and use ID from previous log if possible?
        // Previous log ID: 698e2f2... wait, that was PRODUCT ID created.
        // Debug product validation script log ID: d80c53a130f518fca67
        // I'll assume that ID is valid. Or Fetch.
        // Fetching is safer.
        console.log('2. Fetching Category...');
        // I need to implement Authenticated httpRequest...
        // I'll execute CURL for fetch too, easier.
        // No, fetch is easy using httpRequest modification.
        // But simply: I'll use a hardcoded valid ID or trust the one from logs: 6973fdd6f6b832e8bbbc193b (from conversation log summary)
        const categoryId = '6973fdd6f6b832e8bbbc193b';

        console.log('3. Creating Product via CURL (Multipart)...');

        // Construct Curl Command
        // -F "field=value"
        const cmd = `curl -X POST http://localhost:5000/api/products \
            -H "Authorization: Bearer ${token}" \
            -H "x-csrf-token: ${csrfToken || ''}" \
            -F "name=CURL Product" \
            -F "description=Testing Multipart" \
            -F "price=10.00" \
            -F "stock=100" \
            -F "category=${categoryId}" \
            -F "type=game" \
            -F "platform=PC" \
            -F "region=Middle East" \
            -F "isActive=true"`;

        console.log('Running Curl...');
        exec(cmd, (error, stdout, stderr) => {
            if (error) {
                console.error(`Curl error: ${error.message}`);
                return;
            }
            if (stderr) {
                // console.error(`Curl stderr: ${stderr}`); // Curl logs progress here
            }
            console.log(`Curl stdout: ${stdout}`);
        });

    } catch (error) {
        console.error('Script Error:', error);
    }
}

debug();
