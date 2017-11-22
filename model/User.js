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

    removePokemon(pid){
        let index = this.getPokemonIndex(pid);
        if(index !== false){
            this.pokemon.splice(index,1);
            return true;
        }
        return false;
    }

}

module.exports = User;