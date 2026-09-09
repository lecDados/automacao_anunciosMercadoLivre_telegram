const express = require('express');
const promocaoRoutes = require('./routes/promocaoRoutes');

const app = express();

app.use(express.json());

// Rota de health check (útil pra testar se a VM está respondendo)
app.get('/', (req, res) => {
  res.json({ status: 'ok', mensagem: 'Servidor de promoções do Mercado Livre no ar 🚀' });
});

app.use('/', promocaoRoutes);

// Middleware de tratamento de erro (deve ficar sempre por último)
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({ erro: 'Erro interno no servidor' });
});

module.exports = app;