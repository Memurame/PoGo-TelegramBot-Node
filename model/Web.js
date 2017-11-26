var express = require("express");

class Web{

    constructor(users){

        this.app = express();
        this.app.use(express.static(__dirname + "/public"));

        this.app.get("/", function(request, response){ //root dir
            response.send('Webinterface');
        });

        this.app.listen('8080', '127.0.0.1');
    }

}

module.exports = Web;