import preact from 'preact';

export default class Game {

    constructor (app, game_id, opponent) {
        this.app = app;
        this.game_id = game_id;
        this.local_user = this.app.store('logged_user');
        this.opponent = opponent;
    }

    prepareAsChallenged () {
        this.players = [this.opponent, this.local_user];

        this.app.store.right_win.set([{app: this.app}, <div>
            <div>
                You've been challenged by {this.opponent.name}
            </div>
            <button className="button"
                    onClick={() => {
                        this.sendToOpponent('begin');
                        this.begin();
                    }}>
                Accept
            </button>
            <br/>
            <button className="button"
                    onClick={() => {
                        this.sendToOpponent('rejection', {
                            orig_message: 'invitation',
                            reason: 'user rejects'
                        });
                        this.app.store.game.discard();
                    }}>
                Reject
            </button>
        </div>]);
    }

    prepareAsChallenger () {
        this.players = [this.local_user, this.opponent];

        this.app.store.right_win.set([{app: this.app},
            `Waiting for ${this.opponent.name} ...`]);
    }

    begin () {
        this.app.store.right_win.set([{app: this.app}, <div>
            {this.players[0].name} - {this.players[1].name}
        </div>]);

        this.app.k3d.initSession(
            (this.players[0] === this.local_user ? 0 : 1),
            [
                this.onPlayerMoved.bind(this, 0),
                this.onPlayerMoved.bind(this, 1)
            ]
        );
        this.app.k3d.session.allowNextMove();
    }

    onPlayerMoved (player_i, from_i, to_i) {
        if (this.localPlayerI() === player_i) {
            this.sendToOpponent('move', {from_i, to_i});
        }

        const winner = this.app.k3d.session.tryToDecideWinner();
        if (winner !== null) {
            this.onPlayerWon(winner);
            return;
        }

        this.app.k3d.session.allowNextMove();
    }

    onLocalPlayerResigned () {
        this.sendToOpponent('resign');
        this.onPlayerWon(the_other_player_i(this.localPlayerI()));
    }

    onPlayerWon (player_i) {
        const winner = this.players[player_i];
        const local_is_winner = winner === this.local_user;

        console.log('game.onPlayerWon', player_i);
        // this.local_user.req_resp_layer.request('finish',
        //     {game: this.game_id, winner: winner.id},
        //     (req) => {
        //         if (req.fail) {
        //             this.app.store.game.discard();
        //             this.app.printAppMessage('game result not accepted by server');
        //             return;
        //         }
        //
        //         this.app.store.right_win.set([{app: this.app}, <div>
        //             <div>{
        //                 local_is_winner ?
        //                     'You have won!' :
        //                     `${winner.name} has won!`
        //             }</div>
        //             <button className="button"
        //                     onClick={() => {
        //                         this.app.store.game.discard();
        //                     }}>
        //                 Finish
        //             </button>
        //         </div>]);
        //
        //         this.app.printAppMessage(
        //             local_is_winner ?
        //                 `You have won over ${this.opponent.name}` :
        //                 `You have lost to ${this.opponent.name}`
        //         );
        //     }
        // );
    }

    onMessage (message, data) {
        switch (message) {
            case 'rejection':
                this.onRejectedMessage(message, data);
                break;

            case 'begin':
                this.begin();
                break;

            case 'move':
                this.app.k3d.session.onOpponentMove(data.from_i, data.to_i);
                break;

            case 'resign':
                this.onPlayerWon(this.localPlayerI());
                break;
        }
    }

    onRejectedMessage (message, data) {
        const orig_message = data.orig_message;
        const from = data.from;

        switch (orig_message) {
            case 'invitation':
                this.app.printAppMessage(`${this.opponent.name} rejected challenge: ${data.reason}`);
                this.app.store.game.discard();
                break;

            default:
                // not expected message
                console.log('rejected game message: ', orig_message, {
                    game: this.game_id,
                    sender: this.local_user.id,
                    recipient: from
                });
                break;

        }
    }

    onDiscard () {
        this.app.store.right_win.set(null);
    }

    sendToOpponent (message, data={}) {
        data.message = message;
        data.game = this.game_id;
        this.local_user.sendMessageTo(this.opponent.id, data);
    }

    localPlayerI () {
        return (this.local_user === this.players[0] ? 0 : 1);
    }

}

function the_other_player_i (i) {
    if (i === 0) return 1;
    else if (i === 1) return 0;
    else throw 'the_other_player_i failed';
}