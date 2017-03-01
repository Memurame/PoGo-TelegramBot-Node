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

    getList(){
        var arr = this.names;
        var list = Object.keys(this.names);

        return list;
    }

    addUser(uid, pid, list, iv){
        iv = iv || '';
        if(!pid) return 'Pokémon wurde nicht gefunden.\nÜberprüfe den Namen.';
        if(list[pid-1]['users'].indexOf(uid) == -1){
            list[pid-1]['users'].push(uid);
            return this.getName(pid) + ' wurde der Liste hinzugefügt.';
        } else {
            return this.getName(pid) + ' bereits in der Liste vorhanden';
        }

    }
    removeUser(uid, pid, list){
        if(!pid) return 'Pokémon wurde nicht gefunden.\nÜberprüfe den Namen.';
        let index = list[pid-1]['users'].indexOf(uid);
        if(index == -1){
            return this.getName(pid) + ' nicht in der Liste vorhanden.';
        } else {
            list[pid-1]['users'].splice(index,1);
            return this.getName(pid) + ' wurde aus der Liste entfernt';
        }
    }


}

module.exports = Pokemon;