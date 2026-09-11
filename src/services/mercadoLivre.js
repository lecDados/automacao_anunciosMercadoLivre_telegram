const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mercadoLivre } = require('../config/env');

const BASE_URL = 'https://api.mercadolibre.com';
const TOKEN_PATH = path.join(__dirname, '../../token.json');

/**
 * Lê o token salvo localmente (access_token, refresh_token, expiração, etc).
 * Retorna null se ainda não foi gerado.
 */
function lerToken() {
  try {
    const data = fs.readFileSync(TOKEN_PATH, 'utf-8');
    return JSON.parse(data);
  } catch {
    return null;
  }
}

function salvarToken(tokenData) {
  const comTimestamp = { ...tokenData, obtido_em: Date.now() };
  fs.writeFileSync(TOKEN_PATH, JSON.stringify(comTimestamp, null, 2));
  return comTimestamp;
}

/**
 * Renova o access_token usando o refresh_token salvo.
 * O Mercado Livre retorna um refresh_token NOVO a cada renovação — salvamos ele também.
 */
async function renovarToken() {
  const tokenAtual = lerToken();

  if (!tokenAtual?.refresh_token) {
    console.error('❌ Não há refresh_token salvo. Será necessário reautorizar manualmente (scripts/auth).');
    return null;
  }

  try {
    const response = await axios.post('https://api.mercadolibre.com/oauth/token', null, {
      params: {
        grant_type: 'refresh_token',
        client_id: mercadoLivre.clientId,
        client_secret: mercadoLivre.clientSecret,
        refresh_token: tokenAtual.refresh_token,
      },
    });

    const novoToken = salvarToken(response.data);
    console.log('🔄 Token renovado automaticamente com sucesso.');
    return novoToken.access_token;
  } catch (error) {
    console.error('❌ Erro ao renovar token:', error.response?.data || error.message);
    return null;
  }
}

/**
 * Retorna um access_token válido, renovando automaticamente se estiver
 * perto de expirar (menos de 10 minutos restantes).
 */
async function obterAccessTokenValido() {
  const token = lerToken();

  if (!token) return null;

  const expiraEm = token.obtido_em + token.expires_in * 1000;
  const faltamMs = expiraEm - Date.now();
  const DEZ_MINUTOS_MS = 10 * 60 * 1000;

  if (faltamMs < DEZ_MINUTOS_MS) {
    return await renovarToken();
  }

  return token.access_token;
}

/**
 * Busca anúncios no Mercado Livre a partir de um termo de pesquisa.
 * @param {string} termo - ex: "ps5"
 * @param {number} limite - quantidade de itens a retornar (máx 50 por página)
 * @returns {Promise<Array>} lista de itens brutos retornados pela API
 */
async function buscarAnuncios(termo, limite = 50) {
  try {
    const url = `${BASE_URL}/sites/${mercadoLivre.siteId}/search`;

    const accessToken = await obterAccessTokenValido();

    const response = await axios.get(url, {
      params: {
        q: termo,
        limit: limite,
      },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    return response.data.results || [];
  } catch (error) {
    console.error('Erro ao buscar anúncios no Mercado Livre:', error.message);
    if (error.response) {
      console.error('Status:', error.response.status);
      console.error('Resposta da API:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Falha ao consultar a API do Mercado Livre');
  }
}

/**
 * Busca detalhes completos de um item específico pelo ID.
 * Útil quando a busca simples não traz todos os campos necessários.
 * @param {string} itemId - ex: "MLB123456789"
 */
async function buscarDetalhesItem(itemId) {
  try {
    const url = `${BASE_URL}/items/${itemId}`;
    // Esse endpoint costuma ser público — testando sem enviar o token
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const detalhe = error.response?.data?.message || error.message;
    console.error(`Erro ao buscar detalhes do item ${itemId}: [${status}] ${detalhe}`);
    throw new Error('Falha ao consultar detalhes do item');
  }
}

/**
 * Busca os produtos mais vendidos de uma categoria específica.
 * Alternativa ao endpoint de busca livre (/sites/MLB/search), que está bloqueado.
 * @param {string} categoryId - ex: "MLB1144" (Consoles e Video Games)
 * @returns {Promise<Array>} lista de produtos em destaque
 */
async function buscarMaisVendidosCategoria(categoryId) {
  try {
    const url = `${BASE_URL}/highlights/${mercadoLivre.siteId}/category/${categoryId}`;
    const accessToken = await obterAccessTokenValido();

    const response = await axios.get(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    return response.data.content || [];
  } catch (error) {
    console.error(`Erro ao buscar mais vendidos da categoria ${categoryId}:`, error.message);
    if (error.response) {
      console.error('Resposta da API:', JSON.stringify(error.response.data, null, 2));
    }
    throw new Error('Falha ao consultar mais vendidos no Mercado Livre');
  }
}

/**
 * Dado um product_id de catálogo (formato MLBU...), busca os itens/anúncios
 * vinculados a esse produto, que é onde ficam os preços reais.
 * @param {string} productId - ex: "MLBU3013800008"
 */
async function buscarItensDoProduto(productId) {
  try {
    const accessToken = await obterAccessTokenValido();
    const url = `${BASE_URL}/products/${productId}/items`;

    const response = await axios.get(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });

    const data = response.data;
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    if (Array.isArray(data?.items)) return data.items;

    return [];
  } catch (error) {
    console.error(`Erro ao buscar itens do produto ${productId}:`, error.message);
    return [];
  }
}

/**
 * Busca os dados do produto de catálogo (nome, atributos, etc) — diferente
 * de /products/{id}/items, que traz só os anúncios/preços vinculados.
 * @param {string} productId - ex: "MLB50292194"
 */
async function buscarProdutoCatalogo(productId) {
  try {
    const url = `${BASE_URL}/products/${productId}`;
    const accessToken = await obterAccessTokenValido();
    const response = await axios.get(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const detalhe = error.response?.data?.message || error.message;
    console.error(`Erro ao buscar produto de catálogo ${productId}: [${status}] ${detalhe}`);
    return null;
  }
}

module.exports = {
  buscarAnuncios,
  buscarDetalhesItem,
  buscarMaisVendidosCategoria,
  buscarItensDoProduto,
  buscarProdutoCatalogo,
};