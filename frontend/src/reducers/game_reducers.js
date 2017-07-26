import PendingGameForm from '../components/wins/forms/pending_game_form';
import App from '../app';


function game (state, action) {
    const game = action.game, changes = {game};

    if (game === 'abandoned' && state.game) {
        changes.game = null;
        changes.right_win = null;
        if (state.game.state !== 'pending') add_message(state, changes, 'game abandoned');

    }
    else if (game.state === 'pending') {
        if (state.game && state.game !== game) return state;

        if (game.host) changes.left_win = null;
        changes.right_win = [PendingGameForm, {game}];

    }

    return Object.assign({}, state, changes);
}

export default game;

function add_message (state, changes, message) {
    changes.chat_messages = [
        ...state.chat_messages,
        App.createMessage(message)
    ];
}