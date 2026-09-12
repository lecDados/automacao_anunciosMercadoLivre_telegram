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

function iniciarEnvios(chatId) {
  const chats = lerChats();

  if (!chats.includes(chatId)) {
    chats.push(chatId);
    salvarChats(chats);
    console.log(`✅ Novo chat inscrito: ${chatId}`);
  }

  bot.sendMessage(
    chatId,
    'Seja bem-vindo! 👋\n\nA partir de agora você vai receber, periodicamente, uma seleção das melhores ofertas em games, consoles e periféricos — sempre com desconto de verdade, sem enrolação.\n\nSe quiser pausar os envios a qualquer momento, use o botão ao final de cada envio, ou envie /stop.\n\nBoas compras! 🎮'
  );
}

function pararEnvios(chatId) {
  const chats = lerChats().filter((id) => id !== chatId);
  salvarChats(chats);

  bot.sendMessage(chatId, 'Tudo certo, suas notificações foram pausadas.', {
    reply_markup: {
      inline_keyboard: [[{ text: '▶️ Iniciar anúncios', callback_data: 'iniciar_anuncios' }]],
    },
  });
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
    iniciarEnvios(msg.chat.id);
  });

  bot.onText(/\/stop/, (msg) => {
    const chatId = msg.chat.id;
    pararEnvios(chatId);
  });

  // Botão "Parar anúncios" clicado
  bot.on('callback_query', async (query) => {
    const chatId = query.message.chat.id;

    if (query.data === 'parar_anuncios') {
      pararEnvios(chatId);
    } else if (query.data === 'iniciar_anuncios') {
      iniciarEnvios(chatId);
    }

    // Remove o "relógio de carregando" do botão no app do usuário
    bot.answerCallbackQuery(query.id);
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

    // Mensagem de rodapé com o botão de parar, depois do lote completo
    try {
      await bot.sendMessage(
        chatId,
        'Se não quiser mais receber esses anúncios, toque no botão abaixo. Caso contrário, pode ignorar essa mensagem. 🙂',
        {
          reply_markup: {
            inline_keyboard: [[{ text: '🛑 Parar anúncios', callback_data: 'parar_anuncios' }]],
          },
        }
      );
    } catch (error) {
      console.error(`Erro ao enviar rodapé para o chat ${chatId}:`, error.message);
    }
  }
}

module.exports = {
  iniciarBot,
  enviarPromocoesTelegram,
};