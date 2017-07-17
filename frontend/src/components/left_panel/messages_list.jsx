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
        const {app} = this.props;

        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const state = app.redux_store.getState();

            if (state.logged_user !== this.state.logged_user ||
                state.chat_messages !== this.state.messages)
                this.setState({
                    user: state.logged_user,
                    messages: state.chat_messages
                });
        });
    }

    componentDidUpdate () {
        if (this.last) this.last.scrollIntoView();
    }

    componentWillUnmount () {
        this.store_unsibscribe();
    }

}