import preact from 'preact';

export default class RightWindow extends preact.Component {

    render (ps) {
        let style = {
            width: '150px',
            "min-height": '30px',
            right: 0,
            top: 0
        };

        return <div
            className="k-panel k-window"
            style={style}>
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