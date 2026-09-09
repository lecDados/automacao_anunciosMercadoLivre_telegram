const cron = require('node-cron');
const { buscarMaisVendidosCategoria, buscarItensDoProduto } = require('../services/mercadoLivre');
const { filtrarPromocoes } = require('../utils/calcularDesconto');
const { enriquecerPromocoes } = require('../utils/enriquecerPromocoes');
const { exibirComoMensagens } = require('../utils/formatarMensagem');
const { enviarPromocoesTelegram } = require('../services/telegramBot');

// Categorias que você quer monitorar (MLB1144 = Consoles e Video Games)
const CATEGORIAS_MONITORADAS = ['MLB1144'];

/**
 * Roda a checagem de promoções para todas as categorias monitoradas.
 */
async function verificarPromocoes() {
  console.log(`[${new Date().toLocaleString()}] Verificando promoções...`);

  for (const categoria of CATEGORIAS_MONITORADAS) {
    try {
      const destaques = await buscarMaisVendidosCategoria(categoria);

      const todosOsItens = [];
      for (const destaque of destaques) {
        const itens = await buscarItensDoProduto(destaque.id);
        // Anexa o productId de catálogo a cada item, pra usarmos depois no enriquecimento
        itens.forEach((item) => {
          item._catalogProductId = destaque.id;
        });
        todosOsItens.push(...itens);
      }

      const promocoesBrutas = filtrarPromocoes(todosOsItens);
      const LIMITE_PROMOCOES = 3;
      const top = promocoesBrutas.slice(0, LIMITE_PROMOCOES);
      const promocoes = await enriquecerPromocoes(top);

      if (promocoes.length > 0) {
        console.log(`✅ ${promocoesBrutas.length} promoção(ões) encontrada(s) — exibindo as ${promocoes.length} melhores:`);
        await exibirComoMensagens(promocoes, 3, 1000);

        await enviarPromocoesTelegram(promocoes);
      } else {
        console.log(`Nenhuma promoção encontrada na categoria "${categoria}" no momento.`);
      }
    } catch (error) {
      console.error(`Erro ao verificar promoções da categoria "${categoria}":`, error.message);
    }
  }
}

/**
 * Inicia o agendamento. Por padrão roda a cada 30 minutos.
 * Ajuste a expressão cron conforme sua necessidade.
 */
function iniciarMonitoramento() {
  // */30 * * * * = a cada 30 minutos
  cron.schedule('*/30 * * * *', verificarPromocoes);
  console.log('Monitoramento de promoções agendado (a cada 30 min).');
}

module.exports = {
  iniciarMonitoramento,
  verificarPromocoes,
};