import preact from 'preact';

export default class ChatInput extends preact.Component {

    constructor(props) {
        super(props);

        this.onChange = this.onChange.bind(this);
        this.onKeyUp = this.onKeyUp.bind(this);
        this.sendMessage = this.sendMessage.bind(this);
    }

    render ({app, user}, {text}) {
        let style = null;
        if (user) {
            const color = app.utils.color_to_css(user.color);
            style = {color: color, borderColor: color};
        }

        return <div
            className="k-chat-input">
            <button
                className="button tiny"
                style={style}
                onClick={this.sendMessage}>
                &gt;

            </button>
            <input
                type="text"
                value={user && text}
                disabled={!user}
                onChange={this.onChange}
                onKeyUp={this.onKeyUp} />
        </div>;
    }

    onChange (e) {
        this.setState({text: e.target.value});
    }

    onKeyUp (e) {
        if (e.keyCode === 13) this.sendMessage();
    }

    sendMessage () {
        if (!this.state.text || !this.props.user) return;
        this.props.user.speak(this.state.text);
        this.setState({text: null});
    }

}