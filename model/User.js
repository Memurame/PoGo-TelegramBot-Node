class User{

    constructor(uid, firstname, lastname, config, pokemon){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {'lat':'', 'lon': '', 'radius': '', 'active': '1'};
        this.pokemon = pokemon || [];
    }


    existsPokemon(pid){
        console.log("pid: " + pid);
        let exists = false;
        if(this.pokemon && this.pokemon.length){
            this.pokemon.forEach(function (pkmn) {
                if (pkmn.pid == pid) {
                    exists =  pkmn;
                }
            });
        }

        return exists;

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
            console.log("return oben");
            return false;
        } else {
            this.pokemon.push({pid: pid, iv: ''});
            console.log("return unten");
            return true;
        }

    }

    removePokemon(pid){
        let index = this.pokemon.indexOf(pid);
        if(index >= 0){
            this.pokemon.splice(index,1);
            return true;
        }
        return false;
    }

}

module.exports = User;