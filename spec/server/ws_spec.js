const ws_app_handler = require('../../routes/web_socket');

function wsCtx (orig_sender) {
    if (typeof orig_sender !== 'function') orig_sender = () => {};
    const ctx = new ws_app_handler.Context({send: orig_sender});
    spyOn(ctx.ws, 'send');
    return ctx;
}

function sendMessage(ctx, msg) {
    ws_app_handler.on_message.call(ctx, msg);
}

function message ($, data) {
    if (typeof data !== 'object') data = {};
    data['$'] = $;
    return data;
}

function responses(context) {
    return context.ws.send.calls.allArgs().map(args => JSON.parse(args[0]));
}

describe('messages', () => {

    let context;

    beforeEach(() => {
        context = wsCtx();
    });

    it('$: ping', () => {
        sendMessage(context, message('ping', {d: 'kkk'}));
        expect(responses(context)).toEqual([
            message('pong', {d: 'kkk'})
        ]);
    });

});