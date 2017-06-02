import State from './state';

const KerkelAI = {

    initDebugSession (app) {

        app.k3d.initSession();

        const try_next = function (state) {
            const moves = state.evaluateMovesForPlayer(1);
            const winner = moves.find(m => m.base_reached);
            if (winner) {
                console.log('winner');

            } else if (moves.length === 0) {
                console.log('no more moves');

            }
            else {
                const go_to_state = moves[Math.floor(Math.random() * moves.length)].to_state;
                display_state(app, go_to_state);

                setTimeout(function () {
                    try_next(go_to_state);
                }, 600);
            }
        };
        try_next(State.fromBoard(app.k3d.board));


    }

};

function display_state (app, state) {
    let situation = state.toBoardSituation();
    app.k3d.board.setSituation(situation);
    app.k3d.render();
}

export default KerkelAI;