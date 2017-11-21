if (typeof localStorage === "undefined" || localStorage === null) {
    const LocalStorage = require('node-localstorage').LocalStorage;
    localStorage = new LocalStorage('./fake-storage');
}

class TemporaryStorage{

    constructor(){
        this.storageKey = 'pogo-telegram-storage';
        this.raidKey = 'raid-storage';
    }

    save(data, file){
        try {
            localStorage.setItem(file, data);
        }catch(err){
            return '[ERROR]: Cannot save to LocalStorage: ' + err;
        }
        return '[OK]: Successfully saved to LocalStorage';
    }

    read(file){
        try{
            return localStorage.getItem(file);
        }catch(err){
            return '[ERROR]: Cannot read LocalStorage: ' + err;
        }
    }

}

module.exports = TemporaryStorage;