import preact from 'preact';
import User from '../../../user';
import actions from '../../../actions';

export default class LoginForm extends preact.Component {

    constructor(props) {
        super(props);

        this.onNameChanged = this.onNameChanged.bind(this);
        this.onSubmit = this.onSubmit.bind(this);

        let user = props.app.redux_store.getState().logged_user;
        if (user) this.state.name = user.name;
    }

    render (_, {name, alert_message}) {
        return <div>
            <h4>LOG-IN</h4>

            <div className="form-group">
                <input
                    type="text"
                    className="form-control"
                    placeholder="name"
                    value={name}
                    onChange={this.onNameChanged} />
            </div>

            <div className="form-group">
                <button
                    className="btn btn-primary"
                    onClick={this.onSubmit}>
                    Set
                </button>
            </div>

            {alert_message && <div className="alert alert-danger">{alert_message}</div>}
        </div>
    }

    onNameChanged (e) {
        this.setState({name: e.target.value});
    }

    onSubmit () {
        const {app} = this.props;
        const {name} = this.state;

        this.setState({alert_message: null});
        if (!name) return;

        if (app.disalowed_login) {
            this.setState({alert_message: 'login disallowed for this mode'});
            return;
        }

        User.post_login(name, (data) => {
            if (data.user) {
                app.redux_store.dispatch(actions.loggUser(data.user));
            }
            else if (data.reason) this.setState({alert_message: data.reason});
        });
    }

}