'use strict';

const Bot = require('./model/Bot');
const Pokemon = require('./model/Pokemon');
const User = require('./model/User');
const config = require('./config');
const TeleBot = require('telebot');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');
const moment = require('moment');


//init bot
let bot = new Bot();

//init pokemon
let pokemon = new Pokemon();

//init telegram
let telegram = new TeleBot({
    token: config.API
});
bot.users.forEach(function(user){
    user = bot.findUser(user['uid']);
    if(user){
        user = new User(user['uid'], user['firstname'], user['lastname'], user['config'], user['pokemon']);

        var mid = '';

        if(user['config']['lat'] &&
            user['config']['lon'] &&
            user['config']['radius']){

            var earth_radius = 6371;
            var radius = user['config']['radius'] / 1000;
            var maxLat = user['config']['lat'] + rad2deg(radius/earth_radius);
            var minLat = user['config']['lat'] - rad2deg(radius/earth_radius);
            var maxLon = user['config']['lon'] + rad2deg(radius/earth_radius/Math.cos(deg2rad(user['config']['lat'])));
            var minLon = user['config']['lon'] - rad2deg(radius/earth_radius/Math.cos(deg2rad(user['config']['lat'])));


            var ajdata = {
                'mid': user['config']['mid'],
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
                var data = JSON.parse(body);
                var anz = data.pokemons.length;
                console.log("Anzahl = " + anz);
                if(anz > 0){
                    data.pokemons.forEach(function(pkmn){
                        if(pkmn['eid'] > mid){
                            mid = pkmn['eid'];
                        }
                        console.log(pkmn);
                        if(user.getPokemonIndex(pkmn.pokemon_id) !== false){

                            let disappear = moment(pkmn['disappear_time']),
                                disappearFormated = moment.unix(disappear).format("HH:mm:ss"),
                                now = moment().unix(),
                                difference = disappear.diff(now),
                                timeleft = moment.unix(difference).format("mm[m] ss[s]");


                            let text = '*' + pokemon.getName(pkmn.pokemon_id) + '*\n';
                            text += 'Verfügbar bis '+ disappearFormated +' ( ' + timeleft + ' )';


                            let replyMarkup = telegram.inlineKeyboard([
                                [
                                    telegram.inlineButton('Standort', {callback: '/getLocation ' + pkmn.latitude + ' ' + pkmn.longitude}),
                                    telegram.inlineButton('Entfernen', {callback: '/remove ' + pokemon.getName(pkmn.pokemon_id)})
                                ]
                            ]);



                            telegram.sendMessage(
                                user['uid'],
                                text,
                                {'parse': 'Markdown', 'markup': replyMarkup}
                            );

                        }



                    });
                    user['config']['mid'] = mid;
                    bot.doSave();
                }

            }).on('error', function(e) {
                console.log("Got error: " + e.message);
            });



        }
    }


});