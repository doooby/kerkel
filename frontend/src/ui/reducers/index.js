import User from '../../user';

const init_state = {
    present_users2: new Set(),
    chat_messages: []
};

function kerkelApp (state, action) {
    if (state === undefined) { return init_state; }

    switch (action.type) {
        case 'ADD_MESSAGE':
            return Object.assign({}, state, {
                chat_messages: [...state.chat_messages, action.item]
            });
            break;

        case 'PRESENT_USERS_CHANGE':
            return Object.assign({}, state, {
                present_users2: present_users2(state.present_users2, action.list, state.logged_user)
            });
            break;

        default:
            return state;
            break;

    }
}

function present_users2 (orig_set, new_list, logged_user) {
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