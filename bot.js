var config = require('./config');
var TeleBot = require('telebot');
var bot = new TeleBot({
    token: config.API,
    webhook: {
        url: 'https://....',
        host: '0.0.0.0',
        port: 443
    }
});

return bot.sendMessage(config.adminID, 'Test nachricht vom neuen node Bot');
bot.connect();