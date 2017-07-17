import preact from 'preact';

import K3D from './src/kerkel/kerkel_3d';
import KerkelAI from './src/kerkel/ai/index';
import User from './src/user';
import App from './src/app';

import AppContainer from './src/components/app_container';
import actions from './src/actions';

import app_utils from './src/app_utils';


document.addEventListener('DOMContentLoaded',function(){
    switch (app_utils.get_url_params('script')) {
        case 'random':
            ai_script();
            break;

        case 'many':
            many_boards_script();
            break;

        case 'aid':
            ai_debug_script();
            break;

        case 'default':
            default_script();
            break;
    }
});

function default_script () {
    const app = new App(() => {
        if (app.board_container) {
            app.k3d = new K3D(app.board_container);
            app.makeContainerResponsive();
            app.k3d.initSession();
        }
        User.get_login(data => {
            if (data.user) app.redux_store.dispatch(actions.loggUser(data.user, app));
        });
    });

    preact.render(<AppContainer app={app} />, document.getElementById('kerkel-app'));
}

function ai_script () {
    console.log('whoa?');
    const app = new App(() => {
        if (app.board_container) {
            app.disalowed_login = true;
            app.k3d = new K3D(app.board_container);
            app.makeContainerResponsive();
            ai_random_game_init(app);

            console.log('logging in');
            app.redux_store.dispatch(actions.loggUser({
                id: app_utils.random_number(20),
                name: 'user'
            }, app));
        }
    });
    window.app = app;

    preact.render(<AppContainer app={app} />, document.getElementById('kerkel-app'));
}

function many_boards_script () {
    let count = Number(app_utils.get_url_params('count'));
    if (isNaN(count)) count = 2;
    if (count > 10) count = 10;
    const top_container = document.getElementById('kerkel-app');
    const names = ['Alyssa', 'Lindsey', 'Leigh', 'Ginger', 'Sonia', 'Holly', 'Katie', 'Maureen', 'Violet', 'Flora'];

    const apps = [];
    window.apps = apps;
    for (let i=0; i<count; i+=1) {
        const container = document.createElement('DIV');
        top_container.appendChild(container);

        const app = new App(() => {
            if (app.board_container) {
                app.k3d = new K3D(app.board_container);
                app.makeContainerResponsive();
                app.k3d.initSession();
            }

            app.redux_store.dispatch(actions.loggUser({
                id: app_utils.random_number(20),
                name: names[i]
            }, app));
        });
        apps.push(app);
        preact.render(<AppContainer app={app} />, container);
    }
}

function ai_debug_script () {
    const app = new App(() => {
        if (app.board_container) {
            app.disalowed_login = true;
            app.k3d = new K3D(app.board_container);
            app.makeContainerResponsive();

            KerkelAI.initDebugSession(app);
        }
    });

    window.app = app;
    preact.render(<AppContainer app={app} />, document.getElementById('kerkel-app'));
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

function ai_random_game_init (app) {
    const finished = (is_winner) => {
        app.store.right_win.set([{app: app}, <div>
            <div>{is_winner ?
                'Good for you!' :
                'Try next time!'
            }</div>
            <br/>
            <div>
                <a href="#"
                   onClick={() => {
                       app.store.right_win.set(null);
                       commenceGame();
                   }}>
                    <strong>Play again</strong>
                </a>
            </div>
        </div>]);
    };

    const commenceGame = () => {
        let session = null;
        app.k3d.initSession(0, [
            () => {
                const winner = session.tryToDecideWinner();
                if (winner !== null) {
                    finished(0 === winner);
                    return;
                }

                session.allowNextMove();

                setTimeout(random_move.bind(
                    session,
                    (from, to) => session.onOpponentMove(from, to)
                ), 10);
            },
            () => {
                const winner = session.tryToDecideWinner();
                if (winner !== null) {
                    finished(0 === winner);
                    return;
                }

                session.allowNextMove();
            }
        ]);
        session = app.k3d.session;
        session.allowNextMove();
    };

    commenceGame();
}

function random_move (callback) {
    let player = this.on_move;
    let positions = this.k3d.board.positions.filter(position => {
        let stone = position.stones[0];
        if (stone && stone.player === player) return true;
    });

    positions = positions.map(position => {
        let moves = this.k3d.board.possibleMoves(position);
        let res = {
            from: position,
            value: moves.length
        };

        if (moves.length !== 0) {
            res.to = moves[Math.floor(Math.random() * moves.length)];
        }

        return res;
    });

    let winner = positions[0];
    for (let i=1; i<positions.length; i+=1) {
        let p = positions[i];
        if (p.value > winner.value) winner = p;
    }

    if (!winner || !winner.to) throw 'no move possible';
    callback(winner.from.i, winner.to.i);
}