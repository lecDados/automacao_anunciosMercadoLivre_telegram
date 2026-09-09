const { buscarAnuncios } = require('../services/mercadoLivre');
const { filtrarPromocoes } = require('../utils/calcularDesconto');

/**
 * GET /promocoes?produto=ps5
 */
async function listarPromocoes(req, res) {
  const { produto } = req.query;

  if (!produto) {
    return res.status(400).json({
      erro: 'Informe o parâmetro "produto" na query string. Ex: /promocoes?produto=ps5',
    });
  }

  try {
    const itensBrutos = await buscarAnuncios(produto);
    const promocoes = filtrarPromocoes(itensBrutos);

    return res.json({
      produto,
      totalEncontrado: itensBrutos.length,
      totalComPromocao: promocoes.length,
      promocoes,
    });
  } catch (error) {
    return res.status(500).json({ erro: error.message });
  }
}

module.exports = {
  listarPromocoes,
};