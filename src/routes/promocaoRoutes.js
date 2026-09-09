const express = require('express');
const { listarPromocoes } = require('../controllers/promocaoController');
const { listarPromocoesPorCategoria } = require('../controllers/promocaoPorCategoriaController');

const router = express.Router();

router.get('/promocoes', listarPromocoes);
router.get('/promocoes-categoria', listarPromocoesPorCategoria);

module.exports = router;