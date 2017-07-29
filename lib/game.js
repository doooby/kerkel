

class Game {

    constructor (user, opponent) {
        this.state = 'invitation';
        this.user = user;
        this.opponent = opponent;
    }

    messageToUser($, data) {
        if (!data) data = {};
        data['$'] = $;
        this.user.context.send(data);
    }

    clear () {
        this.state = 'clearing';
        this.messageToUser('game_abandoned');
        this.user.game = null;
    }
}

module.exports = Game;
