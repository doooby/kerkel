import preact from 'preact';
import actions from '../../../actions';

export default class NewMatchForm extends preact.Component {

    constructor(props) {
        super(props);

        this.onOpponentSelected = this.onOpponentSelected.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    render ({app, users}, {opponent, alert_message}) {
        return <div>
            <h4>MATCH</h4>

            <div className="form-group">
                <select
                    className="form-control"
                    value={opponent}
                    onChange={this.onOpponentSelected}>
                    {users.map(u => <option value={u.id}>{u.name}</option>)}
                </select>
            </div>

            <div className="form-group">
                <button
                    className="btn btn-primary"
                    onClick={this.onSubmit}>
                    Send invitation
                </button>
            </div>

            {alert_message && <div className="alert alert-danger">{alert_message}</div>}
        </div>;
    }

    onOpponentSelected (e) {
        this.setState({opponent: e.target.value});
    }

    onSubmit () {
        this.setState({alert_message: null});

        const {app, user} = this.props;
        const opponent  = Number(this.state.opponent);
        if (!opponent) return;


        user.sendRequest('game_invitation', {opponent: opponent}, (req) => {
            if (req.fail) this.setState({alert_message: `fail: ${req.fail}`});
            else {
                const action = actions.gamePending(app, opponent, true);
                if (action) app.redux_store.dispatch(action);
            }
        });
    }
}