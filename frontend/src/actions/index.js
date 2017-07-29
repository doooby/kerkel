import User from '../user';
import Game from '../game';

const actions = {

    addMessage: function (message) {
        return {type: 'ADD_MESSAGE', item: message};
    },

    usersListChanged: function (list) {
        return {type: 'PRESENT_USERS_CHANGE', list: list};
    },

    logUser: function (user_data, app) {
        const user = new User(user_data);
        user.app = app;
        user.assignNewColor();
        return {type: 'SET_USER', user};
    },

    unlogUser: function () {
        return {type: 'SET_USER', user: null};
    },

    closeLeftWin: function () {
        return {type: 'SET_LEFT_WIN', win: null};
    },

    openLeftWin: function (id, props, children) {
        return {type: 'SET_LEFT_WIN', win: {id, props, children}};
    },

    gamePending: function (app, opponent_id, host_is_local) {
        const state = app.getState();
        const opponent = opponent_id && app.getUser(opponent_id, state);
        if (!opponent) return;

        const game = new Game(
            (host_is_local ? state.logged_user : opponent),
            (host_is_local ? opponent : state.logged_user),
            host_is_local
            );
        return {type: 'GAME', game};
    },

    gameAbandoned: function () {
        return {type: 'GAME', game: 'abandoned'};
    }

};

export default actions;