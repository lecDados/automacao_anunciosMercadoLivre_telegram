const { buscarMaisVendidosCategoria, buscarItensDoProduto } = require('../services/mercadoLivre');
const { filtrarPromocoes } = require('../utils/calcularDesconto');
const { enriquecerPromocoes } = require('../utils/enriquecerPromocoes');
const { ehRelevante } = require('../utils/filtrarRelevantes');

/**
 * GET /promocoes-categoria?categoria=MLB1144
 *
 * Estratégia alternativa: como a busca livre por palavra-chave está bloqueada
 * pelo Mercado Livre (erro 403 mesmo autenticado), usamos o endpoint de
 * "mais vendidos por categoria", que ainda funciona normalmente.
 */
async function listarPromocoesPorCategoria(req, res) {
  const { categoria } = req.query;

  if (!categoria) {
    return res.status(400).json({
      erro: 'Informe o parâmetro "categoria". Ex: /promocoes-categoria?categoria=MLB1144',
    });
  }

  try {
    const destaques = await buscarMaisVendidosCategoria(categoria);

    // Para cada produto em destaque, busca os itens/anúncios vinculados
    // (é lá que ficam os preços reais, com original_price)
    const todosOsItens = [];
    for (const destaque of destaques) {
      const itens = await buscarItensDoProduto(destaque.id);
      itens.forEach((item) => {
        item._catalogProductId = destaque.id;
      });
      todosOsItens.push(...itens);
    }

    const promocoesBrutas = filtrarPromocoes(todosOsItens);
    const candidatos = promocoesBrutas.slice(0, 30);
    const enriquecidos = await enriquecerPromocoes(candidatos);
    const relevantes = enriquecidos.filter((p) => ehRelevante(p.titulo));
    const vistos = new Set();
    const semDuplicados = relevantes.filter((p) => {
      const chave = p.catalogProductId || p.id;
      if (vistos.has(chave)) return false;
      vistos.add(chave);
      return true;
    });
    const promocoes = semDuplicados.slice(0, 5);

    return res.json({
      categoria,
      totalDestaques: destaques.length,
      totalItensAnalisados: todosOsItens.length,
      totalPromocoesEncontradas: promocoesBrutas.length,
      totalRelevantes: relevantes.length,
      totalExibido: promocoes.length,
      promocoes,
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  listarPromocoesPorCategoria,
};