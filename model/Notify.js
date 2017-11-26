const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const moment = require('moment');
var Promise = require("bluebird");
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');
const User = require('./User');
var MongoClient = require('mongodb').MongoClient;
var url = "mongodb://localhost:27017/pogobot";

class Notify{

    constructor(){
        //init pokemon
        this.pokemon = new Pokemon();

        this.data = [];


        MongoClient.connect(url, function(err, db) {
            if (err) throw err;
            db.createCollection("pokemon", function(err, res) {
                if (err) throw err;
                db.close();
            });
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

        if(anzPkmn > 0){
            for(var i = 0; i< anzPkmn; i++){
                let pkmn = data[i];
                mid = pkmn.eid;

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
        if(mid) user.config.mid = mid + 1;
        var status = (queue.length > 0 ? queue : false);
        callback(status);
    }

    prepareRaid(user){
        let queue = [],
            now = moment().unix();

        for(var i = 0; i < user.raids.length; i++){
            let gym = user.raids[i],
                rb = moment.unix(gym['rb']).format("HH:mm:ss"),
                re = moment.unix(gym['re']).format("HH:mm:ss"),
                text =  "",
                send = false;

            if(gym.status < 2 && gym.lvl >= user.config.raid_lvl ){

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
            if(gym.re < now) user.raids.splice(i,1);

        }
        return (queue.length > 0 ? queue : false);
    }

    searchRaids(user, callback){
        let gid = '',
            anzGym = this.data.gyms.length,
            raids = [];


        if(anzGym > 0){

            for(var i = 0; i< anzGym; i++){
                let gym = this.data.gyms[i];

                var earth_radius = 6371;
                var radius = user.config.radius;
                var maxLat = user.config.lat + rad2deg(radius / earth_radius);
                var minLat = user.config.lat - rad2deg(radius / earth_radius);
                var maxLon = user.config.lon + rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));
                var minLon = user.config.lon - rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));


                if(gym.latitude < maxLat && gym.latitude > minLat && gym.longitude < maxLon && gym.longitude > minLon) {
                   raids.push(gym);
                }
            }
            callback(raids);
        }
    }

    addRaidToQueue(data, user, callback){
        let anzGym = data.length,
            now = moment().unix();

        if(!user.raids) user.raids = [];

        if(anzGym > 0){

            for(var i = 0; i< anzGym; i++){
                let gym = data[i];

                if (gym.lvl && now <= gym.re) {

                    let index = user.raids.map(function (e) {
                        return e.gym_id;
                    }).indexOf(gym.gym_id);

                    if(index >= 0 && user.raids[index]['re'] < now){
                        user.raids.splice(index,1);
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
                        user.raids.push(raid);
                    } else {
                        if (gym.rpid) user.raids[index].rpid = gym.rpid;
                        if (gym.rcp) user.raids[index].rcp = gym.rcp;
                    }
                }
            }

            let res =  this.prepareRaid(user);
            callback(res);
        }
    }

    doServerRequest(callback){


        var earth_radius = 6371;
        var radius = config.radius;
        var maxLat = config.lat + rad2deg(radius / earth_radius);
        var minLat = config.lat - rad2deg(radius / earth_radius);
        var maxLon = config.lon + rad2deg(radius / earth_radius / Math.cos(deg2rad(config.lat)));
        var minLon = config.lon - rad2deg(radius / earth_radius / Math.cos(deg2rad(config.lat)));

        var ajdata = {
            'mid': 0,
            'gid': 0,
            'w': minLon,
            'e': maxLon,
            'n': maxLat,
            's': minLat
        };

        var options = {
            url: config.URL,
            method: 'GET',
            qs: ajdata,
            timeout: 10000
        };
        //let data = [];
        request(options, function (error, response, body) {
            let data = JSON.parse(body);

            MongoClient.connect(url, function(err, db) {
                if (err) throw err;
                db.collection("pokemon").insertMany(data.pokemons, function(err, res) {
                    if (err) throw err;
                    console.log("Number of documents inserted: " + res.insertedCount);
                    db.close();
                    callback(data);
                });
            });

        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });



    }

    searchPokemon(user, callback){
        let pokemon = [],
            mid = '',
            anzPkmn = this.data.pokemons.length;
        if(anzPkmn > 0) {
            for (var i = 0; i < anzPkmn; i++) {
                let pkmn = this.data.pokemons[i];
                if (pkmn.eid > user.config.mid) {

                    var earth_radius = 6371;
                    var radius = user.config.radius;
                    var maxLat = user.config.lat + rad2deg(radius / earth_radius);
                    var minLat = user.config.lat - rad2deg(radius / earth_radius);
                    var maxLon = user.config.lon + rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));
                    var minLon = user.config.lon - rad2deg(radius / earth_radius / Math.cos(deg2rad(user.config.lat)));


                    if (pkmn.latitude < maxLat && pkmn.latitude > minLat && pkmn.longitude < maxLon && pkmn.longitude > minLon) {
                        pokemon.push(pkmn);
                    }

                }
            }
            callback(pokemon);
        }
    }

    prepareUsers(telegram, users, data){
        this.data = data;


        let self = this;
        for (var i = 0; i < users.length; i++) {

            let user = new User(users[i].uid, users[i].firstname, users[i].lastname, users[i].config, users[i].pokemon, users[i].raids);
            if(config.pokemon && user.config.pkmn){
                self.searchPokemon(user, function(pokemon){
                    self.addPokemonToQueue(pokemon, user, function(queue) {
                        if(queue) self.sendMessages(telegram, user.uid, queue);
                    });

                });


            }

            if(config.raid && user.config.raid){
                self.searchRaids(user, function(raids){
                    self.addRaidToQueue(raids, user, function(res){
                        if(res) this.sendMessages(telegram, user.uid, res);
                    });
                });

            }


        }
    }


}


module.exports = Notify;