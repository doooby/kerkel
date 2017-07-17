import preact from 'preact';
import actions from '../../actions';

export default class LeftWindow extends preact.Component {

    constructor (props) {
        super(props);

        this.toClose = () => props.app.redux_store.dispatch(actions.closeLeftWin());
    }

    render ({children}) {
        let style = {
            width: '150px',
            "min-height": '100px',
            left: '0',
            top: 0
        };

        return <div
            className="k-panel k-window"
            style={style}>
            <button
                className="k-window-close"
                onClick={this.toClose}>
                <span>&times;</span>
            </button>
            {children}
        </div>;
    }

}