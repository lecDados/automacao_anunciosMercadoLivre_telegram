const { afiliado } = require('../config/env');

/**
 * Adiciona os parâmetros de afiliado (matt_word, matt_tool) a um link do Mercado Livre.
 * Se as credenciais de afiliado não estiverem configuradas no .env, retorna o link original.
 * @param {string} link - URL original do produto
 * @returns {string} URL com o link de afiliado, ou a URL original se não configurado
 */
function paraLinkDeAfiliado(link) {
  if (!link || !afiliado.mattWord || !afiliado.mattTool) {
    return link;
  }

  const separador = link.includes('?') ? '&' : '?';
  return `${link}${separador}matt_word=${afiliado.mattWord}&matt_tool=${afiliado.mattTool}`;
}

module.exports = {
  paraLinkDeAfiliado,
};