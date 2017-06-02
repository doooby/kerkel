

export default function create_store (defs) {
    let data = create_datastore(defs);

    let getter = function (value_name, arg1) {
        switch (typeof arg1) {
            case 'function':
                return build_subscription(data[value_name], arg1);
                break;

            default:
                return data[value_name].get();
                break;
        }
    };

    Object.assign(getter, data);
    return getter;
}

function create_datastore (defs) {
    let stores = {};
    Object.keys(defs).forEach(value_name => {
        let definition = defs[value_name];
        let type, mixin;

        if (typeof definition === 'string') {
            type = definition;

        } else {
            [type, mixin] = defs[value_name];
        }

        let base = TYPES[type]();
        stores[value_name] = (mixin ?
                Object.assign(base, mixin) :
                base
        );
    });
    return stores;
}

function build_subscription (store, subscription) {
    store.subscribe(subscription);
    return () => store.unsubscribe(subscription);
}

const TYPES = {};

function subscription_mixin () {
    return {
        _subs: new Set(),
        _changed () { this._subs.forEach(clbk => clbk(this)) },
        subscribe (clbk) { this._subs.add(clbk); },
        unsubscribe (clbk) { this._subs.delete(clbk); }
    };
}

function create_value_store () {
    return Object.assign({
        _value: null,

        get () { return this._value; },
        set (value) {
            this._value = value;
            this._changed();
        }
    }, subscription_mixin());
}
TYPES['value'] = create_value_store;

function create_list_store () {
    return Object.assign({
        _list: new Set(),

        all () { return Array.from(this._list); },
        find (f) { return this.all().find(f); },
        filter (f) { return this.all().filter(f); },
        swap (new_list) {
            this._list = new_list;
            this._changed();
        },
        addFromArray (arr) {
            arr.forEach(row => this._list.add(row));
            this._changed();
        },
        clear () {
            this._list.clear();
            this._changed();
        }
    }, subscription_mixin());
}
TYPES['list'] = create_list_store;