import preact from 'preact';

export default class LeftWindow extends preact.Component {

    render (ps) {
        let style = {
            width: '150px',
            "min-height": '100px',
            left: '140px',
            top: 0
        };

        return <div
            className="k-panel k-window"
            style={style}>
            <button
                className="k-window-close"
                onClick={ps.toClose}>
                <span>&times;</span>
            </button>
            {ps.children}
        </div>;
    }

    componentDidMount () {
        if (this.props.onMounted) this.props.onMounted.call(this);
    }

    componentWillUnmount () {
        if (this.props.onUnmounting) this.props.onUnmounting.call(this);
    }

}