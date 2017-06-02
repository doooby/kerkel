import preact from 'preact';
import User from '../../../user';

export default class LoginForm extends preact.Component {

    constructor(props) {
        super(props);

        this.onNameChanged = this.onNameChanged.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        let user = props.app.store('logged_user');
        if (user) this.state.name = user.name;
    }

    render (_, {name, callout_text}) {
        return <form action="javascript:" method="post" onSubmit={this.onSubmit}>
            <input
                type="text"
                placeholder="name"
                value={name}
                onChange={this.onNameChanged} />
            <input type="submit" value="set this name" className="button" />
            {callout_text && <div className="callout alert">{callout_text}</div>}
        </form>
    }

    onNameChanged (e) {
        this.setState({name: e.target.value});
    }

    onSubmit () {
        this.setState({callout_text: null});
        if (!this.state.name) return;

        if (this.props.app.disalowed_login) {
            this.setState({callout_text: 'login disallowed for this mode'});
            return;
        }

        User.post_login(this.state.name, (data) => {
            if (data.user) {
                this.props.app.store.left_win.close();
                this.props.app.store.logged_user.set(data.user);
            }
            else if (data.reason) this.setState({callout_text: data.reason});
        });
    }

}