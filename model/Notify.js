const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const moment = require('moment');
const TeleBot = require('telebot');
var Promise = require("bluebird");
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');

class Notify{

    constructor(){
        //init pokemon
        this.pokemon = new Pokemon();

        this.storage = new Storage();

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

        if(anzPkmn > 0){
            for(var i = 0; i< anzPkmn; i++){
                let pkmn = data[i];
                if(pkmn.eid > user.config.mid){
                    mid = pkmn.eid;

                    var earth_radius = 6371;
                    var radius = user.config.radius;
                    var maxLat = user.config.lat + rad2deg(radius / earth_radius);
                    var minLat = user.config.lat - rad2deg(radius / earth_radius);
                    var maxLon = user.config.lon + rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));
                    var minLon = user.config.lon - rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));


                    if(pkmn.latitude < maxLat && pkmn.latitude > minLat && pkmn.longitude < maxLon && pkmn.longitude > minLon){
                        if(user.getPokemonIndex(pkmn.pokemon_id) !== false){

                            let disappear = moment(pkmn['disappear_time']),
                                disappearFormated = moment.unix(disappear).format("HH:mm:ss"),
                                now = moment().unix(),
                                difference = disappear.diff(now),
                                timeleft = moment.unix(difference).format("mm[m] ss[s]");

                            let text = '*' + this.pokemon.getName(pkmn.pokemon_id) + '*\n';
                            text += 'Verfügbar bis '+ disappearFormated +' ( ' + timeleft + ' )';

                            queue.push(['message', text]);
                            queue.push(['location', pkmn.latitude, pkmn.longitude]);

                        }
                    }

                }
            }
            if(mid) user.config.mid = mid + 1;
            var status = (queue.length > 0 ? queue : false);
            callback(status);
        }
    }

    prepareRaid(user, raids, callback){
        let queue = [],
            now = moment().unix();

        for(var i = 0; i < raids.length; i++){
            let gym = raids[i],
                rb = moment.unix(gym['rb']).format("HH:mm:ss"),
                re = moment.unix(gym['re']).format("HH:mm:ss"),
                text =  "",
                send = false;

            if(gym.status < 2){

                if(now >= gym.rs && now < gym.rb && gym.status == 0){
                    text =  '*' + gym.name + '*\n';
                    text += 'Level ' + gym.lvl;
                    text += '\nRaid startet um ' + rb;
                    text += '\nund endet um ' + re;
                    gym.status = 1;
                    send = true;

                }
                else if (now >= gym.rb && now < gym.re){
                    text =  '*' + gym.name + ' (Läuft)*\n';
                    text += 'Level ' + gym.lvl;
                    text += '\nRaid endet um ' + re;
                    gym.status = 2;
                    send = true;
                }

                if(gym.rpid){
                    text += '\n' + this.pokemon.getName(gym.rpid) + ' CP: ' + gym.rcp
                }
                if(send) queue.push(['message', text]);
            }
            if(gym.re < now) raids.splice(i,1);

        }
        this.doSave(user, raids);
        var status = (queue.length > 0 ? queue : false);
        callback(status);
    }

    addRaidToQueue(data, user, callback){
        let gid = '',
            anzGym = data.length,
            raids = [],
            now = moment().unix();

        this.storage.readRaids(user.uid, function(data){
            try{ raids = data; }catch(err){ }
        });

        if(anzGym > 0){

            for(var i = 0; i< anzGym; i++){
                let gym = data[i];

                var earth_radius = 6371;
                var radius = user.config.radius;
                var maxLat = user.config.lat + rad2deg(radius / earth_radius);
                var minLat = user.config.lat - rad2deg(radius / earth_radius);
                var maxLon = user.config.lon + rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));
                var minLon = user.config.lon - rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));


                if(gym.latitude < maxLat && gym.latitude > minLat && gym.longitude < maxLon && gym.longitude > minLon) {

                    if (gym.lvl &&
                        gym.lvl >= user.config.raid_lvl &&
                        now <= gym.re) {

                        let index = raids.map(function (e) {
                            return e.gym_id;
                        }).indexOf(gym.gym_id);

                        if(index >= 0 && raids[index]['re'] < now){
                            raids.splice(index,1);
                            index = -1;
                        }
                        if (index == -1) {
                            let raid = {
                                gym_id: gym.gym_id,
                                name: gym.name,
                                ts: gym.ts,
                                rb: gym.rb,
                                rs: gym.rs,
                                re: gym.re,
                                lvl: gym.lvl,
                                rpid: gym.rpid,
                                rcp: gym.rcp,
                                status: 0
                            };
                            raids.push(raid);
                        } else {
                            if (gym.rpid) raids[index].rpid = gym.rpid;
                            if (gym.rcp) raids[index].rcp = gym.rcp;
                        }
                    }
                }








            }
            callback(raids);
        }
    }


    doSave(user, data){
        let storage = new Storage();
        storage.saveRaids(user, data, function(status){

        });
    }

}


module.exports = Notify;