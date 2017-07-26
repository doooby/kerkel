

class Game {

    constructor (opponent) {
        this.state = 'invitation';
        this.opponent = opponent;
    }

    clear () {
        this.state = 'clearing';
        if (this.opponent) {
            this.opponent.send({'$': 'game-abandoned'});
            this.opponent.game = null;
        }
    }
}

module.exports = Game;
