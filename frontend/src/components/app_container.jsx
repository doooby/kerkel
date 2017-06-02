import preact from 'preact';
import Menu from './left_panel/menu';
import UsersList from './left_panel/users_list';
import MessagesList from './left_panel/messages_list';
import ChatInput from './left_panel/chat_input';

import WinsContainer from './wins_container';

export default class AppContainer extends preact.Component {

    render ({app}) {
        return <div
            className="k-app-container k-panel clearfix"
            ref={el => app.app_container = el}
            // style={{height: `${1}px`}}
        >

            <div
                className="k-left-panel">
                <Menu app={app} />
                <UsersList app={app} />
                <MessagesList app={app} />
                <ChatInput app={app} />
            </div>

            <WinsContainer app={app}/>

            <div
                className="k-board-container"
                ref={el => app.board_container = el}>
            </div>

        </div>;
    }

    componentDidMount () {
        this.props.app.onMounted();
    }

}