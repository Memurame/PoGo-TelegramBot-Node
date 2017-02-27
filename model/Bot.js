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

    doCheck(telegram, uid){
        if(this.users.hasOwnProperty(uid)) return this.users[uid];
        this.doWarn(telegram, uid);
        return false;
    }

    doWarn(telegram, uid){
        telegram.sendMessage(uid, 'Bitte führe den Befehl /start aus um den Bot zu starten.');
    }

    doAdd(telegram, user){
        telegram.sendMessage(user.uid, 'Hello World!');
    }

}

module.exports = Bot;