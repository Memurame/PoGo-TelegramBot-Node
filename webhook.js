var express = require('express');
var bodyParser  = require('body-parser');
var mysql = require('mysql');
var TeleBot = require('telebot');
var config = require('./config');

var app = express();

var bot = new TeleBot({
    token: config.API
});
var sql = mysql.createConnection({
    host     : config.HOST,
    user     : config.USER,
    password : config.PASS,
    database : config.DB
});
sql.connect();

var queueList = [];

app.use(bodyParser.json());

function findQueue(id, spawnid) {
    console.log(queueList.length);
    for (var i = 0; i < queueList.length; i++) {
        if (queueList[i].message.pokemon_id == id && queueList[i].message.spawnpoint_id == spawnid)
            return i;
    }
    return -1;
}


app.post('/', function(request, response) {

    if (findQueue(request.body.message.pokemon_id, request.body.message.spawnpoint_id) < 0) {
        queueList.push(request.body);
    }
    else {
        console.log("Alredy exists");
    }
    response.end();
});

app.get('/', function(request, response) {
    for (var i = 0; i < queueList.length; i++) {

        var att = queueList[i].message.individual_attack;
        var def = queueList[i].message.individual_defense;
        var sta = queueList[i].message.individual_stamina;
        var iv = 0;

        iv = (att + def + sta)/(15+15+15)*100;




        sql.query('SELECT chats.chat_id, chats.place, chats.active, notify_pokemon.pokemon_id, notify_iv.iv_val '
        +'FROM notify_pokemon '
        +'LEFT JOIN chats '
        +'ON notify_pokemon.chat_id = chats.chat_id '
        +'LEFT JOIN notify_iv '
        +'ON notify_pokemon.chat_id = notify_iv.chat_id AND notify_pokemon.pokemon_id = notify_iv.pokemon_id '
        +'WHERE notify_pokemon.pokemon_id = ? '
        +'AND chats.active = 1',[queueList[i].message.pokemon_id],
        function(error,results,fields){
            for (var i2 = 0; i2 < results.length; i2++){
                if(results[i2].iv_val <= iv){
                    bot.sendMessage(
                        results[i2].chat_id,
                        'Es isches *Pokemon* mit IV: ' + iv + ' uftoucht',
                        {'parse': 'Markdown'}
                    );
                    console.log("ChatID: "+ results[i2].chat_id);
                }
            }
            bot.connect();
        });
        queueList.splice(i,1);
    }
    response.end();
});

app.listen(config.PORT, function() {
    console.log('Server started... port: ' + config.PORT);
});
