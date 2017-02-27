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

var menu = [[bot.button('location', 'location'), '/list'],['/set generation1', '/set generation2']];

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

function findInList(chatID , pokemonID, callback){
    sql.query('SELECT pokemon_id FROM notify_pokemon WHERE chat_id = ? AND pokemon_id = ?',
        [chatID, pokemonID],
        function(error,results,fields){
            if(!error && results.length > 0){
                if(results[0]['pokemon_id'] == pokemonID){
                    callback(true);
                }
            } else {
                callback(false);
            }
        });

}



bot.on('/start', function(msg) {

    var id = msg.from.id;

    sql.query('SELECT * '+
        'FROM chats '+
        'WHERE chat_id = ?', [id],
        function(error, results, fields){
            if(results.length == 0){
                if(config.authentication){
                    return bot.sendMessage(id, 'Dieser Bot ist nur für VIP und ausgewählte Personen.');
                } else {
                    var insert  = {chat_id: id};
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

bot.on('/id', function(msg) {

    var id = msg.from.id;

    return bot.sendMessage(id, 'Deine ID: ' + id);


});



bot.on('/stop', function(msg) {

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

bot.on('/set', function(msg) {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var [cmdName, pkmn] = msg.text.split(' '),
            range = [];

        var array = pokemon.pokemonArray();
        if (pkmn) {
            var exists = false;

            if(pkmn.toLowerCase() == 'generation1'){ range[0] = 1; range[1] = 151}
            else if(pkmn.toLowerCase() == 'generation2'){ range[0] = 152; range[1] = 251}

            if(range.length > 0){

                var keyBoard = [];
                var keyBoardButtons = [];
                var totalLength = range[1] - (range[0] - 1);
                var currentItemCount = 0;
                for(var i = range[0] -1; i < range[1]; i++){
                    findInList(id, i +1, function(callback){
                        if(callback){
                            keyBoardButtons.push(['/remove ' + array[this.i]]);
                        } else {
                            keyBoardButtons.push(['/add ' + array[this.i]]);
                        }
                        currentItemCount++;

                        if(totalLength == currentItemCount){
                            var markup = bot.keyboard(keyBoardButtons, { resize: true });
                            return bot.sendMessage(
                                id,
                                'Hinzufügen oder entfernen von Pokémon...',
                                {markup});
                        }
                    }.bind( {i: i} ));
                }

            }
        } else {

            var markup = bot.keyboard([
                ['/set generation1'],['/set generation2']
            ], { resize: true });
            return bot.sendMessage(
                id,
                'Wähle die Generation aus...',
                {markup});
        }
    });
});

bot.on('/add', function(msg) {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var [cmdName, pkmn] = msg.text.split(' '),
            range = [];

        var array = pokemon.pokemonArray();
        if (pkmn) {
            var exists = false;


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
                                    '*' + pkmn + '* wurde zur Liste hinzugefügt.',
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
                return bot.sendMessage(id,
                    '*' + pkmn + '* nicht gefunden. Hast du es richtig geschrieben?',
                    {'parse': 'Markdown'});
            }
        } else {

            return bot.sendMessage(
                id,
                'Kein Pokémon ausgewählt.');
        }
    });
});


bot.on('/remove', function(msg) {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var [cmdName, pkmn] = msg.text.split(' '),
            range = [];

        var array = pokemon.pokemonArray();
        if (pkmn) {
            var exists = false;


            for (var i = 0; i < array.length; i++) {
                if (pkmn.toLowerCase() == array[i].toLowerCase()) {
                    exists = true;

                    sql.query('DELETE FROM notify_pokemon WHERE chat_id = ? AND pokemon_id = ?',
                        [id, i + 1],
                        function (error, results, fields) {
                            if(results.affectedRows == 1){
                                return bot.sendMessage(
                                    id,
                                    '*' + pkmn + '* wurde aus der Liste entfernt.',
                                    {'parse': 'Markdown'});
                            } else {
                                return bot.sendMessage(
                                    id,
                                    '*' + pkmn + '* ist nicht in deiner Liste.',
                                    {'parse': 'Markdown'});
                            }
                        });
                }
            }
            if (!exists) {
                return bot.sendMessage(id,
                    '*' + pkmn + '* nicht gefunden. Hast du es richtig geschrieben?',
                    {'parse': 'Markdown'});
            }
        } else {

            return bot.sendMessage(
                id,
                'Kein Pokémon ausgewählt.');
        }
    });
});




bot.on('/list', function(msg) {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var markup = bot.keyboard(menu, {resize: true});
        sql.query('SELECT * ' +
            'FROM notify_pokemon ' +
            'WHERE chat_id = ?',
            [id],
            function (error, results, fields) {

                if (!error) {
                    var text = 'Du wirst über folgende Pokémon benachrichtigt:\n';
                    for (var i = 0; i < results.length; i++) {
                        text += pokemon.getName(results[i]['pokemon_id']) + ', ';
                    }
                }
                return bot.sendMessage(id, text, {markup});
            });

    });
});

bot.on('/menu', function(msg) {

    var id = msg.from.id;
    loggedin(id, function(user) {
        var markup = bot.keyboard(menu, {resize: true});
        return bot.sendMessage(id, 'Hauptmenü', {markup});
    });

});

bot.on('/reset', function(msg) {
    var id = msg.from.id;
    loggedin(id, function(user) {
        return bot.sendMessage(
            id,
            'Wirklich alle deine Einstellungen zurücksetzen?\nBestätige mit "Ja"',
            {ask: 'reset'});
    });
});

bot.on('ask.reset', function(msg) {
    var id = msg.from.id;
    loggedin(id, function(user) {
        return bot.sendMessage(id, 'Einstellungen wurden zurückgesetzt.');
    });
});


bot.on(['location'], function(msg, self) {

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

bot.on('ask.radius', function(msg) {
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