function calcularDesconto(item) {
  const precoAtual = item.price;
  const precoOriginal = item.original_price;

  if (!precoOriginal || precoOriginal <= precoAtual) {
    return null;
  }

  const percentualDesconto = ((precoOriginal - precoAtual) / precoOriginal) * 100;

  return {
    id: item.id || item.item_id,
    catalogProductId: item._catalogProductId || null,
    titulo: item.title || null,
    precoAtual,
    precoOriginal,
    percentualDesconto: Number(percentualDesconto.toFixed(2)),
    link: item.permalink || null,
    thumbnail: item.thumbnail || null,
    condicao: item.condition,
    frete_gratis: item.shipping?.free_shipping || false,
  };
}

function filtrarPromocoes(itens) {
  return itens
    .map(calcularDesconto)
    .filter((item) => item !== null)
    .sort((a, b) => b.percentualDesconto - a.percentualDesconto);
}

module.exports = {
  calcularDesconto,
  filtrarPromocoes,
};
