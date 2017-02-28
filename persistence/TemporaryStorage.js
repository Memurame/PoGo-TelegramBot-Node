if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./fake-storage');
}

class TemporaryStorage{

    constructor(){
        this.storageKey = 'pogo-telegram-storage';
    }

    save(data){
        try {
            localStorage.setItem(this.storageKey, data);
        }catch(err){
            return '[ERROR]: Cannot save to LocalStorage: ' + err;
        }
        return '[OK]: Successfully saved to LocalStorage';
    }

    read(){
        try{
            return localStorage.getItem(this.storageKey);
        }catch(err){
            return '[ERROR]: Cannot read LocalStorage: ' + err;
        }
    }

}

module.exports = TemporaryStorage;