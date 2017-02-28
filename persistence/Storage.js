const FileStorage = require('./FileStorage');
const TemporaryStorage = require('./TemporaryStorage');
const User = require('../model/User');

class Storage{

    constructor(){ }

    saveToFile(objs, callback){
        let json = JSON.stringify(objs);
        let storage = new FileStorage();
        storage.save(json, function(status){
            callback(status);
        });
    }

    saveToLocal(objs, callback){
        let json = JSON.stringify(objs);
        let storage = new TemporaryStorage();
        let status = storage.save(json);
        callback(status);
    }

    readFromLocal(callback){
        let storage = new TemporaryStorage();
        let json = storage.read();
        let objs = JSON.parse(json);

        if(typeof objs == 'Object' && objs.hasOwnProperty(users)){
            let users = [];
            objs.users.forEach(function(obj){
                users.push(new User(obj.uid, obj.firstname, obj.lastname));
            });
            objs.users = users;
        }

        callback(objs);
    }

}

module.exports = Storage;