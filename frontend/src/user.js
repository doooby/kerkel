import app_utils from './app_utils';

import actions from './actions';

export default class User {

    constructor ({id, name}) {
        this.id = Number(id);
        this.name = name;
        this.status = true;

        this.color = 0xffffff;

        this._on_status_changed = [];
        this['changed'] = () => {
            this._on_status_changed.forEach(clbk => clbk(this));
        }
    }

    assignNewColor () {
        this.color = app_utils.next_color();
    }

    onStatusChanged (callback) {
        if (typeof callback !== 'function') throw 'User#onStatusChanged: bad arg';
        this._on_status_changed.push(callback);
    }

    subscribeToWs () {
        const ws = new WebSocket('ws://'+window.location.host+'/ws');

        // const pinger = function () {
        //     ws.send(JSON.stringify({'$': 'ping', d: Date.now()}));
        // };

        ws.onopen = () => {
            // pinger();
            // this.pinger_interval = setInterval(pinger, 10000);

            ws.send(JSON.stringify({
                '$': 'in',
                user: {id: this.id, name: this.name}
            }));
        };

        ws.onclose = () => {
            if (this.ws === ws) this.ws = null;

            // if (this.pinger_interval) {
            //     clearInterval(this.pinger_interval);
            //     this.pinger_interval = null;
            // }

            console.log('disconnected');
        };

        ws.onmessage = e => {
            let data = null;
            try { data = JSON.parse(e.data); } catch (e) {}
            if (data === null) return;

            switch (data['$']) {
                case 'pong':
                    const ping = (Date.now() - data.d);
                    console.log(`ping-pong: ${ping} ms`);
                    break;

                default:
                    this.onMessage(data);
                    break;
            }

            // console.log(`Roundtrip time: ${Date.now() - message.data} ms`);

            // setTimeout(function timeout() {
            //     ws.send(Date.now());
            // }, 2000);
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

    unsubscribeFromWs () {
        if (this.ws) {
            this.ws.close();
            this.ws = null;
        }
    }

    speak (message) {
        if (this.ws) {
            this.ws.send(JSON.stringify({'$': 'speak', t: message}));
            app.redux_store.dispatch(actions.addUserMessage(message, this));
        }
    }

    sendMessageTo (user_id, data) {
        data.to = user_id;
        console.log('user.sendMessageTo', data);
        // this.appSubscription.perform('send_to', data);
    }

    onMessage (data) {
        // console.log(data);
        switch(data['$']) {
            case 'present_users':
                const users_list = data.users.map(arr => ({id: arr[0], name: arr[1]}));
                this.app.redux_store.dispatch(actions.usersListChanged(users_list));
                break;

            case 'speak':
                const person = this.app.getUser(data.u);
                if (person) this.app.redux_store.dispatch(actions.addUserMessage(data.t, person));
                break;
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

        this.req_id = app_utils.random_number(10);
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