class User{

    constructor(uid, firstname, lastname){
        this.uid = uid;
        this.firstname = firstname || '';
        this.lastname = lastname || '';
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