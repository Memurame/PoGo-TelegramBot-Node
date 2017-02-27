const fs = require('fs');

class FileStorage{

    constructor(){
        this.file = 'backup.json';
    }

    save(data, callback){
        fs.writeFile(this.file, data, function(err){
            let status = '[OK]: File successfully saved.';
            if(err) status = '[ERROR]: File could not be saved: ' + err;
            callback(status);
        });
    }

}

module.exports = FileStorage;