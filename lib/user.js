const Game = require('./game');

class User {

    constructor (context, id, name) {
        this.context = context;
        this.id = Number(id);
        this.name = String(name);

        this.game = null;
    }

    tryInitGame (opponent, msg) {
        if (this.game !== null) {
            this.context.respond(msg, {fail: 'you are already in game'});
            return;
        }

        if (opponent.game !== null) {
            this.context.respond(msg, {fail: 'opponent already in game'});
            return;
        }

        this.createGame(opponent);
        this.context.respond(msg);
        opponent.game.messageToUser('game_invited', {host: this.id});
    }

    createGame (opponent) {
        this.game = new Game(this, opponent);
        opponent.game = new Game(opponent, this);
    }

}

module.exports = User;

