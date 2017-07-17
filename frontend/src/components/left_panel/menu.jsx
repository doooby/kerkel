import preact from 'preact';
import LoginForm from '../wins/forms/login_form';
import NewMatchForm from '../wins/forms/new_match_form';

export default class Menu extends preact.Component {

    constructor(props) {
        super(props);
        this.state = {
            window: null
        };

        this.toggleSetNameWin = this.toggleSetNameWin.bind(this);
        this.toggleMatchWin = this.toggleMatchWin.bind(this);
        this.toggleAboutWin = this.toggleAboutWin.bind(this);
        this.closeOpenedWindow = this.closeOpenedWindow.bind(this);
    }

    render ({app}, st) {
        return <div className="k-menu">

            <button
                className="button tiny"
                onClick={this.toggleSetNameWin}>
                Set<br/>Name
            </button>

            <button
                className="button tiny"
                onClick={this.toggleMatchWin}>
                Game
            </button>

            <button
                className="button tiny"
                onClick={this.toggleAboutWin}>
                About
            </button>

        </div>;
    }

    toggleSetNameWin () {
        if (this.closeOpenedWindow() === 'set_name') return;

        let children = [
            <LoginForm
                app={this.props.app}/>
        ];

        this.openWindow({
                winId: 'set_name',
                onClosed () {}
            },
            children
        );
    }

    toggleMatchWin () {
        const {app} = this.props;
        const state = app.redux_store.getState();

        if (this.closeOpenedWindow() === 'game') return;
        if (state.logged_user === null) return;
        if (app.k3d.session === null) return;

        let children;
        const game = app.store('game');

        if (game) {
            children = [
                <button
                    type="button"
                    className="button"
                    onClick={() => {
                        game.onLocalPlayerResigned();
                        this.closeOpenedWindow();
                    }}>
                    Resign
                </button>
            ];

        } else {
            const present_users = app.getAllOtherUsersList().filter(u => u.status);
            children = [
                <NewMatchForm
                    app={app}
                    users={present_users}/>
            ];

        }

        this.openWindow({
                winId: 'game',
                onClosed () {}
            },
            children
        );
    }

    toggleAboutWin () {
        if (this.closeOpenedWindow() === 'about') return;

        let children = [
            <h4>KERKEL</h4>,
            <p>
                Is an awesome tactical game that can be somewhat compared to checkers.
                Rules are simple: each player can move with only one stone per turn,
                "eating" opponent's stone(s) should there be any on the position he moved to;
                or converting no man's stones to obtain more mass.
                The objective is to stand on the opponent's base position (the circled one).
            </p>,
            <a href="https://github.com/doooby/kerkel_v2" target="_blank">go to github &#x279a;</a>
        ];

        this.openWindow({
                winId: 'about',
                onClosed () {}
            },
            children
        );
    }

    openWindow (props, children) {
        props.app = this.props.app;
        props.toClose = this.closeOpenedWindow.bind(this);
        this.props.app.store.left_win.set([props, children]);
    }

    closeOpenedWindow () {
        let left_win = this.props.app.store('left_win');
        if (left_win !== null) {
            let [props, ..._] = left_win;
            this.props.app.store.left_win.set(null);
            return props.winId;
        }
    }

}