import classnames from 'classnames';
import color_convert from 'color-convert';

function color_generator (step_base, step_dist, step_count_dist, s, l) {
    let h = Math.floor(359 * Math.random());
    s = Math.floor(s * 100);
    l = Math.floor(l * 100);

    return function () {
        const step = step_base * (1 + (Math.random() * step_dist * 2) - step_dist);
        const count_dist = 1 + Math.floor(Math.random() * step_count_dist);
        h += Math.floor(step * count_dist);

        while (h > 360) h -= 360;
        const rgb = color_convert.hsl.rgb(h, s, l);
        const color = `${rgb[0].toString(16)}${rgb[1].toString(16)}${rgb[2].toString(16)}`;
        return parseInt(color, 16);
    };
}

const app_utils = {

    debug_using_global_variable (object, attr_name) {
        self[attr_name] = object;
        console.log(`DEBUG ['${attr_name}'] set to`, object);
    },

    next_color:  color_generator(151, 0.1, 2, 0.9, 0.6),

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