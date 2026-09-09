/**
 * Formata uma promoção como uma mensagem pronta pra enviar
 * (WhatsApp, Telegram, Discord, etc — ou só exibir no terminal).
 * @param {object} promo - objeto de promoção já enriquecido
 */
function formatarMensagemPromocao(promo) {
  const linhas = [
    `🔥 ${promo.titulo || 'Produto sem título disponível'}`,
    `💰 R$ ${promo.precoAtual} (de R$ ${promo.precoOriginal}) — ${promo.percentualDesconto}% OFF`,
    promo.frete_gratis ? '🚚 Frete grátis' : null,
    promo.link ? `🔗 ${promo.link}` : null,
  ].filter(Boolean);

  return linhas.join('\n');
}

/**
 * Pausa a execução por X milissegundos (usado pra simular envio
 * espaçado de mensagens, uma por vez).
 */
function aguardar(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

/**
 * Exibe as promoções no terminal como mensagens separadas,
 * em grupos de até `porGrupo` por vez, com uma pequena pausa entre grupos.
 * @param {Array} promocoes
 * @param {number} porGrupo - quantas mensagens exibir antes de pausar (padrão 3)
 * @param {number} pausaMs - pausa entre grupos, em ms (padrão 1000)
 */
async function exibirComoMensagens(promocoes, porGrupo = 3, pausaMs = 1000) {
  for (let i = 0; i < promocoes.length; i += porGrupo) {
    const grupo = promocoes.slice(i, i + porGrupo);

    grupo.forEach((promo) => {
      console.log('\n──────────────────────────');
      console.log(formatarMensagemPromocao(promo));
    });
    console.log('──────────────────────────\n');

    // Pausa entre grupos, exceto depois do último
    if (i + porGrupo < promocoes.length) {
      await aguardar(pausaMs);
    }
  }
}

module.exports = {
  formatarMensagemPromocao,
  exibirComoMensagens,
};