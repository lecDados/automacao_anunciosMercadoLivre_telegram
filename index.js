const app = require('./src/app');
const { port } = require('./src/config/env');
const { iniciarMonitoramento } = require('./src/jobs/monitorPromocoes');
const { iniciarBot } = require('./src/services/telegramBot');

app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);

  iniciarBot(); // ativa o bot do Telegram (/start, /stop)

  // Comente a linha abaixo se não quiser o monitoramento automático
  iniciarMonitoramento();
});