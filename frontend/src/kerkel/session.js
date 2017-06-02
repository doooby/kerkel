

export default class Session {

    constructor (k3d, local_player, on_moved_callback) {
        this.k3d = k3d;
        this.on_move = 0;

        this.local_player_i = local_player;
        this.on_moved_callback = on_moved_callback;
    }

    attach () {
        this.k3d._on_move_callback = this.onLocalMove.bind(this);
        this.k3d.session = this;
    }

    detach () {
        this.k3d.board.player_on_move = null;
        this.k3d._on_move_callback = null;
        this.k3d.session = null;
    }

    onLocalMove (from_i, to_i) {
        if (this.on_move !== this.local_player_i) throw 'onLocalMove shouldnt be called';

        this.on_move = the_other_player_i(this.local_player_i);
        this.on_moved_callback[this.local_player_i](from_i, to_i);
    }

    onOpponentMove (from_i, to_i) {
        if (this.on_move !== the_other_player_i(this.local_player_i)) throw 'onOpponentMove shouldnt be called';

        let from_position = this.k3d.board.positions[from_i];
        let to_position = this.k3d.board.positions[to_i];
        this.k3d.board.move(from_position, to_position);
        this.k3d.render();

        this.on_move = this.local_player_i;
        const opponent_i = the_other_player_i(this.local_player_i);
        this.on_moved_callback[opponent_i](from_i, to_i);
    }

    tryToDecideWinner () {
        if (this.k3d.board.isAtWinningPosition(this.on_move)) return this.on_move;
        if (this.k3d.board.hasNoStonesLeft(this.on_move)) return the_other_player_i(this.on_move);

        return null;
    }

    playerOnMoveHasWon () {
        return this.k3d.board.isAtWinningPosition(this.on_move);
    }

    allowNextMove () {
        this.k3d.board.player_on_move = this.on_move;
    }

}

function the_other_player_i (i) {
    if (i === 0) return 1;
    else if (i === 1) return 0;
    else throw 'the_other_player_i failed';
}

