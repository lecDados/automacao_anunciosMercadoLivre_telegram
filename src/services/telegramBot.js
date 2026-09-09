const TelegramBot = require('node-telegram-bot-api');
const fs = require('fs');
const path = require('path');
const { telegram } = require('../config/env');
const { formatarMensagemPromocao } = require('../utils/formatarMensagem');

const CHATS_PATH = path.join(__dirname, '../../chats.json');

let bot = null;

/**
 * Lê a lista de chats inscritos (que já mandaram /start).
 */
function lerChats() {
  try {
    return JSON.parse(fs.readFileSync(CHATS_PATH, 'utf-8'));
  } catch {
    return [];
  }
}

function salvarChats(chats) {
  fs.writeFileSync(CHATS_PATH, JSON.stringify(chats, null, 2));
}

/**
 * Inicia o bot do Telegram e configura os comandos /start e /stop.
 */
function iniciarBot() {
  if (!telegram.token) {
    console.warn('⚠️  TELEGRAM_BOT_TOKEN não configurado no .env — bot do Telegram desativado.');
    return null;
  }

  bot = new TelegramBot(telegram.token, { polling: true });

  bot.onText(/\/start/, (msg) => {
    const chatId = msg.chat.id;
    const chats = lerChats();

    if (!chats.includes(chatId)) {
      chats.push(chatId);
      salvarChats(chats);
      console.log(`✅ Novo chat inscrito: ${chatId}`);
    }

    bot.sendMessage(
      chatId,
      '🤖 Bot ativado!\n\nVocê vai receber até 3 promoções de games/consoles a cada 30 minutos.\n\nEnvie /stop a qualquer momento para parar de receber.'
    );
  });

  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    const chats = lerChats().filter((id) => id !== chatId);
    salvarChats(chats);

    bot.sendMessage(chatId, '🛑 Notificações desativadas. Envie /start para reativar quando quiser.');
  });

  bot.on('polling_error', (error) => {
    console.error('Erro no polling do Telegram:', error.message);
  });

  console.log('🤖 Bot do Telegram iniciado e escutando comandos (/start, /stop).');
  return bot;
}

/**
 * Envia a lista de promoções para todos os chats inscritos.
 * Uma mensagem por vez, com pequena pausa entre elas.
 * @param {Array} promocoes - lista já enriquecida (com título, link, etc)
 */
async function enviarPromocoesTelegram(promocoes) {
  if (!bot) {
    console.log('Bot do Telegram não está ativo — pulando envio.');
    return;
  }

  const chats = lerChats();

  if (chats.length === 0) {
    console.log('Nenhum chat inscrito ainda. Envie /start para o bot no Telegram.');
    return;
  }

  for (const chatId of chats) {
    for (const promo of promocoes) {
      try {
        const mensagem = formatarMensagemPromocao(promo);

        if (promo.thumbnail) {
          await bot.sendPhoto(chatId, promo.thumbnail, { caption: mensagem });
        } else {
          await bot.sendMessage(chatId, mensagem);
        }
      } catch (error) {
        console.error(`Erro ao enviar mensagem para o chat ${chatId}:`, error.message);

        // Se falhar ao enviar a foto (ex: URL inválida), tenta mandar só o texto
        try {
          await bot.sendMessage(chatId, formatarMensagemPromocao(promo));
        } catch (fallbackError) {
          console.error(`Erro no fallback de texto para o chat ${chatId}:`, fallbackError.message);
        }
      }
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }
}

module.exports = {
  iniciarBot,
  enviarPromocoesTelegram,
};