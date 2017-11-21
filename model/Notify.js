const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');
const moment = require('moment');
const TeleBot = require('telebot');

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


    sendPokemon(data, user){
        var mid = '';
        var anzPkmn = data.length;
        //var anzGym = data.gyms.length;


        if(anzPkmn > 0 && user['config']['pkmn']){
            console.log("Anzahl Pkmn = " + anzPkmn);
            console.log("Anzahl Gym = " + anzGym);
            for(var i = 0; i< anzPkmn; i++){
                let pkmn = data.pokemons[i];
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


                    let replyMarkup = this.telegram.inlineKeyboard([
                        [
                            this.telegram.inlineButton('Standort', {callback: '/getLocation ' + pkmn.latitude + ' ' + pkmn.longitude}),
                            this.telegram.inlineButton('Entfernen', {callback: '/remove ' + this.pokemon.getName(pkmn.pokemon_id)})
                        ]
                    ]);

                    this.telegram.sendMessage(
                        user['uid'],
                        text,
                        {'parse': 'Markdown', 'markup': replyMarkup}
                    );
                }
            }
            user['config']['mid'] = mid;
        }
    }

    /*
    run(callback) {


        for(var i = 0; i < this.users.length; i++){
            let user = new User(this.users[i]['uid'], this.users[i]['firstname'], this.users[i]['lastname'], this.users[i]['config'], this.users[i]['pokemon']);

            var mid = '';
            var gid = '';

            if (user['config']['lat'] &&
                user['config']['lon'] &&
                user['config']['radius'] &&
                user['config']['active']) {

                var earth_radius = 6371;
                var radius = user['config']['radius'];
                var maxLat = user['config']['lat'] + rad2deg(radius / earth_radius);
                var minLat = user['config']['lat'] - rad2deg(radius / earth_radius);
                var maxLon = user['config']['lon'] + rad2deg(radius / earth_radius / Math.cos(deg2rad(user['config']['lat'])));
                var minLon = user['config']['lon'] - rad2deg(radius / earth_radius / Math.cos(deg2rad(user['config']['lat'])));


                var ajdata = {
                    'mid': user['config']['mid'],
                    'gid': user['config']['gid'] + 1,
                    'w': minLon,
                    'e': maxLon,
                    'n': maxLat,
                    's': minLat
                };

                console.log(ajdata);
                var options = {
                    url: 'https://mapdata2.gomap.eu/mnew.php',
                    method: 'GET',
                    qs: ajdata
                };

                request(options, function (error, response, body){
                    this.data = JSON.parse(body);
                    var anzPkmn = this.data.pokemons.length;
                    var anzGym = this.data.gyms.length;
                    console.log("Anzahl Pkmn = " + anzPkmn);
                    console.log("Anzahl Gym = " + anzGym);






                }).on('error', function(e) {
                    console.log("Got error: " + e.message);
                });
            }


        }
        this.users.forEach(function(user){



        });

    }
    */

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