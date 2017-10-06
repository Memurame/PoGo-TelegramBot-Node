'use strict';

const Bot = require('./model/Bot');
const config = require('./config');
const TeleBot = require('telebot');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');


//init bot
let bot = new Bot();


//init telegram
let telegram = new TeleBot({
    token: config.API
});
bot.users.forEach(function(user){

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
            data: ajdata
        };


        request(options, function (error, response, body){
            var data = JSON.parse(body);
            console.log(data.pokemons.length);
            data.pokemons.forEach(function(pkmn){
                if(pkmn['eid'] > mid){
                    mid = pkmn['eid'];
                }


            });
            console.log("eid = " + mid);
            user['config']['mid'] = mid;
            bot.doSave();
        });



    }
});