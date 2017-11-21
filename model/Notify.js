const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');
const moment = require('moment');
const TeleBot = require('telebot');
var Promise = require("bluebird");

class Notify{

    constructor(){
        //init pokemon
        this.pokemon = new Pokemon();

        //init telegram
        this.telegram = new TeleBot({
            token: config.API
        });

        this.raids = [];

        let storage = new Storage();
        let self = this;
        storage.readRaids(function(data){
            try{ self.raids = data; }catch(err){ }
        });
    }
    sendMessages(bot, chatId, messages) {
        //console.log('sendMessage: '+chatId+' -> ' + messages);
        return Promise.mapSeries(messages, function (message) {
            if (message[0] == 'message') {
                return bot.sendMessage(chatId, message[1], {'parse': 'Markdown'});
            } else if (message[0] == 'location') {
                return bot.sendLocation(chatId, [message[1], message[2]]);
            }
        });
    }

    addPokemonToQueue(data, user, queue, callback){
        var mid = '';
        var anzPkmn = data.length;
        //console.log("Anzahl Pkmn = " + anzPkmn);
        if(anzPkmn > 0 && user['config']['pkmn']){

            for(var i = 0; i< anzPkmn; i++){
                let pkmn = data[i];
                if(pkmn['eid'] > mid){
                    mid = pkmn['eid'];
                }
                if(user.getPokemonIndex(pkmn.pokemon_id) !== false){

                    let disappear = moment(pkmn['disappear_time']),
                        disappearFormated = moment.unix(disappear).format("HH:mm:ss"),
                        now = moment().unix(),
                        difference = disappear.diff(now),
                        timeleft = moment.unix(difference).format("mm[m] ss[s]");

                    let text = '*' + this.pokemon.getName(pkmn.pokemon_id) + '*\n';
                    text += 'Verfügbar bis '+ disappearFormated +' ( ' + timeleft + ' )';
                    text += '\n\nIdent: ' + pkmn['eid'];

                    queue.push(['message', text]);
                    queue.push(['location', pkmn.latitude, pkmn.longitude]);

                }
            }
            user['config']['mid'] = mid;
            var status = (queue.length > 0 ? queue : false);
            callback(status);
        }
    }

    /*
    doSave(){
        let storage = new Storage();
        storage.saveRaids(this.raids, function(status){
            console.log("Saved");
        });
    }
    */
}


module.exports = Notify;