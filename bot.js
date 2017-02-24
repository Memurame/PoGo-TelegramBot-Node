var config = require('./config'),
    TeleBot = require('telebot'),
    mysql = require('mysql');

var bot = new TeleBot({
    token: config.API,
    polling: {
        interval: 1000,
        timeout: 0,
        limit: 100,
        retryTimeout: 5000
    }
});
var sql = mysql.createConnection({
    host     : config.HOST,
    user     : config.USER,
    password : config.PASS,
    database : config.DB
});
sql.connect();

bot.use(require('telebot/modules/ask.js'));

function loggedin(id, callback){
    sql.query('SELECT * '+
        'FROM chats '+
        'WHERE chat_id = ?',
        [id],
        function(error, results, fields){

            if(results.length > 0)
            { callback(results[0]); }
            else
            { callback = false; }

        });
}



bot.on('/start', msg => {

    var id = msg.from.id;

    sql.query('SELECT * '+
        'FROM chats '+
        'WHERE chat_id = ?', [id],
        function(error, results, fields){
            if(results.length == 0){
                if(config.authentication){
                    return bot.sendMessage(id, 'Dieser Bot ist nur für VIP und ausgewählte Personen.');
                } else {
                    var insert  = {chat_id: id, place: 'burgdorf'};
                    sql.query('INSERT INTO chats SET ?',
                        insert,
                        function(error,results,fields){
                            if(!error){
                                return bot.sendMessage(id, 'Willkommen beim PokemonBot.');
                            } else {
                                return bot.sendMessage(id, 'Ein Fehler ist aufgetretten');
                            }

                        });
                }
            } else {
                if(results[0]['active'] == 0){
                    sql.query('UPDATE chats SET active = 1 WHERE ?',
                        [id],
                        function(error,results,fields){
                            if(!error){
                                return bot.sendMessage(id, 'PokemonBot wurde aktiviert.');
                            } else {
                                return bot.sendMessage(id, 'Ein Fehler ist aufgetretten');
                            }
                        });
                } else {
                    return bot.sendMessage(id, 'PokemonBot ist bereits aktiviert.');
                }
            }
        }
    );
});

bot.on('/id', msg => {

    var id = msg.from.id;

    return bot.sendMessage(id, 'Deine ID: ' + id);


});



bot.on('/stop', msg => {

    var id = msg.from.id;

    loggedin(id, function(user){

        if(user['active'] == 1)
        {
            sql.query('UPDATE chats SET active = 0 WHERE ?',
                [id],
                function(error,results,fields){
                    if(!error){
                        return bot.sendMessage(id, 'PokemonBot wurde deaktiviert.');
                    } else {
                        return bot.sendMessage(id, 'Ein Fehler ist aufgetretten');
                    }
                });
        } else {
            return bot.sendMessage(id, 'PokemonBot bereits deaktiviert.');
        }
    })

});

bot.on('/addpokemon', msg => {

    var id = msg.from.id;
    var [cmdName, pkmn] = msg.text.split(' ');

    return bot.sendMessage(id, pkmn);


});

bot.on('/menu', msg => {

    var id = msg.from.id;

    var markup = bot.keyboard([
        [bot.button('location', 'location'), 'stumm']
    ], { resize: true });
    return bot.sendMessage(id, 'Hauptmenü', {markup});


});


bot.on(['location'], (msg, self) => {

    var id = msg.from.id;

    loggedin(id, function(user){
        sql.query('UPDATE chats SET lat = ?, lon = ? WHERE chat_id = ?',
            [msg.location.latitude, msg.location.longitude, id],
            function(error,results,fields){

                var markup = bot.keyboard([
                    [[1],[2],[3]],
                    [[4],[5],[6]],
                    [[7],[8][9]]
                ], { resize: true });

                return bot.sendMessage(
                    msg.from.id,
                    'Dein Standort wurde festgelegt.\nSetze nun einen Radius in Meter:',
                    { ask: 'radius'});

            });
    });

});

bot.on('ask.radius', msg => {
    var id = msg.from.id;

    loggedin(id, function(user){
        sql.query('UPDATE chats SET radius = ? WHERE chat_id = ?',
            [msg.text, id],
            function(error,results,fields){
                return bot.sendMessage(id, 'Der Radius wurde gesetzt.');

            });
    });
});

bot.connect();