const axios = require('axios');
const fs = require('fs');
const path = require('path');

const tokenPath = path.join(__dirname, '../token.json');
let accessToken = null;

try {
  accessToken = JSON.parse(fs.readFileSync(tokenPath, 'utf-8')).access_token;
} catch {
  console.log('⚠️  token.json não encontrado, testando sem autenticação.\n');
}

const headers = accessToken ? { Authorization: `Bearer ${accessToken}` } : {};

const endpoints = [
  {
    nome: 'Categorias do site (MLB)',
    url: 'https://api.mercadolibre.com/sites/MLB/categories',
  },
  {
    nome: 'Categoria "Consoles e Video Games" (MLB1144)',
    url: 'https://api.mercadolibre.com/categories/MLB1144',
  },
  {
    nome: 'Mais vendidos da categoria MLB1144',
    url: 'https://api.mercadolibre.com/highlights/MLB/category/MLB1144',
  },
  {
    nome: 'Busca (endpoint que sabemos estar bloqueado)',
    url: 'https://api.mercadolibre.com/sites/MLB/search?q=ps5',
  },
];

async function testarTodos() {
  for (const ep of endpoints) {
    try {
      const res = await axios.get(ep.url, { headers });
      console.log(`✅ ${ep.nome} — status ${res.status} — OK`);
    } catch (err) {
      const status = err.response?.status || 'sem resposta';
      const msg = err.response?.data?.message || err.message;
      console.log(`❌ ${ep.nome} — status ${status} — ${msg}`);
    }
  }
}

testarTodos();