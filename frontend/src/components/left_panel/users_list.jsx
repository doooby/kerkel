import preact from 'preact';

export default class UsersList extends preact.Component {

    constructor(props) {
        super(props);
        this.state.users = [];
    }

    render ({app}, {users}) {
        return <div className="k-users-list">
            {users.map(user => <UserRow user={user} app={app} />)}
        </div>;
    }

    componentDidMount () {
        const {app} = this.props;
        let users_was = null;

        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const state = app.redux_store.getState();
            if (users_was !== state.present_users) {
                users_was = state.present_users;
                this.setState({users: app.getAllOtherUsersList(state)});
            }
        });
    }

    componentWillUnmount () {
        this.store_unsibscribe();
    }

}

class UserRow extends preact.Component {

    constructor(props) {
        super(props);

        this.state.status = this.props.user.status;
        this.props.user.onStatusChanged( user => {
            this.setState({status: user.status});
        });
    }

    render ({app, user}, {status}) {
        return <div className="k-user">
            <span className={app.utils.css('_status', (status && '_online'))}>&nbsp;</span>
            <span className="_name" style={{color: app.utils.color_to_css(user.color)}}>{user.name}</span>
        </div>;
    }

}