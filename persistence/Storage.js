const FileStorage = require('./FileStorage');

class Storage{

    constructor(){ }

    saveToFile(objs, callback){
        console.log(objs);
        let json = JSON.stringify(objs);
        let storage = new FileStorage();
        storage.save(json, function(status){
            callback(status);
        });
    }

}

module.exports = Storage;