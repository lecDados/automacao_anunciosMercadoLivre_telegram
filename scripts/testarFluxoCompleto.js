const { iniciarBot } = require('../src/services/telegramBot');
const { verificarPromocoes } = require('../src/jobs/monitorPromocoes');

async function testar() {
  console.log('Iniciando bot do Telegram para teste manual...\n');
  iniciarBot();

  // Pequena espera pra garantir que o bot conectou antes de buscar promoções
  await new Promise((resolve) => setTimeout(resolve, 2000));

  console.log('Buscando promoções e enviando...\n');
  await verificarPromocoes();

  console.log('\n✅ Teste concluído. Pressione Ctrl+C para encerrar.');
}

testar();