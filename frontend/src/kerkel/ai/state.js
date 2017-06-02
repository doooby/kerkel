
export default class State {

    constructor (positions, copy=false) {
        if (positions) {
            if (copy) {
                this.positions = positions.map(p => Object.assign({}, p));

            } else {
                this.positions = positions;

            }
        } else {
            throw '`new State(nothing)` not implemented';

        }
    }

    copyWithMove ({from, to}) {
        const new_state = new State(this.positions, true);
        const position_from = new_state.positions[from];
        const position_to = new_state.positions[to];

        if (position_from.player !== 1 && position_from.player !== 2) {
            console.log(this, arguments);
            throw 'state.copyWithMove bad position_from player';
        }

        if (position_from.stones <= 0) {
            console.log(this, arguments);
            throw 'state.copyWithMove no stones on position_from';
        }

        switch (position_to.player) {
            case null:
            case 0:
                position_to.stones += 1;
                position_to.player = position_from.player;
                break;

            case 1:
            case 2:
                if (position_from.player === position_to.player) {
                    position_to.stones += 1;

                } else {
                    position_to.stones = 1;
                    position_to.player = position_from.player;

                }
                break;

            default:
                console.log(this, arguments);
                throw 'state.copyWithMove bad position_to player';
                break;
        }

        position_from.stones -= 1;
        if (position_from.stones <= 0) position_from.player = null;

        return new_state;
    }

    evaluateMovesForPlayer (player) {
        const moves = [];

        this.positions.filter(p => p.player === player).forEach(from => {
            POSSIBLE_MOVES[from.i].map(i => this.positions[i]).forEach(to => {
                if (BASES[to.i] === player) return;
                moves.push(new Move(this, player, {from: from.i, to: to.i}));
            });
        });

        return moves;
    }

    toBoardSituation () {
        const situation = {};
        this.positions.filter(p => p.stones > 0).forEach(p => {
            situation[p.i] = {player: i_to_board_player(p.player), stones: p.stones};
        });
        return situation;
    }

    evaluatePathsForPlayer (player) {
        const paths = [];

        this.positions.filter(p => p.player === player).forEach(p => {
            for (let i=0; i<p.stones; i+=1) paths.push(Path.toOpponentBase(state, player, p));
        });

        return paths;
    }

}

class Move {

    constructor (from_state, player, move) {
        this.from_state =  from_state;
        this.player = player;
        this.move = move;

        this.base_reached = opponents_i(player) === BASES[move.to];
        if (!this.base_reached) this.to_state = from_state.copyWithMove(move);
    }

}

class Path {

    constructor () {

    }

}

Path.toOpponentBase = function (state, player, position) {

};

State.fromBoard = function (board) {
    const positions = board.positions.map(position => {
        const player =  (
            position.stones.length > 0 ?
                board_player_to_i(position.stones[0].player) :
                null
        );
        const base_for = BASES[position.i];

        return {
            i: position.i,
            stones: position.stones.length,
            player: player,
            base: (base_for === undefined ? null : base_for)
        };
    });

    return new State(positions);
};

function board_player_to_i (player_i) {
    if (player_i === null) return 0;
    else if (player_i === 0) return 1;
    else if (player_i === 1) return 2;
    else throw `bad player ${player_i}`;
}

function i_to_board_player (player) {
    player -= 1;
    if (player > 1) throw `bad value ${player}`;
    if (player < 0) player = null;
    return player;
}

function opponents_i (player_i) {
    if (player_i === 1) return 2;
    else if (player_i === 2) return 1;
    else throw `bad player ${player_i}`;
}

const POSSIBLE_MOVES = {
    0: [1, 4, 5, 20, 6],
    1: [0, 6, 3, 2], //2
    //2: [1, 3, 6, 7, 8],
    3: [4, 8, 1, 2], //2
    4: [0, 3, 9, 24, 8],
    5: [6, 15, 10, 0],
    6: [7, 5, 11, 1, 12, 10, 0, 2], //2
    7: [8, 6, 12, 2], //2
    8: [9, 7, 13, 3, 14, 12, 4, 2], //2
    9: [19, 8, 14, 4],
    10: [11, 15, 5, 16, 6],
    11: [12, 10, 16, 6],
    12: [13, 11, 17, 7, 18, 16, 6, 8],
    13: [14, 12, 18, 8],
    14: [13, 19, 9, 18, 8],
    15: [16, 5, 20, 10],
    16: [17, 15, 21, 11, 20, 10, 12, 22], //22
    17: [18, 16, 12, 22], //22
    18: [19, 17, 23, 13, 24, 12, 14, 22], //22
    19: [9, 18, 24, 14],
    20: [21, 24, 0, 15, 16],
    21: [20, 23, 16, 22], //22
    //22: [16, 17, 18, 21, 23],
    23: [24, 21, 18, 22], //22
    24: [20, 23, 4, 19, 18]
};

const BASES = {
    2: 1,
    22: 2
};