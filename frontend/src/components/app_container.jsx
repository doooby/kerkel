import preact from 'preact';
import Menu from './left_panel/menu';
import UsersList from './left_panel/users_list';
import MessagesList from './left_panel/messages_list';
import ChatInput from './left_panel/chat_input';

import WinsContainer from './wins_container';

export default class AppContainer extends preact.Component {

    render ({app}, {user}) {
        return <div
            className="k-app-container k-panel"
            ref={el => app.app_container = el}
        >

            <div
                className="k-left-panel">
                <Menu app={app} user={user}/>
                <UsersList app={app} />
                <MessagesList app={app} user={user}/>
                <ChatInput app={app} user={user}/>
            </div>

            <div className="k-content">
                <WinsContainer app={app}/>

                <div
                    className="k-board-container"
                    ref={el => app.board_container = el}>
                </div>
            </div>

        </div>;
    }

    componentDidMount () {
        const {app} = this.props;

        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const app_state = app.redux_store.getState();
            if (app_state.logged_user !== this.state.user)
                this.setState({user: app_state.logged_user});
        });

        this.props.app.onMounted();
    }

    componentWillUnmount () {
        this.store_unsibscribe();
    }

}