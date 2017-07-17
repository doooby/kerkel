import User from './user';
import Game from './game';

import { createStore } from 'redux';
import kerkelApp from './ui/reducers';

import create_store from './store';
import app_utils from './app_utils';
import actions from './ui/actions';

export default class App {

    constructor (on_mounted) {
        this.utils = app_utils;
        this.onMounted = on_mounted.bind(this);
        const app = this;

        const store = create_store({

            left_win: ['value', {
                close () {
                    if (!this._value) return;
                    let [props, ..._] = this._value;
                    props.toClose();
                }
            }],

            game: ['value', {
                discard () {
                    if (this._value) this._value.onDiscard();
                    app.k3d.initSession();
                    this.set(null);
                }
            }],

            logged_user: ['value', {
                set (user_data) {
                    console.log('user set');
                    if (this._value) this._value.unsubscribeFromWs();

                    this._value = new User(user_data);
                    this._value.app = app;
                    this._value.color = app.utils.next_color();

                    app.redux_store.dispatch(actions.usersListChanged([]));
                    this._value.subscribeToWs();
                    this._changed();
                },

                unset () {
                    if (this._value) this._value.unsubscribeFromWs();

                    this._value = null;
                    app.redux_store.dispatch(actions.usersListChanged([]));
                    this._changed();

                    store.left_win.close();
                    store.game.discard();

                }
            }],

            right_win: ['value']
        });
        this.store = store;

        this.redux_store = createStore(kerkelApp);
    }

    logoutUser () {
        const user = this.store('logged_user');
        if (user) User.post_logout(() => {
            this.store.logged_user.unset();
        });
    }

    onGameMessage (data) {
        const from = data.from;
        const message = data.message;
        let game = this.store('game');

        if (game) {
            if (game.opponent.id === from && game.game_id === data.game)
                game.onMessage(message, data);

            else {
                if (['invitation'].includes(message)) {
                    this.store('logged_user').sendMessageTo(from, {
                        game: data.game,
                        message: 'rejection',
                        orig_message: message,
                        reason: 'already in another game'
                    });
                }
            }

        } else {
            if (message === 'invitation' && from) {
                const challenger = this.getUser(from);
                if (challenger) {
                    this.printAppMessage(`invitation from ${challenger.name}`);
                    this.commenceGame(data.game, challenger, false);
                }
            }

        }
    }

    commenceGame (game_id, opponent, local_is_challenger) {
        const game = new Game(this, game_id, opponent);
        if (local_is_challenger) game.prepareAsChallenger();
        else game.prepareAsChallenged();
        this.store.game.set(game);
    }

    printAppMessage (message) {
        this.redux_store.dispatch(actions.addSystemMessage(message));
    }

    makeContainerResponsive () {
        this.makeContainerResponsive._callback = app_utils.throttle(
            this.k3d.onContainerSizeChanged.bind(this.k3d),
            600
        );
        window.addEventListener('resize', this.makeContainerResponsive._callback);
    }

    getUser (id) {
        return Array.from(this.redux_store.getState().present_users2).find(u => u.id === id);
    }

    getAllOtherUsersList () {
        const all = Array.from(this.redux_store.getState().present_users2);
        const current = this.store('logged_user');
        return current ? all.filter(u => u.id !== current.id) : all;
    }

}