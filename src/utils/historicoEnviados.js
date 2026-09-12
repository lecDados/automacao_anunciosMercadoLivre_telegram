const fs = require('fs');
const path = require('path');

const HISTORICO_PATH = path.join(__dirname, '../../historico_enviados.json');
const JANELA_MS = 24 * 60 * 60 * 1000; // 24 horas

function lerHistorico() {
  try {
    return JSON.parse(fs.readFileSync(HISTORICO_PATH, 'utf-8'));
  } catch {
    return {};
  }
}

function salvarHistorico(historico) {
  fs.writeFileSync(HISTORICO_PATH, JSON.stringify(historico, null, 2));
}

function foiEnviadoRecentemente(produtoId, historico) {
  const timestamp = historico[produtoId];
  if (!timestamp) return false;
  return Date.now() - timestamp < JANELA_MS;
}

/**
 * Remove da lista qualquer produto que já foi enviado nas últimas 24h.
 * @param {Array} lista - promoções já enriquecidas (precisam ter catalogProductId ou id)
 */
function filtrarNaoEnviadosRecentemente(lista) {
  const historico = lerHistorico();
  return lista.filter((item) => {
    const chave = item.catalogProductId || item.id;
    return !foiEnviadoRecentemente(chave, historico);
  });
}

/**
 * Marca os produtos como enviados agora, e aproveita pra limpar
 * entradas com mais de 24h (pra o arquivo não crescer pra sempre).
 * @param {Array<string>} produtoIds
 */
function registrarEnvios(produtoIds) {
  const historico = lerHistorico();
  const agora = Date.now();

  produtoIds.forEach((id) => {
    if (id) historico[id] = agora;
  });

  Object.keys(historico).forEach((id) => {
    if (agora - historico[id] > JANELA_MS) {
      delete historico[id];
    }
  });

  salvarHistorico(historico);
}

module.exports = {
  filtrarNaoEnviadosRecentemente,
  registrarEnvios,
};