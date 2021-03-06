import preact from 'preact';

export default class UsersList extends preact.Component {

    constructor(props) {
        super(props);
        this.state.users = [];
    }

    render({app}, {users}) {
        return <div className="k-users-list">
            {users.map(user => <div className="k-user">
                <span className={app.utils.css('_status', (user.status && '_online'))}>&nbsp;</span>
                <span className="_name" style={{color: app.utils.color_to_css(user.color)}}>{user.name}</span>
            </div>)}
        </div>;
    }

    componentDidMount() {
        const {app} = this.props;

        let users_was = null;
        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const app_state = app.redux_store.getState();
            if (users_was !== app_state.present_users) {
                users_was = app_state.present_users;
                this.setState({users: app.getAllOtherUsersList(app_state)});
            }
        });
    }

    componentWillUnmount() {
        this.store_unsibscribe();
    }

}