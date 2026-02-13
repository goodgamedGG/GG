const fs = require('fs');
const content = fs.readFileSync('server_final.log', 'utf8');
const lines = content.split('\n');
const relevant = lines.filter(l => l.includes('/api/cart') || l.includes('/api/users/login'));
console.log('Found logs:');
relevant.forEach(l => console.log(l));
