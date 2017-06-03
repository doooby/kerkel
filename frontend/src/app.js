import User from './user';
import Game from './game';

import create_store from './store';
import app_utils from './app_utils';

export default class App {

    constructor (on_mounted) {
        this.utils = app_utils;
        this.onMounted = on_mounted.bind(this);
        const app = this;

        const store = create_store({
            logged_user: ['value', {
                set (user_data) {
                    if (this._value) this._value.unsubscribeFromWs();

                    this._value = new User(user_data);
                    this._value.app = app;
                    this._value.color = app.utils.random_color();

                    store.present_users.clear(this._value);
                    this._value.subscribeToWs();
                    this._changed();
                },

                unset () {
                    if (this._value) this._value.unsubscribeFromWs();

                    this._value = null;
                    this._changed();

                    store.left_win.close();
                    store.present_users.clear();
                    store.game.discard();
                }
            }],

            present_users: ['list', {
                allOthers () {
                    let logged_user = store('logged_user');
                    let all = this.all();
                    return logged_user ?
                        all.filter(u => u.id !== logged_user.id) :
                        all;
                },

                clear (user) {
                    this._list.clear();
                    if (user) this._list.add(user);
                    this._changed();
                }
            }],

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

            right_win: ['value']
        });
        this.store = store;
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
                const challenger = this.store.present_users.find(u => u.id === from);
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
        if (this.__appMessage) this.__appMessage(message);
    }

    makeContainerResponsive () {
        this.makeContainerResponsive._callback = app_utils.throttle(
            this.k3d.onContainerSizeChanged.bind(this.k3d),
            600
        );
        window.addEventListener('resize', this.makeContainerResponsive._callback);
    }

}