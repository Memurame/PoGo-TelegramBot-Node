class User{

    constructor(uid, firstname, lastname, config, pokemon){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {
                'lat':'',
                'lon': '',
                'radius': 2,
                'active': 1,
                'raid': 1,
                "raid_lvl": 1,
                'pkmn': 1,
                'mid': 0,
                'gid': 0};
        this.pokemon = pokemon || [];


    }


    existsPokemon(pid){
        let exists = false;
        if(this.pokemon && this.pokemon.length){
            this.pokemon.forEach(function (pkmn, index) {
                if (pkmn.pid == pid) {
                    exists =  pkmn;
                }
            });
        }

        return exists;
    }
    getPokemonIndex(pid){
        let arrIndex = false;
        if(this.pokemon && this.pokemon.length){
            this.pokemon.forEach(function (pkmn, index) {
                if (pkmn.pid == pid) {
                    arrIndex =  index;
                }
            });
        }
        return arrIndex;
    }
    getName(){
        let name = '';
        if(this.firstname != '') name = this.firstname;
        if(this.lastname != ''){
            if(this.firstname != '') name += ' ';
            name += this.lastname;
        }
        return name;
    }


    addPokemon(pid){
        let check = this.existsPokemon(pid);
        if(check){
            return false;
        } else {
            this.pokemon.push({pid: pid});
            return true;
        }

    }

    addDefaultPokemon(id){
        let pokemon = [];
        switch(id){
            case 1:
                // Standartliste von Aschi
                pokemon = [{"pid":"3"},{"pid":"9"},{"pid":"6"},{"pid":"26"},{"pid":"38"},{"pid":"59"},
                    {"pid":"65"},{"pid":"67"},{"pid":"75"},{"pid":"76"},{"pid":"78"},{"pid":"82"},
                    {"pid":"83"},{"pid":"85"},{"pid":"94"},{"pid":"95"},{"pid":"101"},{"pid":"106"},
                    {"pid":"107"},{"pid":"113"},{"pid":"114"},{"pid":"115"},{"pid":"126"},{"pid":"130"},
                    {"pid":"131"},{"pid":"137"},{"pid":"141"},{"pid":"147"},{"pid":"148"},{"pid":"149"},
                    {"pid":"154"},{"pid":"157"},{"pid":"160"},{"pid":"176"},{"pid":"179"},{"pid":"180"},
                    {"pid":"201"},{"pid":"214"},{"pid":"222"},{"pid":"229"},{"pid":"232"},{"pid":"237"},
                    {"pid":"241"},{"pid":"242"},{"pid":"246"},{"pid":"247"},{"pid":"248"},{"pid":"68"},
                    {"pid":"89"},{"pid":"103"},{"pid":"112"},{"pid":"128"},{"pid":"142"},{"pid":"143"},
                    {"pid":"139"},{"pid":"181"}];
                break;
            case 2:
                pokemon = [{"pid":"3"},{"pid":"9"}];
                break;
            default:
                pokemon = [];

        }
        this.removeAllPokemon();
        for(var i = 0; i < pokemon.length; i++){ this.pokemon.push(pokemon[i]); }

        return pokemon;
    }

    removePokemon(pid){
        let index = this.getPokemonIndex(pid);
        if(index !== false){
            this.pokemon.splice(index,1);
            return true;
        }
        return false;
    }

    removeAllPokemon(){
        this.pokemon.splice(0, this.pokemon.length);
    }

}

module.exports = User;