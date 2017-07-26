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
            {left && preact.h(LeftWindow, left.props, left.children)}
            {right && preact.h(RightWindow, {form: right})}
        </div>;
    }

    componentDidMount () {
        const {app} = this.props;

        this.store_unsibscribe = app.redux_store.subscribe(() => {
            const app_state = app.redux_store.getState();
            if (app_state.left_win !== this.state.left ||
                app_state.right_win !== this.state.right)
                this.setState({
                    left: app_state.left_win,
                    right: app_state.right_win
                });
        });
    }

    componentWillUnmount () {
        this.store_unsibscribe();
    }
}