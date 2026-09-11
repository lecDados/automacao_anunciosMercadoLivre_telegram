const { buscarMaisVendidosCategoria } = require('./src/services/mercadoLivre');

// Vamos forçar a renovacao chamando a funcao interna diretamente
const fs = require('fs');
const path = require('path');

async function testar() {
  console.log('Testando renovacao de token...');
  const resultado = await buscarMaisVendidosCategoria('MLB1144');
  console.log('Resultado:', resultado.length, 'itens encontrados');
}

testar().catch(e => console.log('Erro final:', e.message));
