import classnames from 'classnames';
import goldenColors from 'golden-colors';

const app_utils = {

    debug_using_global_variable (object, attr_name) {
        self[attr_name] = object;
        console.log(`DEBUG ['${attr_name}'] set to`, object);
    },

    random_color () {
        let color = goldenColors.getHsvGolden(1, 1);
        color = `${color.r.toString(16)}${color.g.toString(16)}${color.b.toString(16)}`;
        color = parseInt(color, 16);
        return color;
    },

    random_number (size) {
        return Math.floor(Math.random()*Math.pow(10, size));
    },

    get_url_params (name) {
        let params = location.search.substr(1).split("&").map(str => str.split('='));
        let hit = params.find(param => param[0] === name);
        if (hit) return hit[1];
    },

    css: classnames,

    color_to_css (value) {
        let hex = `000000${value.toString(16)}`;
        hex = hex.substr(hex.length - 6);
        return `#${hex}`;
    },

    throttle: function (callback, time, immediate) {
        let timeout = null, call_at_end, context, args;

        return function () {
            context = this;
            args = arguments;

            // throttling block
            if (timeout) {
                call_at_end = true;
                return;
            }

            // throttler - fire only if there was event in the mean-time
            const timeout_f = () => {
                timeout = null;
                if (call_at_end) {
                    call_at_end = false;
                    timeout = setTimeout(timeout_f, time);
                    callback.apply(context, args);
                }
            };

            call_at_end = true;
            if (immediate) timeout_f();
            else timeout = setTimeout(timeout_f, time);
        };
    }

};

export default app_utils;