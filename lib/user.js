

class User {

    constructor (context, id, name) {
        this.context = context;
        this.id = Number(id);
        this.name = String(name);

        this.game = null;
    }

}

module.exports = User;

