const fs = require('fs');
const token = JSON.parse(fs.readFileSync('token.json', 'utf-8'));
const expiraEm = token.obtido_em + token.expires_in * 1000;
const faltamMin = (expiraEm - Date.now()) / 1000 / 60;
console.log('access_token existe:', !!token.access_token);
console.log('refresh_token existe:', !!token.refresh_token);
console.log('obtido_em:', new Date(token.obtido_em).toLocaleString());
console.log('minutos restantes ate expirar:', faltamMin.toFixed(1));
console.log('data hora atual da VM:', new Date().toLocaleString());
