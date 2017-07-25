import preact from 'preact';

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
        const {opponent} = this.state;
        if (!opponent) return;

        user.sendRequest('game-invite', {opponent: Number(opponent)}, (req) => {
            if (req.fail) this.setState({alert_message: `fail: ${req.fail}`});
            else {
                console.log('success');
            }
        });


        // app.store('logged_user').req_resp_layer.request('invite', {opponent}, (req) => {
        //     if (req.fail) this.setState({alert_message: `fail: ${req.fail}`});
        //     else {
        //         app.store.left_win.close();
        //         opponent = app.store.present_users.find(u => u.id === opponent);
        //         if (opponent) app.commenceGame(req.resp_data.game, opponent, true);
        //     }
        // });

    }
}