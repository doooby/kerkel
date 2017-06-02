import preact from 'preact';

export default class MessagesList extends preact.Component {

    render ({app}, st) {
        if (!st.user) return <div className="k-messages-list _not_connected">
            <span>you must connect<br />to use chat</span>
        </div>;

        let ref = el => this.last = el;
        return <div className="k-messages-list">
            {st.messages && st.messages.map( ({person, message}) => <div>
                <span
                    ref={ref}
                    style={{color: app.utils.color_to_css(person.color)}}>
                    {person.name}
                </span>
                {message}
            </div>)}
        </div>;
    }

    addMessage (data) {
        let messages = this.state.messages || [];
        messages.push(data);
        this.setState({messages: messages}, () => {
            if (this.last) this.last.scrollIntoView();
        });
    }

    componentDidMount () {
        this.__user_clear = this.props.app.store('logged_user', (store) => {
            const user = store.get();
            const messages = [];

            if (user) {
                user.onChatMessage = (data) => this.addMessage(data);
                messages.push(system_message_data(`logged in as ${user.name}`));
            }

            this.setState({user: user, messages: messages});
        });

        this.props.app.__appMessage = (message) => this.addMessage(system_message_data(message));
    }

    componentWillUnmount () {
        this.__user_clear();

        this.props.app.__appMessage = null;
    }

}

function system_message_data (message) {
    return {
        message: message,
        person: {name: '>>', color: 0xffffff}
    };
}