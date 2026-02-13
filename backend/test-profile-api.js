const dotenv = require('dotenv');
dotenv.config();

const API_URL = 'http://localhost:5000/api';

const loginAndGetProfile = async () => {
    try {
        console.log('Logging in...');
        const loginRes = await fetch(`${API_URL}/auth/login`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                email: 'youssefpls9@gmail.com',
                password: 'password123'
            })
        });

        if (!loginRes.ok) throw new Error(`Login failed: ${loginRes.status}`);

        const loginData = await loginRes.json();
        const token = loginData.data.token;
        console.log('Login successful. Token obtained.');

        console.log('Fetching profile...');
        const profileRes = await fetch(`${API_URL}/users/profile`, {
            method: 'GET',
            headers: {
                Authorization: `Bearer ${token}`
            }
        });

        if (!profileRes.ok) throw new Error(`Profile fetch failed: ${profileRes.status}`);

        const profileData = await profileRes.json();
        console.log('Profile Response Data:');
        console.log(JSON.stringify(profileData, null, 2));

    } catch (error) {
        console.error('Error:', error.message);
    }
};

loginAndGetProfile();
