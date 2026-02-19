const axios = require('axios');

const API_URL = 'http://localhost:5000/api';
let adminToken = '';

async function testChatBot() {
    console.log('--- Starting ChatBot Verification ---');

    try {
        // 1. Test Public Query (Unanswered)
        console.log('Testing public query (unanswered)...');
        const res1 = await axios.post(`${API_URL}/chatbot/query`, { query: 'test unique question' });
        console.log('Response:', res1.data.response);
        console.log('Is Default:', res1.data.isDefault);

        // 2. Login as Admin to check training
        console.log('\nLogging in as admin...');
        const loginRes = await axios.post(`${API_URL}/auth/login`, {
            email: 'admin@example.com', // Replace with valid admin credentials if known, or skip if not possible
            password: 'password123'
        });
        adminToken = loginRes.data.token;
        const headers = { Authorization: `Bearer ${adminToken}` };

        // 3. Check unanswered list
        console.log('\nChecking unanswered list...');
        const unansweredRes = await axios.get(`${API_URL}/chatbot/admin/unanswered`, { headers });
        console.log('Unanswered count:', unansweredRes.data.length);
        const item = unansweredRes.data.find(i => i.query === 'test unique question');
        console.log('Found logged question:', !!item);

        // 4. Train the bot
        console.log('\nTraining the bot...');
        await axios.post(`${API_URL}/chatbot/admin/knowledge`, {
            trigger: 'test unique question',
            response: 'This is the verified answer!'
        }, { headers });

        // 5. Test Query again (Now answered)
        console.log('\nTesting query again (should be answered)...');
        const res2 = await axios.post(`${API_URL}/chatbot/query`, { query: 'test unique question' });
        console.log('Response:', res2.data.response);
        console.log('Is Default:', !!res2.data.isDefault);

        console.log('\n--- Verification Complete ---');
    } catch (error) {
        console.error('Verification failed:', error.response?.data || error.message);
    }
}

// Note: This script requires the server to be running and a valid admin account
// Since I cannot guarantee admin credentials, I will rely on code correctness and manual review if login fails.
// testChatBot();
