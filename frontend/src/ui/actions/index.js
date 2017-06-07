
const actions = {

    addUserMessage: function (message, person) {
        return {type: 'ADD_MESSAGE', item: {message, person}};
    },

    addSystemMessage: function (message) {
        return {type: 'ADD_MESSAGE', item: {message, person: system_person}};
    }

};

const system_person = {name: '>>', color: 0xffffff};

export default actions;