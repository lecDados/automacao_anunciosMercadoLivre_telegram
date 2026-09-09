const axios = require('axios');
const fs = require('fs');
const path = require('path');
const { mercadoLivre } = require('../config/env');

const BASE_URL = 'https://api.mercadolibre.com';
const TOKEN_PATH = path.join(__dirname, '../../token.json');

function lerAccessToken() {
  try {
    const data = fs.readFileSync(TOKEN_PATH, 'utf-8');
    return JSON.parse(data).access_token;
  } catch {
    return null;
  }
}

async function buscarAnuncios(termo, limite = 50) {
  try {
    const url = `${BASE_URL}/sites/${mercadoLivre.siteId}/search`;
    const accessToken = lerAccessToken();
    const response = await axios.get(url, {
      params: { q: termo, limit: limite },
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data.results || [];
  } catch (error) {
    console.error('Erro ao buscar anuncios:', error.message);
    throw new Error('Falha ao consultar a API do Mercado Livre');
  }
}

async function buscarDetalhesItem(itemId) {
  try {
    const url = `${BASE_URL}/items/${itemId}`;
    const response = await axios.get(url);
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const detalhe = error.response?.data?.message || error.message;
    console.error(`Erro ao buscar detalhes do item ${itemId}: [${status}] ${detalhe}`);
    throw new Error('Falha ao consultar detalhes do item');
  }
}

async function buscarMaisVendidosCategoria(categoryId) {
  try {
    const url = `${BASE_URL}/highlights/${mercadoLivre.siteId}/category/${categoryId}`;
    const accessToken = lerAccessToken();
    const response = await axios.get(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data.content || [];
  } catch (error) {
    console.error(`Erro ao buscar mais vendidos da categoria ${categoryId}:`, error.message);
    throw new Error('Falha ao consultar mais vendidos no Mercado Livre');
  }
}

async function buscarItensDoProduto(productId) {
  try {
    const accessToken = lerAccessToken();
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

async function buscarProdutoCatalogo(productId) {
  try {
    const url = `${BASE_URL}/products/${productId}`;
    const accessToken = lerAccessToken();
    const response = await axios.get(url, {
      headers: accessToken ? { Authorization: `Bearer ${accessToken}` } : {},
    });
    return response.data;
  } catch (error) {
    const status = error.response?.status;
    const detalhe = error.response?.data?.message || error.message;
    console.error(`Erro ao buscar produto de catalogo ${productId}: [${status}] ${detalhe}`);
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
