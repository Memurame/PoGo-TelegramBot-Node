
module.exports = class pokemon{


    constructor(){
        this.pokemonJson = require('./data/de_pokemon.json');
        this.stickerJson = require('./data/stickers.json');
        this.moveJson = require('./data/de_moves.json');
    }
    getName(id){
        return this.pokemonJson[id];
    }

    getMove(id){
        return this.moveJson[id];
    }

    getSticker(id){
        return this.stickerJson[id];
    }
}