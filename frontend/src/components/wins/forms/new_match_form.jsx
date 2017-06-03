import preact from 'preact';

export default class NewMatchForm extends preact.Component {

    constructor(props) {
        super(props);

        this.onOpponentSelected = this.onOpponentSelected.bind(this);
        this.onSubmit = this.onSubmit.bind(this);
    }

    render ({app}, {opponent, callout_text}) {
        return <form action="javascript:" method="post" onSubmit={this.onSubmit}>
            <select
                value={opponent}
                onChange={this.onOpponentSelected}>
                {app.store.present_users.allOthers().filter(u => u.status)
                    .map(u => <option value={u.id}>{u.name}</option>)
                }
            </select>
            <input type="submit" value="invite opponent" className="button" />
            {callout_text && <div className="callout alert">{callout_text}</div>}
        </form>;
    }

    onOpponentSelected (e) {
        this.setState({opponent: e.target.value});
    }

    onSubmit () {
        this.setState({callout_text: null});
        if (!this.state.opponent) return;
        let opponent = this.state.opponent, app = this.props.app;

        console.log('new_match_form.onSubmit');
        // app.store('logged_user').req_resp_layer.request('invite', {opponent}, (req) => {
        //     if (req.fail) this.setState({callout_text: `fail: ${req.fail}`});
        //     else {
        //         app.store.left_win.close();
        //         opponent = app.store.present_users.find(u => u.id === opponent);
        //         if (opponent) app.commenceGame(req.resp_data.game, opponent, true);
        //     }
        // });

    }
}