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

        //set main admins
        if(!this.admins.indexOf(config.adminID) >= 0) this.admins.push(config.adminID);

    }

    doStart(from){
        //create user and append to users if not exists
        let user = new User(from.id, from.first_name, from.last_name);
        if(!this.users.hasOwnProperty(user.uid)) this.users[user.uid] = user;
        return user;
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

    doCheck(telegram, uid){
        if(this.users.hasOwnProperty(uid)) return this.users[uid];
        this.doWarn(telegram, uid);
        return false;
    }

    doAdminCheck(telegram, uid){
        if(this.admins.indexOf(uid) >= 0) return true;
        this.doAdminWarn(telegram, uid);
        return false;
    }

    doWarn(telegram, uid){
        telegram.sendMessage(uid, 'Bitte führe den Befehl /start aus um den Bot zu starten.');
    }

    doAdminWarn(telegram, uid){
        telegram.sendMessage(uid, 'Dieses Kommando ist Admin Benutzern vorbehalten.');
    }

    doAdd(telegram, user){
        telegram.sendMessage(user.uid, 'Funktion wird noch implementiert...');
    }

    doBackup(telegram, uid){
        let storage = new Storage();
        storage.saveToFile({users: this.users, admins: this.admins}, function(status){
            console.log(status);
            telegram.sendMessage(uid, status);
        });
    }

}

module.exports = Bot;