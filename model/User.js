class User{

    constructor(uid, firstname, lastname, config, pokemon){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {'lat':'', 'lon': '', 'radius': ''};
        this.pokemon = pokemon || [];
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
        if(!pid) return 'Pokémon wurde nicht gefunden.\nÜberprüfe den Namen.';

        if(this.pokemon.indexOf(pid) == -1){
            this.pokemon.push({pid: pid, iv: ''});
            return true;
        }
        return false;
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