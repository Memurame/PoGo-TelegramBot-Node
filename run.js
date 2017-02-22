'use strict';

var config = require('./config.js');
const TeleBot = require('telebot');
const bot = new TeleBot(config.API);

return bot.sendMessage(config.adminID, 'Test nachricht vom neuen node Bot');
bot.connect();