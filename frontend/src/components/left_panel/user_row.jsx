import preact from 'preact';

export default class UserRow extends preact.Component {

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