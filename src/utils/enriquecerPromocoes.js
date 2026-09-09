const { buscarProdutoCatalogo } = require('../services/mercadoLivre');

function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

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
      link: `https://www.mercadolivre.com.br/p/${promo.catalogProductId}`,
      thumbnail: produto?.pictures?.[0]?.url || promo.thumbnail,
    });

    await aguardar(pausaMs);
  }

  return resultado;
}

module.exports = {
  enriquecerPromocoes,
};
