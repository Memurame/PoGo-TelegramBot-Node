const fs = require('fs');

class Pokemon{

    constructor(){

        let jsonNames = fs.readFileSync('./data/de_pokemon.json', 'utf8');
        this.names = JSON.parse(jsonNames);

        let jsonMoves = fs.readFileSync('./data/de_moves.json', 'utf8');
        this.moves = JSON.parse(jsonMoves);

        let jsonStickers = fs.readFileSync('./data/stickers.json', 'utf8');
        this.stickers = JSON.parse(jsonStickers);

    }

    getName(id){
        return this.names[id];
    }

    getID(name){
        var arr = this.names;
        var pid = false;
        Object.keys(this.names).map(function(key){
            if(name.toLowerCase() == arr[key].toLowerCase()) pid = key;
        });
        return pid;
    }

    getMove(id){
        return this.moves[id];
    }

    getSticker(id){
        return this.stickers[id];
    }

}

module.exports = Pokemon;