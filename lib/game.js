

class Game {

    constructor (user_context, opponent) {
        // this.user_context = user_context;
        this.opponent = opponent;
        this.state = 'invitation';
    }

    // setOpponent(opponent) {
    //     this.opponent = opponent;
    // }

    clear () {
        this.state = 'clearing';
        if (this.opponent) {
            this.opponent.send({'$': 'game-abandoned'});
            this.opponent.game = null;
        }
    }
}

Game.pending = 'pending';
module.exports = Game;
