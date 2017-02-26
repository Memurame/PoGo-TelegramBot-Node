var config = require('./config'),
    TeleBot = require('telebot'),
    mysql = require('mysql'),
    pokemonClass = require('./pokemon');

var pokemon = new pokemonClass();
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

var menu = [[bot.button('location', 'location'), '/list'],['/add', '/remove']];

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

bot.on('/add', msg => {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var [cmdName, pkmn] = msg.text.split(' '),
            range = [];

        var array = pokemon.pokemonArray();
        if (pkmn) {
            var exists = false;

            if(pkmn.toLowerCase() == 'generation1'){ range[0] = 1; range[1] = 151}
            else if(pkmn.toLowerCase() == 'generation2'){ range[0] = 152; range[1] = 251}
            else{
                for (var i = 0; i < array.length; i++) {
                    if (pkmn.toLowerCase() == array[i].toLowerCase()) {
                        exists = true;

                        var insert = {chat_id: id, pokemon_id: i + 1};
                        sql.query('INSERT INTO notify_pokemon SET ?',
                            insert,
                            function (error, results, fields) {
                                if (!error) {
                                    return bot.sendMessage(
                                        id,
                                        '*' + pkmn + '* wurde zur Benachrichtigungsliste hinzugefügt.',
                                        {'parse': 'Markdown'});
                                } else {
                                    return bot.sendMessage(
                                        id,
                                        '*' + pkmn + '* bereits in der Liste',
                                        {'parse': 'Markdown'});
                                }
                            });
                    }
                }
                if (!exists) {
                    return bot.sendMessage(id, 'Pokemon nicht gefunden. Hast du es richtig geschrieben?');
                }
            }

            if(range.length > 0){

                var keyBoard = [];

/*
                sql.query('SELECT pokemon_id FROM notify_pokemon WHERE chat_id = ?',
                [id],
                function(error,results,fields){

                });
                */

                for(var i = range[0] -1; i < range[1]; i++){
                    var keyBoardButtons = [];
                    keyBoardButtons.push('/add ' + array[i]);
                    keyBoard.push(keyBoardButtons);
                }



                var markup = bot.keyboard(keyBoard, { resize: true });
                return bot.sendMessage(
                    id,
                    'Welche Pokémon möchtest du zur Liste hinzufügen?',
                    {markup});
            }
        } else {
            var keyBoard = [],
                keyBoardButtons = [];

            var markup = bot.keyboard([
                ['/add generation1'],['/add generation2']
            ], { resize: true });
            return bot.sendMessage(
                id,
                'Wähle die Generation aus...',
                {markup});
        }
    });
});





bot.on('/list', msg => {

    var id = msg.from.id;
    var markup = bot.keyboard(menu, { resize: true });
    sql.query('SELECT * '+
        'FROM notify_pokemon '+
        'WHERE chat_id = ?',
        [id],
        function(error, results, fields){

            if(!error)
            {
                var text = 'Du wirst über folgende Pokémon benachrichtigt:\n';
                for(var i = 0; i < results.length; i++){
                    text += pokemon.getName(results[i]['pokemon_id']) + ', ';
                }
            }
            return bot.sendMessage(id, text,{markup});
        });


});

bot.on('/menu', msg => {

    var id = msg.from.id;

    var markup = bot.keyboard(menu, { resize: true });
    return bot.sendMessage(id, 'Hauptmenü', {markup});


});


bot.on(['location'], (msg, self) => {

    var id = msg.from.id;

    loggedin(id, function(user){
        sql.query('UPDATE chats SET lat = ?, lon = ? WHERE chat_id = ?',
            [msg.location.latitude, msg.location.longitude, id],
            function(error,results,fields){

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