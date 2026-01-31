
const verify = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products');
        const data = await response.json();

        console.log('=== API Products Verification ===');
        if (data.success && data.data && data.data.products) {
            console.log(`Found ${data.data.products.length} products`);
            data.data.products.forEach(p => {
                console.log(`Product: ${p.name}`);
                console.log(`- Images: ${JSON.stringify(p.images)}`);
            });
        } else {
            console.log('Failed to fetch products or data structure mismatch');
            console.log(JSON.stringify(data, null, 2));
        }
    } catch (err) {
        console.error('Connection failed. Is the server running?', err.message);
    }
};

verify();
