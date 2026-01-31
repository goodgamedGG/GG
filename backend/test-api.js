// Test CSRF and Admin Products API
const testAPI = async () => {
    const baseURL = 'http://localhost:5000';

    console.log('=== Testing CSRF Token Endpoint ===');
    try {
        const csrfResponse = await fetch(`${baseURL}/api/auth/csrf-token`, {
            credentials: 'include'
        });
        const csrfData = await csrfResponse.json();
        console.log('CSRF Response:', csrfResponse.status, csrfData);

        // Get the CSRF token from cookie
        const cookies = csrfResponse.headers.get('set-cookie');
        console.log('Cookies:', cookies);
    } catch (error) {
        console.error('CSRF Error:', error);
    }

    console.log('\n=== Testing Admin Products Endpoint ===');
    try {
        const productsResponse = await fetch(`${baseURL}/api/admin/products`, {
            credentials: 'include',
            headers: {
                'Authorization': 'Bearer YOUR_TOKEN_HERE' // Replace with actual token
            }
        });
        const productsData = await productsResponse.json();
        console.log('Products Response:', productsResponse.status);
        console.log('Products Data:', JSON.stringify(productsData, null, 2));
    } catch (error) {
        console.error('Products Error:', error);
    }
};

testAPI();
