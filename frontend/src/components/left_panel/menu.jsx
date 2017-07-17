import preact from 'preact';
import LoginForm from '../wins/forms/login_form';
import NewMatchForm from '../wins/forms/new_match_form';

import actions from '../../ui/actions';

export default class Menu extends preact.Component {

    constructor(props) {
        super(props);
        this.state = {
            window: null
        };

        this.toggleSetNameWin = this.toggleSetNameWin.bind(this);
        this.toggleMatchWin = this.toggleMatchWin.bind(this);
        this.toggleAboutWin = this.toggleAboutWin.bind(this);
    }

    render ({app}, st) {
        return <div className="k-menu">

            <button
                className="btn btn-primary btn-sm"
                onClick={this.toggleSetNameWin}>
                Set<br/>Name
            </button>

            <button
                className="btn btn-primary btn-sm"
                onClick={this.toggleMatchWin}>
                Game
            </button>

            <button
                className="btn btn-primary btn-sm"
                onClick={this.toggleAboutWin}>
                About
            </button>

        </div>;
    }

    toggleSetNameWin () {
        const {app} = this.props;
        const app_state = app.redux_store.getState();
        if (app_state.left_win && app_state.left_win.id === 'set_name') {
            app.redux_store.dispatch(actions.closeLeftWin());
            return;
        }

        app.redux_store.dispatch(actions.openLeftWin(
            'set_name',
            {
                app
            },
            [
                <LoginForm app={app}/>
            ]
        ));
    }

    toggleMatchWin () {
        const {app, user} = this.props;
        const app_state = app.redux_store.getState();
        if (app_state.left_win && app_state.left_win.id === 'game') {
            app.redux_store.dispatch(actions.closeLeftWin());
            return;
        }

        if (!user) return;
        if (app.k3d.session === null) return;

        let children;
        // if (game) {
        //     children = [
        //         <button
        //             type="button"
        //             className="button"
        //             onClick={() => {
        //                 game.onLocalPlayerResigned();
        //                 this.closeOpenedWindow();
        //             }}>
        //             Resign
        //         </button>
        //     ];
        //
        // } else {
            const present_users = app.getAllOtherUsersList(app_state)
                .filter(u => u.status);
            children = [
                <NewMatchForm
                    app={app}
                    users={present_users}/>
            ];

        // }

        app.redux_store.dispatch(actions.openLeftWin(
            'game',
            {
                app
            },
            children
        ));
    }

    toggleAboutWin () {
        const {app} = this.props;
        const app_state = app.redux_store.getState();
        if (app_state.left_win && app_state.left_win.id === 'about') {
            app.redux_store.dispatch(actions.closeLeftWin());
            return;
        }

        app.redux_store.dispatch(actions.openLeftWin(
            'about',
            {
                app
            },
            [
                <h4>KERKEL</h4>,
                <p>
                    Is an awesome tactical game that can be somewhat compared to checkers.
                    Rules are simple: each player can move with only one stone per turn,
                    "eating" opponent's stone(s) should there be any on the position he moved to;
                    or converting no man's stones to obtain more mass.
                    The objective is to stand on the opponent's base position (the circled one).
                </p>,
                <a href="https://github.com/doooby/kerkel_v2" target="_blank">go to github &#x279a;</a>
            ]
        ));
    }

}