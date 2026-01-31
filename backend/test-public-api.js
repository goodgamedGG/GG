const test = async () => {
    try {
        const response = await fetch('http://localhost:5000/api/products?active=true');
        const data = await response.json();
        console.log('=== Public API Results ===');
        console.log(`Count: ${data.data.products.length}`);
        data.data.products.forEach(p => console.log(`- ${p.name} (Active: ${p.isActive})`));
    } catch (err) {
        console.error(err);
    }
};

test();
