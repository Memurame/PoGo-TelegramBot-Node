const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const User = require('./User');
const Notify = require('./Notify');
const rad2deg = require('rad2deg');
const deg2rad = require('deg2rad');
const request = require('request');

class Bot{

    constructor(){
        this.init();
    }

    init(){

        //init pokemon info list
        this.pokemon = new Pokemon();

        //setup user array
        this.users = [];

        // server request
        this.data = null;

        //setup admin array
        this.admins = [];

        //get data from localstorage
        let storage = new Storage();
        let self = this;
        storage.readFromLocal(function(data){
            try{ self.users = data.users; }catch(err){ }
            try{ self.admins = data.admins; }catch(err){ }
        });

        //set main admins
        if(this.admins.indexOf(config.adminID.toString()) == -1) this.admins.push(config.adminID.toString());
    }

    findUser(uid){
        let foundUser = false;
        this.users.forEach(function(user){
            if(user.uid == uid) foundUser = user;
        });
        return foundUser;
    }

    displayStartInfo(telegram, user) {

        let msg = 'Willkommen zum Pokemon Go Telegram Bot ' + user.getName() + '!\n\n' +
            'Mit dem Befehl /menu öffnest du das Allgemeine Menu wo du diverse Einstellungen vornehmen kannst.' +
            'Als erstes solltest du deinen aktueller Standort festlegen, diesen kannst du später beliebig oft ändern.' +
            'Um deinen Standort zu speichern klicke unten auf "location".' +
            'So nun läuft dein Bot bereits und du erhälst Raid Benachrichtigungen im Umkreis von 2 Km.' +
            'Nun musst du nur noch deine Pokémon festlegen, dies kannst du mit dem Befehl /add.\n' +
            'Hier ein kleines Beispiel:\n' +
            '/add taubsi\n' +
            '/add taubsi,glumanda,glurak\n\n' +
            'Um Pokémon wieder zu entfernen einfach anstelle /add, /remove schreiben\n\n' +
            'Und nicht vergessen, mit /menu gelangst du immer wieder in deine Einstellungen';
        telegram.sendMessage(user.uid, msg, {'parse': 'Markdown'});

        this.doMenu(telegram, user);


    }

    displayId(telegram, uid){
        telegram.sendMessage(uid,
            "Telegram User ID: " + uid
        );
    }

    doMenu(telegram, user){
        let replyMarkup = telegram.keyboard(
            [
                [telegram.button('location', 'location'), '/radius', '/profile'],
                ['/raid', '/pokemon', '/list']
            ],
            {resize: true});
        let msg = '*Hauptmenü*\n' +
            'Hier kannst du diverse Einstellungen vornehmen\n\n' +
            '*/radius*\nMit diesem Befehl kannst du den Radius der Benachrichtigung ändern\n' +
            '*/raid*\n' +
            'Lege fest ab welchem Lvl du Benachrichtigungen zu Raid erhalten willst\n' +
            '*/pokemon*\n' +
            'Ein- und ausschalten der Pokemon Benachrichtigung\n' +
            '*/profile*\n' +
            'Zeigt deine Gespeicherten Einstellungen an\n' +
            '*/list*\n' +
            'Zeigt eine Liste mit den Pokémon an bei denen du eine Benachrichtigung erhälst\n\n' +
            'Mit /add und /remove kannst du deine Pokémon verwalten. '+
            'Hier ein paar Beispiele\n'+
            '/add taubsi\n' +
            '/add taubsi, tauboga\n' +
            '/remove taubsi, tauboga\n\n' +
            'Fragen, Ideen oder Verbesserungen?\n' +
            'https://t.me/PoGoBotDrago';

        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown', 'markup': replyMarkup}
        );

    }

    doShowConfig(telegram, user){
        let msg = '*Profile Info*\n'+
            '*ID:* ' + user['uid'] +
            '\n*Raid : *' + (user['config']['raid'] == 1 ? 'Eingeschaltet' : 'Ausgeschaltet') +
            '\n*Raid Level :* ' + user['config']['raid_lvl'] +
            '\n*Pokemon :* ' + (user['config']['pkmn'] == 1 ? 'Eingeschaltet' : 'Ausgeschaltet') +
            '\n*Radius :* ' + user['config']['radius'] +' Km';
        telegram.sendMessage(user.uid, msg, {'parse': 'Markdown'});
    }

    doStart(from){
        //create user and append to users if not exists
        let exists = this.findUser(from.id);
        let user = new User(from.id, from.first_name, from.last_name);
        if(exists){
            exists['config']['active'] = 1;
        } else {

            this.users.push(user);
        }
        return user;
    }

    doStop(telegram, user){
        let markup = telegram.inlineKeyboard([
            [telegram.inlineButton('Starten', { callback: '/start' })]
        ]);
        user['config']['active'] = 0;
        telegram.sendMessage(user.uid, 'Du erhälst nun keine Benachrichtigung mehr...', {markup});
    }

    doCheck(telegram, uid){
        let user = this.findUser(uid);
        if(user){
            user = new User(user['uid'], user['firstname'], user['lastname'], user['config'], user['pokemon']);
            return user;
        }
        this.doWarn(telegram, uid);
        return false;
    }

    doAdminCheck(telegram, uid){
        if(this.admins.indexOf(uid.toString()) >= 0) return true;
        this.doAdminWarn(telegram, uid);
        return false;
    }

    doWarn(telegram, uid){
        telegram.sendMessage(uid, 'Bitte führe den Befehl /start aus um den Bot zu starten.');
    }

    doAdminWarn(telegram, uid){
        telegram.sendMessage(uid, 'Dieses Kommando ist Admin Benutzern vorbehalten.');
    }

    doRadius(telegram, user, radius){


        let replyMarkup,
            msg;

        if(radius){
            if(radius <= 20){
                user['config']['radius'] = radius;
                msg = 'Radius von *' + radius + ' Km* gesetzt.';
            } else {
                msg = 'Kein gültiger Radius.'
            }

        } else {
            msg = '*Radius ändern*\nBestimme einen Radius';

            replyMarkup = telegram.inlineKeyboard([
                [ telegram.inlineButton('1 Km', {callback: '/radius 1'}) ],
                [ telegram.inlineButton('2 Km', {callback: '/radius 2'}) ],
                [ telegram.inlineButton('5 Km', {callback: '/radius 5'}) ],
                [ telegram.inlineButton('10 Km', {callback: '/radius 10'}) ]
            ]);
        }
        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown', 'markup': replyMarkup}
        );
    }

    doRaid(telegram, user, status){
        let msg = '';
        let replyMarkup;
        if(status <= 5 || status == "off"){
            user['config']['raid'] = (status == "off" ? 0 : 1);
            if(user['config']['raid']){
                msg = 'Du erhälst nun RAID Benachrichtigungen ab Lvl ' + status;
                user['config']['raid_lvl'] = status
            } else {
                msg = 'Du erhälst nun keine RAID Benachrichtigung mehr...';

            }
        } else {
            msg = '*Ändern der Raid Benachrichtigung.*\nAb welchem Level möchtest du eine Benachrichtigung erhalten?';

            replyMarkup = telegram.inlineKeyboard([
                [ telegram.inlineButton('Ab Lvl 1', {callback: '/raid 1'}) ],
                [ telegram.inlineButton('Ab Lvl 2', {callback: '/raid 2'}) ],
                [ telegram.inlineButton('Ab Lvl 3', {callback: '/raid 3'}) ],
                [ telegram.inlineButton('Ab Lvl 4', {callback: '/raid 4'}) ],
                [ telegram.inlineButton('Nur Lvl 5', {callback: '/raid 5'}) ],
                [ telegram.inlineButton('Keine Raid Benachrichtigung', {callback: '/raid off'}) ]
            ]);
        }
        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown', 'markup': replyMarkup}
        );

    }

    doPokemon(telegram, user, status){
        let msg = '';
        let replyMarkup;
        if(status == 'on' || status == 'off'){
            user['config']['pkmn'] = (status == "off" ? 0 : 1);
            if(user['config']['pkmn']){
                msg = 'Du erhälst nun Pokemon Benachrichtigungen';
            } else {
                msg = 'Du erhälst nun keine Pokemon Benachrichtigung mehr...';
            }
        } else {
            msg = '*Ändern der Pokemon Benachrichtigung.*\nFestlegen ob du über deine definierten Pokemon in der nähe benachrichtigt wedren willst.';

            replyMarkup = telegram.inlineKeyboard([
                [ telegram.inlineButton('Benachrichtigung AUS', {callback: '/pokemon off'}) ],
                [ telegram.inlineButton('Benachrichtigung AN', {callback: '/pokemon on'}) ]
            ]);
        }
        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown', 'markup': replyMarkup}
        );

    }

    doAdd(telegram, user, pkmnArray){

        for(var i = 0; i < pkmnArray.length; i++){
            let msg = '';
            let pid = this.pokemon.getID(pkmnArray[i]);
            if(pid){
                let pokemon = user.addPokemon(pid);
                if(pokemon){
                    msg = this.pokemon.getName(pid) + ' wurde hinzugefügt';
                } else {
                    msg = this.pokemon.getName(pid) + ' bereits vorhanden!';
                }
            } else {
                msg = pkmnArray[i] + ' existiert nicht!';
            }
            telegram.sendMessage(user.uid, msg);
        }



    }

    doRemove(telegram, user, pkmnArray){
        for(var i = 0; i < pkmnArray.length; i++){
            let msg = '';
            let pid = this.pokemon.getID(pkmnArray[i]);
            if(pid){
                if(user.removePokemon(pid)){
                    msg = this.pokemon.getName(pid) + ' wurde entfernt.';
                } else {
                    msg = this.pokemon.getName(pid) + ' nicht definiert.';
                }
            } else {
                msg = pkmnArray[i] + ' existiert nicht'
            }

            telegram.sendMessage(user.uid, msg);
        }

    }

    doList(telegram, user){
        let msg = '*Pokemon bei denen du eine Benachrichtigung erhälst:*\n';
        for(var i = 0; i < user['pokemon'].length; i++){
            msg += (i >= 1 ? ', ' : '');
            msg += this.pokemon.getName(user['pokemon'][i]['pid']);
        }

        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown'}
        );
    }

    doReset(telegram, user, reset){


        let msg = '';
        let replyMarkup;
        if(reset == 'yes'){
            msg = 'Dein Profil wurde komplet gelöscht.\nDu kannst unten auf den Button klicken um ein neues zu erstellen.';

            replyMarkup = telegram.inlineKeyboard([
                [ telegram.inlineButton('Neues Profil erstellen', {callback: '/start'}) ]
            ]);

        } else {
            msg = '*Profil zurücksetzen.*\nMit diesem Befehl wird dein Profil gelöscht, anschliessend hast du die möglichkeit ein neues zu erstellen mit den Standart Einstellungen.';

            replyMarkup = telegram.inlineKeyboard([
                [ telegram.inlineButton('Löschen', {callback: '/reset yes'}) ]
            ]);
        }
        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown', 'markup': replyMarkup}
        );

    }

    doLocation(telegram, user, location){
        user['config']['lat'] = location.latitude;
        user['config']['lon'] = location.longitude;

        let msg = 'Dein Standort wurde festgelegt.\nDer Benachrichtigungsradius beträgt *' + user['config']['radius'] + ' Km*';

        telegram.sendMessage(
            user.uid,
            msg,
            {'parse': 'Markdown'}
        );

    }

    doServerRequest(telegram){

        let notify = new Notify();

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
        let self = this;
        request(options, function (error, response, body) {



            try{
                self.data = JSON.parse(body);
                for (var i = 0; i < self.users.length; i++) {
                    let user = new User(self.users[i]['uid'], self.users[i]['firstname'], self.users[i]['lastname'], self.users[i]['config'], self.users[i]['pokemon']);
                    notify.addPokemonToQueue(self.data.pokemons, user, function (res) {
                        if(res) notify.sendMessages(telegram, user['uid'], res);
                    });
                    notify.addRaidToQueue(self.data.gyms, user, function(res){
                        notify.prepareRaid(user['uid'], res, function(filtered){
                            if(filtered) notify.sendMessages(telegram, user['uid'], filtered);
                        });

                    });
                }

            } catch (e) {
                console.log("REQUEST JSON ERROR\n" +
                    response.request.uri.query);
            }


        }).on('error', function (e) {
            console.log("Got error: " + e.message);
        });

    }

    doSendToAll(telegram, text){
        let notify = new Notify();
        for (var i = 0; i < this.users.length; i++) {
            //notify.sendMessages(telegram, this.users[i]['uid'], ['message', text]);
            telegram.sendMessage(
                this.users[i]['uid'],
                '*Nachricht vom Admin*\n' + text,
                {'parse': 'Markdown'}
            );
        }
    }

    doSendToUser(telegram, user, text){
        telegram.sendMessage(
            user,
            '*Nachricht vom Admin*\n' + text,
            {'parse': 'Markdown'}
        );
    }

    doBackup(telegram, uid){
        let storage = new Storage();
        storage.saveToFile({users: this.users, admins: this.admins}, function(status){
            telegram.sendMessage(uid, status);
        });
    }

    doSave(telegram, uid){
        let storage = new Storage();
        storage.saveToLocal({users: this.users, admins: this.admins}, function(status){
            if(telegram && uid) telegram.sendMessage(uid, status);
        });
    }



}

module.exports = Bot;