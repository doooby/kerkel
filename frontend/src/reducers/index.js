import User from '../user';
import game from './game_reducers';
import App from '../app';

const init_state = {
    logged_user: null,
    present_users: new Set(),
    chat_messages: [],
    left_win: null,
    game: null,
    right_win: null
};

function kerkelApp (state, action) {
    if (state === undefined) { return init_state; }
    const changes = {};

    switch (action.type) {
        case 'SET_USER':
            changes.logged_user = action.user;
            changes.present_users = new Set();
            changes.left_win = null;

            if (state.logged_user) state.logged_user.unsubscribeFromWs();
            if (action.user) {
                action.user.subscribeToWs();

                changes.chat_messages = [
                    ...state.chat_messages,
                    App.createMessage(`logged in as ${action.user.name}`)
                ];
            }
            break;

        case 'ADD_MESSAGE':
            changes.chat_messages = [...state.chat_messages, action.item];
            break;

        case 'PRESENT_USERS_CHANGE':
            changes.present_users = present_users(state.present_users, action.list, state.logged_user);
            break;

        case 'SET_LEFT_WIN':
            changes.left_win = action.win;
            break;

        case 'GAME':
            return (game(state, action));
            break;

        default:
            return state;
            break;

    }

    return Object.assign({}, state, changes);
}

function present_users (orig_set, new_list, logged_user) {
    const new_set = new Set(orig_set);
    const former_array = Array.from(new_set);
    const former_ids = former_array.map(u => u.id);
    const present_ids = new_list.map(u => u.id);

    // update all users' status
    former_array.forEach(user => {
        // TODO after some time, if still not connected, remove him
        user.status = present_ids.includes(user.id);
    });

    // add new-comers
    new_list.filter(u => !former_ids.includes(u.id)).forEach(new_user => {
        if (logged_user && logged_user.id === new_user.id) new_set.add(logged_user);
        else {
            const user = new User(new_user);
            user.assignNewColor();
            new_set.add(user);
        }
    });

    return new_set;
}

export default kerkelApp;