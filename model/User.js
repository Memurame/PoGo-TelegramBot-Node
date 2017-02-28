class User{

    constructor(uid, firstname, lastname, config){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
        this.config = config || {};
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

}

module.exports = User;