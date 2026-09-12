const PALAVRAS_CHAVE = [
  'ps4', 'ps5', 'playstation', 'xbox', 'nintendo', 'switch',
  'gamer', 'gaming',
  'mouse', 'mause', 'teclado',
  'headset', 'fone de ouvido', 'fone gamer',
  'monitor',
  'caixa de som', 'speaker',
  'controle', 'joystick', 'dualsense', 'dualshock',
  'webcam', 'mousepad',
  'cadeira gamer',
  'placa de video', 'placa grafica', 'placa de vídeo', 'placa gráfica',
];

/**
 * Remove acentos de uma string, pra comparação mais tolerante.
 */
function normalizar(texto) {
  return texto
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '');
}

/**
 * Verifica se o título de um produto contém alguma das palavras-chave relevantes.
 * @param {string} titulo
 */
function ehRelevante(titulo) {
  if (!titulo) return false;
  const tituloNormalizado = normalizar(titulo);
  return PALAVRAS_CHAVE.some((palavra) => tituloNormalizado.includes(normalizar(palavra)));
}

module.exports = {
  ehRelevante,
  PALAVRAS_CHAVE,
};