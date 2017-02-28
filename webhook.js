var express = require('express'),
    bodyParser  = require('body-parser'),
    mysql = require('mysql'),
    teleBot = require('teleBot'),
    config = require('./config'),
    moment = require('moment'),
    pokemonClass = require('./OLD/pokemon');

var app = express();
var pokemon = new pokemonClass();
var bot = new teleBot(config.API);
var sql = mysql.createConnection({
    host     : config.HOST,
    user     : config.USER,
    password : config.PASS,
    database : config.DB
});
sql.connect();

var historylist = [];

app.use(bodyParser.json());

function findHistory(id, spawnid) {
    for (var i = 0; i < historylist.length; i++) {
        if (historylist[i].message.pokemon_id == id && historylist[i].message.spawnpoint_id == spawnid)
            return i;
    }
    return -1;
}

function next(array, request, idx) {
    if (idx !== array.length) {

        process(array[idx], request, function() {
            next(array, request, idx + 1);
        });
    }
}

function process(array_element, request, callback) {

    var att = request.message.individual_attack,
        def = request.message.individual_defense,
        sta = request.message.individual_stamina,
        iv = 0;

    iv = Math.round((att + def + sta)/(15+15+15)*100,-1);

    if(array_element.iv_val <= iv){

        var disappear = moment(request.message.disappear_time),
            disappearFormated = moment.unix(disappear).format("HH:mm:ss"),
            now = moment().unix(),
            difference = disappear.diff(now),
            timeleft = moment.unix(difference).format("mm[m] ss[s]");


        if(difference <= 0){ timeleft = "expired"; }

        var text = '*' + pokemon.getName(request.message.pokemon_id) + '* mit IV: *' + iv + '*%\n';
        text += 'Angriff: '+ att +' / Verteidigung: '+ def +' / Ausdauer: '+ sta +'\n\n';
        text += 'Attacke 1: ' + pokemon.getMove(request.message.move_1) + '\n';
        text += 'Attacke 2: ' + pokemon.getMove(request.message.move_2) + '\n\n';
        text += 'Verfügbar bis '+ disappearFormated +' ( ' + timeleft + ' )';

        bot.sendMessage(
            array_element.chat_id,
            text,
            {'parse': 'Markdown'}
        );
        console.log("ChatID: "+ array_element.chat_id);
        bot.connect();
    }
    callback();
}

app.post('/', function(request, response) {
    if (findHistory(request.body.message.pokemon_id, request.body.message.spawnpoint_id) < 0) {

        sql.query('SELECT chats.chat_id, chats.place, chats.active, notify_pokemon.pokemon_id, notify_iv.iv_val '
            +'FROM notify_pokemon '
            +'LEFT JOIN chats '
            +'ON notify_pokemon.chat_id = chats.chat_id '
            +'LEFT JOIN notify_iv '
            +'ON notify_pokemon.chat_id = notify_iv.chat_id AND notify_pokemon.pokemon_id = notify_iv.pokemon_id '
            +'WHERE notify_pokemon.pokemon_id = ? '
            +'AND chats.active = 1',
            [request.body.message.pokemon_id],
            function(error,results,fields){
                if(results.length > 0){
                    historylist.push(request.body);
                    next(results, request.body, 0);
                }
            });
    }
    else {
        console.log("Alredy exists");
    }
    response.end();

});

app.listen(config.PORT, function() {
    console.log('Server started... port: ' + config.PORT);
});

setInterval(function(){
    var time = moment().unix();
    for (var i = 0; i < historylist.length; i++) {
        if(historylist[i].message.disappear_time <= time){
            historylist.splice(i,1);
            console.log("Element Entfernt");
        }
    }

}, 10*1000);


