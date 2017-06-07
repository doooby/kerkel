import preact from 'preact';
import actions from '../../ui/actions';

export default class MessagesList extends preact.Component {

    render ({app}, {user, messages}) {
        if (!user) return <div className="k-messages-list _not_connected">
            <span>you must connect<br />to use chat</span>
        </div>;

        let ref = el => this.last = el;
        return <div className="k-messages-list">
            {messages && messages.map( ({person, message}) => <div>
                <span
                    ref={ref}
                    style={{color: app.utils.color_to_css(person.color)}}>
                    {person.name}
                </span>
                {message}
            </div>)}
        </div>;
    }

    componentDidMount () {
        const app = this.props.app;

        this.__user_clear = this.props.app.store('logged_user', (store) => {
            const user = store.get();
            const messages = [];
            this.setState({user: user, messages: messages});

            if (user) {
                    app.redux_store.dispatch(actions.addSystemMessage(`logged in as ${user.name}`));
            }
        });

        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const state = app.redux_store.getState();
            this.setState({messages: state.chat_messages});
        });
    }

    componentDidUpdate () {
        if (this.last) this.last.scrollIntoView();
    }

    componentWillUnmount () {
        this.__user_clear();

        this.store_unsibscribe();
    }

}