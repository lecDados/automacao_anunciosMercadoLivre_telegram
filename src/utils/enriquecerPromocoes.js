const { buscarProdutoCatalogo } = require('../services/mercadoLivre');
const { paraLinkDeAfiliado } = require('./linkAfiliado');

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Para cada promoção detectada, busca o nome real do produto no catálogo
 * (o endpoint /items/{id} está bloqueado atualmente, então usamos
 * /products/{id}, que ainda funciona, pra pegar o nome).
 * Faz isso só para os itens que JÁ são promoção, pra economizar chamadas à API.
 * @param {Array} promocoes - lista já filtrada por calcularDesconto/filtrarPromocoes
 * @param {number} pausaMs - pausa entre cada chamada, em milissegundos (padrão 300ms)
 */
async function enriquecerPromocoes(promocoes, pausaMs = 300) {
  const resultado = [];

  for (const promo of promocoes) {
    if (!promo.catalogProductId) {
      resultado.push(promo);
      continue;
    }

    const produto = await buscarProdutoCatalogo(promo.catalogProductId);

    resultado.push({
      ...promo,
      titulo: produto?.name || promo.titulo,
      link: paraLinkDeAfiliado(`https://www.mercadolivre.com.br/p/${promo.catalogProductId}`),
      thumbnail: produto?.pictures?.[0]?.url || promo.thumbnail,
    });

    await aguardar(pausaMs);
  }

  return resultado;
}

module.exports = {
  enriquecerPromocoes,
};