const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const User = require('./User');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');
const moment = require('moment');

class Notify {

    constructor(){
        this.raids = [];

        this.data = [];

        let storage = new Storage();
        let self = this;
        storage.readRaids(function(data){
            try{ self.raids = data; }catch(err){ }
        });

    }

    run(bot, callback) {

        bot.users.forEach(function(user){
            user = new User(user['uid'], user['firstname'], user['lastname'], user['config'], user['pokemon']);

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


        });

    }

    doSave(){
        let storage = new Storage();
        storage.saveRaids(this.raids, function(status){
            console.log("Saved");
        });
    }

}


module.exports = Notify;