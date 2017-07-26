import User from './user';
import Game from './game';

import { createStore } from 'redux';
import kerkelApp from './reducers';

import create_store from './store';
import app_utils from './app_utils';
import actions from './actions';

export default class App {

    constructor (on_mounted) {
        this.utils = app_utils;
        this.onMounted = on_mounted.bind(this);
        this.redux_store = createStore(kerkelApp);

        this.redux_store.subscribe(() => {
            console.log(this.redux_store.getState());
        });

        const app = this;
        const store = create_store({
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
        this.klass = App;
    }

    // logoutUser () {
    //     const user = this.store('logged_user');
    //     if (user) User.post_logout(() => {
    //         this.redux_store.dispatch(actions.unloggUser());
    //     });
    // }

    // onGameMessage (data) {
    //     const from = data.from;
    //     const message = data.message;
    //     const state = this.redux_store.getState();
    //     let game = this.store('game');
    //
    //     if (game) {
    //         if (game.opponent.id === from && game.game_id === data.game)
    //             game.onMessage(message, data);
    //
    //         else {
    //             if (['invitation'].includes(message)) {
    //                 state.logged_user.sendMessageTo(from, {
    //                     game: data.game,
    //                     message: 'rejection',
    //                     orig_message: message,
    //                     reason: 'already in another game'
    //                 });
    //             }
    //         }
    //
    //     } else {
    //         if (message === 'invitation' && from) {
    //             const challenger = this.getUser(from);
    //             if (challenger) {
    //                 this.printAppMessage(`invitation from ${challenger.name}`);
    //                 this.commenceGame(data.game, challenger, false);
    //             }
    //         }
    //
    //     }
    // }

    // commenceGame (game_id, opponent, local_is_challenger) {
    //     const game = new Game(this, game_id, opponent);
    //     if (local_is_challenger) game.prepareAsChallenger();
    //     else game.prepareAsChallenged();
    //     this.store.game.set(game);
    // }

    // printAppMessage (message) {
    //     message = App.createMessage(message);
    //     this.redux_store.dispatch(actions.addMessage(message));
    // }

    makeContainerResponsive () {
        this.makeContainerResponsive._callback = app_utils.throttle(
            this.k3d.onContainerSizeChanged.bind(this.k3d),
            600
        );
        window.addEventListener('resize', this.makeContainerResponsive._callback);
    }

    getState () {
        return this.redux_store.getState();
    }

    getUser (id, state=this.getState()) {
        return Array.from(state.present_users).find(u => u.id === id);
    }

    getAllOtherUsersList (state=this.getState()) {
        const all = Array.from(state.present_users);
        const current = state.logged_user;
        return current ? all.filter(u => u.id !== current.id) : all;
    }

}

const system_person = {name: '>>', color: 0xffffff};
App.createMessage = function (message, person) {
    if (!person) person = system_person;
    return {message, person};
};