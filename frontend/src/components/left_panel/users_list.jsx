import preact from 'preact';
import UserRow from './user_row';
import User from '../../user';

export default class UsersList extends preact.Component {

    constructor(props) {
        super(props);

        this.state.users = props.app.store.present_users.allOthers();
    }

    render ({app}, {users}) {
        return <div className="k-users-list">
            {users.map(user => <UserRow user={user} app={app} />)}
        </div>;
    }

    componentDidMount () {
        this.__users_clear = this.props.app.store('present_users', (store) => {
            this.setState({users: store.allOthers()});
        });

    }

    componentWillUnmount () {
        this.__users_clear();
    }

}