require('dotenv').config();

module.exports = {
  port: process.env.PORT || 3000,
  mercadoLivre: {
    clientId: process.env.ML_CLIENT_ID || '',
    clientSecret: process.env.ML_CLIENT_SECRET || '',
    redirectUri: process.env.ML_REDIRECT_URI || 'https://www.google.com',
    siteId: process.env.ML_SITE_ID || 'MLB', // MLB = Brasil
  },
  telegram: {
    token: process.env.TELEGRAM_BOT_TOKEN || '',
  },
  afiliado: {
    mattWord: process.env.ML_AFFILIATE_MATT_WORD || '',
    mattTool: process.env.ML_AFFILIATE_MATT_TOOL || '',
  },
};