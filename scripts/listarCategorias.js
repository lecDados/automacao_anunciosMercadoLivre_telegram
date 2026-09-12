const axios = require('axios');
const fs = require('fs');

function lerAccessToken() {
  try {
    return JSON.parse(fs.readFileSync('token.json', 'utf-8')).access_token;
  } catch {
    return null;
  }
}

const headers = () => {
  const token = lerAccessToken();
  return token ? { Authorization: `Bearer ${token}` } : {};
};

async function main() {
  // 1. Lista todas as categorias principais (nível raiz)
  const { data: principais } = await axios.get('https://api.mercadolibre.com/sites/MLB/categories', {
    headers: headers(),
  });

  console.log('=== Categorias principais ===');
  principais.forEach((c) => console.log(c.id, '-', c.name));

  // 2. Procura a categoria "Informática" e mostra as subcategorias dela
  const informatica = principais.find((c) => c.name.toLowerCase().includes('informática'));

  if (informatica) {
    console.log(`\n=== Subcategorias de "${informatica.name}" (${informatica.id}) ===`);
    const { data: detalhe } = await axios.get(`https://api.mercadolibre.com/categories/${informatica.id}`, {
      headers: headers(),
    });
    detalhe.children_categories.forEach((c) => console.log(c.id, '-', c.name));
  } else {
    console.log('\nCategoria "Informática" não encontrada na lista principal — pode estar dentro de outra.');
  }

  // 3. Procura "Games" (as vezes fica separado de Consoles e Video Games)
  const games = principais.find((c) => c.name.toLowerCase().includes('game'));
  if (games) {
    console.log(`\n=== Subcategorias de "${games.name}" (${games.id}) ===`);
    const { data: detalheGames } = await axios.get(`https://api.mercadolibre.com/categories/${games.id}`, {
      headers: headers(),
    });
    detalheGames.children_categories.forEach((c) => console.log(c.id, '-', c.name));
  }
}

main().catch((e) => {
  console.error('Erro:', e.message);
  if (e.response) {
    console.error('Status:', e.response.status);
    console.error('Detalhe:', JSON.stringify(e.response.data));
  }
});