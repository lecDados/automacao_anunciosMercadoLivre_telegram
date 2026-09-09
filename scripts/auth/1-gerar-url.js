const { mercadoLivre } = require('../../src/config/env');

if (!mercadoLivre.clientId) {
  console.error('❌ ML_CLIENT_ID não encontrado no .env. Confira se você preencheu corretamente.');
  process.exit(1);
}

const url =
  `https://auth.mercadolivre.com.br/authorization` +
  `?response_type=code` +
  `&client_id=${mercadoLivre.clientId}` +
  `&redirect_uri=${encodeURIComponent(mercadoLivre.redirectUri)}`;

console.log('\n📋 Copie e cole esta URL no navegador:\n');
console.log(url);
console.log('\n➡️  Faça login, autorize a aplicação, e você será redirecionado para o Google.');
console.log('➡️  Copie o valor do parâmetro "code" que aparece na URL depois do redirecionamento.');
console.log('   Exemplo: https://www.google.com/?code=TG-XXXXXXXXXXXX-000000');
console.log('   O código é a parte depois de "code=" (e antes de qualquer "&", se houver)\n');