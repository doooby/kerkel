import User from '../../user';
import actions from '../actions'

const init_state = {
    logged_user: null,
    present_users: new Set(),
    chat_messages: [],
    left_win: null
};

function kerkelApp (state, action) {
    if (state === undefined) { return init_state; }

    switch (action.type) {
        case 'SET_USER':
            const user = action.user;
            const changes = {
                logged_user: user,
                present_users: new Set(),
                left_win: null
            };

            if (state.logged_user) state.logged_user.unsubscribeFromWs();
            if (user) {
                user.subscribeToWs();

                changes.chat_messages = [
                    ...state.chat_messages,
                    actions.addSystemMessage(`logged in as ${user.name}`).item
                ];
            }

            return Object.assign({}, state, changes);
            break;

        case 'ADD_MESSAGE':
            return Object.assign({}, state, {
                chat_messages: [...state.chat_messages, action.item]
            });
            break;

        case 'PRESENT_USERS_CHANGE':
            const users = present_users(state.present_users, action.list, state.logged_user);
            return Object.assign({}, state, {
                present_users: users
            });
            break;

        case 'SET_LEFT_WIN':
            return Object.assign({}, state, {
                left_win: action.win
            });
            break;

        default:
            return state;
            break;

    }
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