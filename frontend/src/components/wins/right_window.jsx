import preact from 'preact';

export default class RightWindow extends preact.Component {

    render ({form}) {
        const [form_klass, form_props] = form;
        let style = {
            width: '200px',
            'min-height': '30px',
            right: 0,
            top: 0
        };

        return <div
            className="k-panel k-window"
            style={style}>
            {preact.h(form_klass, form_props)}
        </div>;
    }

    // componentDidMount () {
    //     if (this.props.onMounted) this.props.onMounted.call(this);
    // }
    //
    // componentWillUnmount () {
    //     if (this.props.onUnmounting) this.props.onUnmounting.call(this);
    // }

}