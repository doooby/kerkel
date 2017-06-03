import app_utils from './app_utils';

export default class User {

    constructor ({id, name}) {
        this.id = id;
        this.name = name;
        this.status = true;

        this.color = 0xffffff;

        this._on_status_changed = [];
        this['changed'] = () => {
            this._on_status_changed.forEach(clbk => clbk(this));
        }
    }

    onStatusChanged (callback) {
        if (typeof callback !== 'function') throw 'User#onStatusChanged: bad arg';
        this._on_status_changed.push(callback);
    }

    subscribeToActionCable () {
        window.ondra = this;

        const ws = new WebSocket('ws://'+window.location.host+'/ws');

        ws.onopen = function () {
            console.log('connected');
            ws.send(Date.now());
        };

        ws.onclose = function () {
            console.log('disconnected');
        };

        ws.onmessage = function (message) {
            console.log(`Roundtrip time: ${Date.now() - message.data} ms`);

            setTimeout(function timeout() {
                ws.send(Date.now());
            }, 2000);
        };

        ws.onerror = function (error) {
            console.log(error);
        };

        this.ws = ws;





        // this.cable = ActionCable.createConsumer(`/cable?user=${this.id}${this.name}`);
        // this.appSubscription = this.cable.subscriptions.create('AppChannel', {
        //     received: (data) => {
        //         if (data.req_id) this.req_resp_layer.onMessage(data);
        //         else this.onMessage(data);
        //     }
        // });
        // this.req_resp_layer = new ReqRespLayer(this.appSubscription);
    }

    unsubscribeFromActionCable () {
        console.log('unsubscribeFromActionCable');
        // if (this.cable) {
        //     this.cable.disconnect();
        // }
    }

    speak (message) {
        console.log('user.speak', message);
        // this.appSubscription.perform('speak', {msg: message});
    }

    sendMessageTo (user_id, data) {
        data.to = user_id;
        console.log('user.sendMessageTo', data);
        // this.appSubscription.perform('send_to', data);
    }

    onMessage (data) {
        if (data.users) {
            users_changed(this.app.store.present_users, data.users);

        } else if (data.chat && this.onChatMessage) {
            let person = this.app.store.present_users.all()
                .find(u => u.id === data.chat.speak);
            if (person) this.onChatMessage({person, message: data.chat.msg});

        } else if (data.game) {
            this.app.onGameMessage(data);

        }
    }
}

User.get_login = function (clbk) {
    fetch('/recognition', {
        credentials: 'include'
    })
        .then(reponse => reponse.json())
        .then(clbk);
};

User.post_login = function (name, clbk) {
    let data = new FormData();
    data.append('name', name);

    fetch('/login', {
        method: 'POST',
        credentials: 'include',
        body: data
    })
        .then(reponse => reponse.json())
        .then(clbk);
};

User.post_logout = function (clbk) {
    fetch('/logout', {
        method: 'POST',
        credentials: 'include'
    })
        .then(clbk);
};

function users_changed (users_store, users_data) {
    let real_list = users_data.list.map(arr => ({id: arr[1], name: arr[0]}));

    // mark all present users either "still-present" or "in-available"
    users_store.all().forEach(user => {
        let real_list_row = real_list.find(row => row.id === user.id);
        if (real_list_row) {
            let i = real_list.indexOf(real_list_row);
            real_list.splice(i, 1);
        }

        user.status = !!real_list_row;

        if (!user.status) {
            user.changed();
            // set timer to clear him out
        }
    });

    // add new-comers
    users_store.addFromArray(real_list.map(row => {
        let user = new User(row);
        user.color = app_utils.random_color();
        return user;
    }));
}

class ReqRespLayer {

    constructor (sub) {
        this._pile = new Map();
        this.sub = sub;
    }

    request (action, data, callback) {
        let req = new Request(data, callback);
        this._attachRequest(req);
        this.sub.perform(action, req.req_data);
    }

    onMessage (data) {
        let req = this._pile.get(data.req_id);
        if (req) {
            req.clear();
            req.performResponse(data);
        }
    }

    _attachRequest (req) {
        let timeout = setTimeout(() => {
            timeout = null;
            req.clear();
            req.performTimeout();
        }, 5000);

        req.clear = () => {
            if (timeout) clearTimeout(timeout);
            this._pile.delete(req.req_id);
        };

        this._pile.set(req.req_id, req);
    }

}

class Request {

    constructor (data, waiter) {
        this.waiter = waiter;
        this.req_data = data;

        this.req_id = Math.floor(Math.random() * Math.pow(10, 10));
        data.req_id = this.req_id;
    }

    performTimeout () {
        this.fail = 'timeout';
        this.waiter(this);
    }

    performResponse (data) {
        this.resp_data = data;
        this.fail = data.fail;
        this.waiter(this);
    }

}