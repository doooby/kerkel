

const init_state = {
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

        default:
            return state;
            break;

    }
}

export default kerkelApp;