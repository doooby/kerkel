import User from '../user';

const actions = {

    addUserMessage: function (message, person) {
        return {type: 'ADD_MESSAGE', item: {message, person}};
    },

    addSystemMessage: function (message) {
        return {type: 'ADD_MESSAGE', item: {message, person: system_person}};
    },

    usersListChanged: function (list) {
        return {type: 'PRESENT_USERS_CHANGE', list: list};
    },

    loggUser: function (user_data, app) {
        const user = new User(user_data);
        user.app = app;
        user.assignNewColor();
        return {type: 'SET_USER', user};
    },

    unloggUser: function () {
        return {type: 'SET_USER', user: null};
    },

    closeLeftWin: function () {
        return {type: 'SET_LEFT_WIN', win: null};
    },

    openLeftWin: function (id, props, children) {
        return {type: 'SET_LEFT_WIN', win: {id, props, children}};
    },



};

const system_person = {name: '>>', color: 0xffffff};

export default actions;