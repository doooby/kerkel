import preact from 'preact';
import LeftWindow from './wins/left_window';
import RightWindow from './wins/right_window';

export default class WinsContainer extends preact.Component {

    constructor (props) {
        super(props);

        this.state.left = null;
        this.state.right = null;
    }

    render ({app}, {left, right}) {
        return <div className="k-wins-container">
            {left !== null && preact.h(LeftWindow, ...left)}
            {right !== null && preact.h(RightWindow, ...right)}
        </div>;
    }

    componentDidMount () {
        this.__left_win_clear = this.props.app.store('left_win', (store) => {
            if (this.state.left !== null) {
                let [win_props, ..._] = this.state.left;
                win_props.onClosed();
            }
            this.setState({left: store.get()});
        });
        this.__right_win_clear = this.props.app.store('right_win', (store) => {
            this.setState({right: store.get()});
        });
    }

    componentWillUnmount () {
        this.__left_win_clear();
        this.__right_win_clear();
    }
}