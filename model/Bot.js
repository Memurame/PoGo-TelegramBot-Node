const config = require('../config');
const Storage = require('../persistence/Storage');
const Pokemon = require('./Pokemon');
const User = require('./User');

class Bot{

    constructor(){
        this.init();
    }

    init(){

        //init pokemon info list
        this.pokemon = new Pokemon();

        //setup user array
        this.users = [];

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

    displayStartInfo(telegram, user){
        telegram.sendMessage(user.uid,
            "Willkommen zum Pokemon Go Telegram Bot " + user.getName() + "!"
        )
    }

    displayId(telegram, uid){
        telegram.sendMessage(uid,
            "Telegram User ID: " + uid
        );
    }

    doMenu(telegram, user){
        var markup = telegram.keyboard(
            [
                [telegram.button('location', 'location'), '/list']
            ],
            {resize: true});
        telegram.sendMessage(user.uid, 'Hauptmenü', {markup});


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
        this.doSave();
        return user;
    }

    doStop(telegram, user){
        let markup = telegram.inlineKeyboard([
            [telegram.inlineButton('Starten', { callback: '/start' })]
        ]);
        user['config']['active'] = 0;
        telegram.sendMessage(user.uid, 'Du erhälst nun keine Benachrichtigung mehr...', {markup});
        this.doSave();
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

    doRaid(telegram, user, status){
        let msg = '';
        if(status == "on" || status == "off"){
            user['config']['raid'] = (status == "on" ? "1" : "0");
            if(user['config']['raid'] == "0"){
                msg = 'Du erhälst nun keine RAID Benachrichtigung mehr...';
            } else {
                msg = 'Du erhälst nun RAID Benachrichtigungen...';
            }
        } else {
            msg = 'Verwende On oder Off!'
        }
        telegram.sendMessage(user.uid, msg);

        this.doSave();
    }

    doAdd(telegram, user, pokemonname, iv){
        let msg = '';
        let pid = this.pokemon.getID(pokemonname);
        if(pid){
            let pokemon = user.addPokemon(pid, iv);
            if(pokemon){
                msg = this.pokemon.getName(pid) + ' wurde hinzugefügt';
            } else {
                msg = this.pokemon.getName(pid) + ' bereits vorhanden!';
            }
        } else {
            msg = 'Pokémon wurde nicht gefunden.\nÜberprüfe den Namen.';
        }
        telegram.sendMessage(user.uid, msg);
        this.doSave();
    }

    doRemove(telegram, user, pokemonname){
        let msg = '';
        let pid = this.pokemon.getID(pokemonname);
        if(user.removePokemon(pid)){
            msg = this.pokemon.getName(pid) + ' wurde entfernt.';
        } else {
            msg = this.pokemon.getName(pid) + ' nicht in Liste vorhanden!';
        }
        telegram.sendMessage(user.uid, msg);
        this.doSave();
    }

    doList(telegram, user){
        telegram.sendMessage(user.uid, 'Funktion wird noch implementiert...');
    }

    doResetConfirm(telegram, user){
        telegram.sendMessage(
            user.uid,
            'Wirklich alle deine Einstellungen zurücksetzen?\nBestätige mit "Ja"',
            {ask: 'reset'});
    }

    doReset(telegram, user, answere){
        // Reset der Userconfig implementieren und setzen des active status auf false

        telegram.sendMessage(user.uid, 'Einstellungen wurden zurückgesetzt.');
    }

    doLocation(telegram, user, location){
        user['config']['lat'] = location.latitude;
        user['config']['lon'] = location.longitude;

        telegram.sendMessage(user.uid,
            'Dein Standort wurde festgelegt.\nSetze nun einen Radius in Meter:',
            { ask: 'radius'});
        this.doSave();
    }

    doLocationRadius(telegram, user, radius){
        user['config']['radius'] = radius;
        telegram.sendMessage(user.uid,
            'Ein Radius von *' + radius + 'm* wurde gesetzt.',
            {'parse': 'Markdown'});
        this.doSave();
    }


    doBackup(telegram, uid){
        let storage = new Storage();
        storage.saveToFile({users: this.users, admins: this.admins}, function(status){
            console.log(status);
            telegram.sendMessage(uid, status);
        });
    }

    doSave(telegram, uid){
        let storage = new Storage();
        storage.saveToLocal({users: this.users, admins: this.admins}, function(status){
            console.log(status);
            if(telegram && uid) telegram.sendMessage(uid, status);
        });
    }



}

module.exports = Bot;