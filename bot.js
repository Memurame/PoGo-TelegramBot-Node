'use strict';

const Bot = require('./model/Bot');
const config = require('./config');
const TeleBot = require('telebot');


//init bot
let bot = new Bot();

//init telegram
let telegram = new TeleBot({
    token: config.API,
    polling: {
        interval: 1000,
        timeout: 0,
        limit: 100,
        retryTimeout: 5000
    },
    usePlugins: [
        'askUser'
    ]
});



/* ---- set telegram commands ------ */

telegram.on('*', function(msg){
    console.log(msg.from.id + ' -> ' + msg.text);
});

telegram.on('/start', function(msg){
    bot.doStart(telegram, msg.from);
});
telegram.on('/stop', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    if(user){
        bot.doStop(telegram, user);
    }
});

telegram.on('/add', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let pkmn = msg.text.substr(6).split(',').map(function(item) {
        return item.trim();
    });
    if(user) bot.doAdd(telegram, user, pkmn);
});

telegram.on('/remove', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let pkmn = msg.text.substr(8).split(',').map(function(item) {
        return item.trim();
    });
    if(user) bot.doRemove(telegram, user, pkmn);
});

telegram.on('/list', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    if(user) bot.doList(telegram, user);
});

telegram.on('/raid', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let [cmdName, status] = msg.text.split(' ');
    if(user) bot.doRaid(telegram, user, status);
});

telegram.on('/pokemon', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let [cmdName, status] = msg.text.split(' ');
    if(user) bot.doPokemon(telegram, user, status);
});

telegram.on('/radius', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let [cmdName, radius] = msg.text.split(' ');
    if(user) bot.doRadius(telegram, user, radius);
});

telegram.on('/reset', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    let [cmdName, reset] = msg.text.split(' ');
    if(user) bot.doReset(telegram, user, reset);
});

telegram.on('/menu', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    if(user) bot.doMenu(telegram, user);
});

telegram.on(['location'], function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    if(user) bot.doLocation(telegram, user, msg.location);
});

telegram.on('/backup', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        bot.doBackup(telegram, msg.from.id);
    }
});

telegram.on('/send', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        let text = msg.text.substr(6).trim();
        bot.doSendToAll(telegram, text);
    }
});

telegram.on('/status', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        bot.doShowStatus(telegram, msg.from.id);
    }
});

telegram.on('/admin', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        bot.doAdminMenu(telegram, msg.from.id);
    }
});

telegram.on('/sendto', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        let arr = msg.text.split(' '),
            result = arr.slice(0,2);
        result.push(arr.slice(2).join(' '));
        bot.doSendToUser(telegram, result[1], result[2]);
    }
});

telegram.on('/server', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        let [cmdName, status] = msg.text.split(' ');
        bot.doServerStatus(telegram, status, msg.from.id);
    }
});

telegram.on('/save', function(msg){
    if(bot.doAdminCheck(telegram, msg.from.id)){
        bot.doSave(telegram, msg.from.id);
    }
});

telegram.on('/profile', function(msg){
    let user = bot.doCheck(telegram, msg.from.id);
    if(user) bot.doShowConfig(telegram, user);
});

telegram.on('callbackQuery', function(msg){

    let user = bot.doCheck(telegram, msg.from.id);

    let [cmdName, val1, val2] = msg.data.split(' ');


    if(cmdName == '/remove'){
        var array = [val1];
        bot.doRemove(telegram, user, array);
    } else if(cmdName == '/getLocation'){
        telegram.sendLocation(msg.from.id, [val1, val2]);
    } else if(cmdName == '/raid'){
        bot.doRaid(telegram, user, val1);
    } else if(cmdName == '/radius'){
        bot.doRadius(telegram, user, val1);
    } else if(cmdName == '/pokemon'){
        bot.doPokemon(telegram, user, val1);
    } else if(cmdName == '/reset'){
        bot.doReset(telegram, user, val1);
    } else if(cmdName == '/start'){
        bot.doStart(telegram, msg.from);
    }



});

telegram.on('inlineQuery', function(msg){

   console.log('inlineQuery');
});



/* --------------------------------- */




setInterval(function(){

    if(bot.status) bot.doServerRequest(telegram);
    bot.doSave();


}, config.loop);

telegram.start();