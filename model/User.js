class User{

    constructor(uid, firstname, lastname, config, pokemon){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {'lat':'', 'lon': '', 'radius': '', 'active': '1', 'raid': '1'};
        this.pokemon = pokemon || [];
    }


    existsPokemon(pid){
        console.log("pid: " + pid);
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
        console.log("pid: " + pid);
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


    addPokemon(pid, iv = "0"){
        let check = this.existsPokemon(pid);
        if(check){
            return false;
        } else {
            this.pokemon.push({pid: pid, iv: iv});
            return true;
        }

    }

    removePokemon(pid){
        let index = this.getPokemonIndex(pid);
        console.log("Pokemon remove index: " + index);
        if(index !== false){
            this.pokemon.splice(index,1);
            return true;
        }
        return false;
    }

}

module.exports = User;