const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
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

    addPokemonToQueue(data, user, callback){
        let queue = [],
            mid = '',
            anzPkmn = data.length;
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

    addRaidToQueue(data, user, callback){
        let queue = [],
            gid = '',
            anzGym = data.length;

        if(anzGym > 0 && user['config']['raid']){

            for(var i = 0; i< anzGym; i++){
                let gym = data[i];
                if (gym['ts'] > gid) {
                    gid = gym['ts'];
                }

                let now = moment().unix(),
                    rb = moment.unix(gym['rb']).format("HH:mm:ss"),
                    re = moment.unix(gym['re']).format("HH:mm:ss"),
                    text =  "";

                if(gym['lvl'] &&
                    gym['lvl'] >= user['config']['raid_lvl'] &&
                    now <= gym['re']){

                    text =  '*' + gym['name'] + '*\n';
                    text += 'Level ' + gym['lvl'] + '\n';
                    if(now > gym['rs'] && now < gym['rb']){
                        text += 'Raid startet um ' + rb;
                    }
                    else if (now > gym['rb'] && now < gym['re']){
                        text += 'Raid bis ' + re;
                    }

                    if(gym['rpid']){
                        text += '\n' + this.pokemon.getName(gym['rpid']) + ' CP: ' + gym['rcp']
                    }

                    telegram.sendMessage(
                        user['uid'],
                        text,
                        {'parse': 'Markdown'}
                    );
                }

            }
            user['config']['gid'] = gid;
            var status = (queue.length > 0 ? queue : false);
            callback(status);
        }
    }


    doSave(){
        let storage = new Storage();
        storage.saveRaids(this.raids, function(status){
            console.log("Saved");
        });
    }

}


module.exports = Notify;