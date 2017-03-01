class User{

    constructor(uid, firstname, lastname, config){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {'lat':'', 'lon': '', 'radius': ''};
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

    /*
    addPokemon(pid){
        if(this.pokemon.indexOf(pid) == -1){
            this.pokemon.push(pid);
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
    */
}

module.exports = User;