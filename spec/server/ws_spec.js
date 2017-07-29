const ws_app_handler = require('../../routes/web_socket');
const users = ws_app_handler.PRESENT_USERS;

function wsCtx () {
    const ctx = new ws_app_handler.Context({send: () => {}});
    spyOn(ctx.ws, 'send');
    return ctx;
}

function sendMessage(ctx, msg) {
    ws_app_handler.on_message.call(ctx, msg);
}

function message ($, data) {
    if (!data) data = {};
    data['$'] = $;
    return data;
}

function responses(ctx) {
    return ctx.ws.send.calls.allArgs().map(args => JSON.parse(args[0]));
}

describe('system messages', () => {

    let context;

    beforeEach(() => {
        users.clear();
        context = wsCtx();
    });

    it('$: ping', () => {
        sendMessage(context, message('ping', {d: 'kkk'}));
        expect(responses(context)).toEqual([
            message('pong', {d: 'kkk'})
        ]);
    });

    it('$: in', () => {
        const context2 = wsCtx();
        context2.connectUser(15, 'another');
        expect(context2.user).not.toBeNull();
        expect(users.get(15)).toBe(context2.user);

        sendMessage(context, message('in', {user: {id: 666, name: 'kkk'}}));
        expect(context.user).not.toBeNull();
        expect(context.user.id).toBe(666);
        expect(context.user.name).toBe('kkk');
        expect(context.user.context).toBe(context);

        expect(users.size).toBe(2);
        expect(users.get(context.user.id)).toBe(context.user);
        expect(responses(context)).toEqual([
            message('present_users', {users: [
                [15, 'another'],
                [666, 'kkk'],
            ]})
        ]);
    });

    it('$: out', () => {
        context.connectUser(666, 'kkk');
        expect(context.user).not.toBeNull();
        expect(users.get(666)).toBe(context.user);

        const context2 = wsCtx();
        context2.connectUser(15, 'another');
        expect(context2.user).not.toBeNull();
        expect(users.get(15)).toBe(context2.user);

        sendMessage(context, message('out'));
        expect(users.get(666)).toBeUndefined();
        expect(users.get(15)).toBe(context2.user);
        expect(responses(context2)).toEqual([
            message('present_users', {users: [[15, 'another']]})
        ]);
    });

});

describe('user messages', () => {

    let ctxs = [];

    beforeEach(() => {
        users.clear();

        ctxs[0] = wsCtx();
        ctxs[0].connectUser(666, 'kkk');
        ctxs[1] = wsCtx();
        ctxs[1].connectUser(15, 'another');
        ctxs[2] = wsCtx();
        ctxs[2].connectUser(7, 'lucky');
    });

    it('$: speak', () => {
        sendMessage(ctxs[1], message('speak', {text: 'Hi there!'}));
        const msg = message('speak', {text: 'Hi there!', user: 15});
        expect(responses(ctxs[0])).toEqual([msg]);
        expect(responses(ctxs[1])).toEqual([]);
        expect(responses(ctxs[2])).toEqual([msg]);
    });

    describe('game', () => {

        it('clean game on user out', () => {
            ctxs[0].user.createGame(ctxs[1].user);
            expect(ctxs[0].user.game).not.toBeNull();
            expect(ctxs[1].user.game).not.toBeNull();
            sendMessage(ctxs[1], message('out'));
            expect(responses(ctxs[0])).toEqual([
                message('game_abandoned'),
                message('present_users', {users: [
                    [666, 'kkk'],
                    [7, 'lucky'],
                ]})
            ]);
            expect(responses(ctxs[1])).toEqual([
                message('game_abandoned')
            ]);
        });

        it('$: game_invite bad id', () => {
            sendMessage(ctxs[0], message('game_invite', {req_id: 1, opponent: 1}));
            expect(responses(ctxs[0])).toEqual([
               message('response', {req_id: 1, fail: 'bad opponent'})
            ]);
        });

        it('$: game_invite user in game', () => {
            ctxs[0].user.game = {};
            sendMessage(ctxs[0], message('game_invite', {req_id: 1, opponent: 15}));
            expect(responses(ctxs[0])).toEqual([
                message('response', {req_id: 1, fail: 'you are already in game'})
            ]);
        });

        it('$: game_invite opponent in game', () => {
            ctxs[1].user.game = {};
            sendMessage(ctxs[0], message('game_invite', {req_id: 1, opponent: 15}));
            expect(responses(ctxs[0])).toEqual([
                message('response', {req_id: 1, fail: 'opponent already in game'})
            ]);
        });

        it('$: game_invite', () => {
            sendMessage(ctxs[0], message('game_invite', {req_id: 1, opponent: 15}));
            expect(responses(ctxs[0])).toEqual([
                message('response', {req_id: 1})
            ]);
            expect(responses(ctxs[1])).toEqual([
                message('game_invited', {host: 666})
            ]);
        });

    });

});