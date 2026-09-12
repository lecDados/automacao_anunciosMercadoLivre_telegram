const cron = require('node-cron');
const { buscarMaisVendidosCategoria, buscarItensDoProduto } = require('../services/mercadoLivre');
const { filtrarPromocoes } = require('../utils/calcularDesconto');
const { enriquecerPromocoes } = require('../utils/enriquecerPromocoes');
const { exibirComoMensagens } = require('../utils/formatarMensagem');
const { enviarPromocoesTelegram } = require('../services/telegramBot');
const { ehRelevante } = require('../utils/filtrarRelevantes');
const { filtrarNaoEnviadosRecentemente, registrarEnvios } = require('../utils/historicoEnviados');

// Categorias relacionadas a gaming e informática/perifericos
const CATEGORIAS_MONITORADAS = [
  'MLB11172',  // Consoles
  'MLB186456', // Video Games (jogos)
  'MLB438578', // Acessórios para Consoles
  'MLB439527', // Acessórios para PC Gaming (Games)
  'MLB447778', // Acessórios para PC Gaming (Informática)
  'MLB454379', // Periféricos para PC (mouses, teclados)
  'MLB14370',  // Monitores e Acessórios
];

function removerDuplicados(lista) {
  const vistos = new Set();
  return lista.filter((item) => {
    const chave = item.catalogProductId || item.id;
    if (vistos.has(chave)) return false;
    vistos.add(chave);
    return true;
  });
}
const CANDIDATOS_PARA_ANALISAR = 30; // quantos itens enriquecer antes de filtrar por palavra-chave
const LIMITE_PROMOCOES = 5; // quantas mensagens enviar por ciclo

/**
 * Roda a checagem de promoções em todas as categorias monitoradas,
 * combina os resultados, filtra por relevância (palavra-chave) e
 * envia as melhores promoções encontradas.
 */
async function verificarPromocoes() {
  console.log(`[${new Date().toLocaleString()}] Verificando promoções...`);

  try {
    const todosOsItens = [];

    for (const categoria of CATEGORIAS_MONITORADAS) {
      const destaques = await buscarMaisVendidosCategoria(categoria);

      for (const destaque of destaques) {
        const itens = await buscarItensDoProduto(destaque.id);
        itens.forEach((item) => {
          item._catalogProductId = destaque.id;
        });
        todosOsItens.push(...itens);
      }
    }

    const promocoesBrutas = filtrarPromocoes(todosOsItens);
    const candidatos = promocoesBrutas.slice(0, CANDIDATOS_PARA_ANALISAR);
    const enriquecidos = await enriquecerPromocoes(candidatos);

    const relevantes = enriquecidos.filter((p) => ehRelevante(p.titulo));
    const semDuplicados = removerDuplicados(relevantes);
    const naoRepetidos = filtrarNaoEnviadosRecentemente(semDuplicados);
    const promocoes = naoRepetidos.slice(0, LIMITE_PROMOCOES);

    if (promocoes.length > 0) {
      console.log(
        `✅ ${promocoesBrutas.length} promoção(ões) no total — ${relevantes.length} relevante(s) — ${naoRepetidos.length} inédita(s) nas últimas 24h — exibindo as ${promocoes.length} melhores:`
      );
      await exibirComoMensagens(promocoes, 3, 1000);

      await enviarPromocoesTelegram(promocoes);
      registrarEnvios(promocoes.map((p) => p.catalogProductId || p.id));
    } else {
      console.log('Nenhuma promoção nova (não repetida) encontrada neste ciclo.');
    }
  } catch (error) {
    console.error('Erro ao verificar promoções:', error.message);
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