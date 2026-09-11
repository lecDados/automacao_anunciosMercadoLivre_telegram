const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mercadoLivre } = require('../../src/config/env');

const code = process.argv[2];

if (!code) {
  console.error('❌ Uso: node scripts/auth/2-trocar-token.js SEU_CODIGO_AQUI');
  process.exit(1);
}

async function trocarToken() {
  try {
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
      params: {
        grant_type: 'authorization_code',
        client_id: mercadoLivre.clientId,
        client_secret: mercadoLivre.clientSecret,
        code,
        redirect_uri: mercadoLivre.redirectUri,
      },
    });

    const tokenPath = path.join(__dirname, '../../token.json');
    const tokenComTimestamp = { ...response.data, obtido_em: Date.now() };
    fs.writeFileSync(tokenPath, JSON.stringify(tokenComTimestamp, null, 2));

    console.log('✅ Token obtido com sucesso e salvo em token.json!\n');
    console.log('access_token:', response.data.access_token.slice(0, 15) + '...');
    console.log('expira em (segundos):', response.data.expires_in);
    console.log('refresh_token:', response.data.refresh_token ? 'presente ✅' : 'ausente ⚠️');
  } catch (error) {
    console.error('❌ Erro ao trocar código por token:');
    console.error(error.response?.data || error.message);
  }
}

trocarToken();