
const ws_handler_creator = function (ws_app) {
    return function(ws, req) {
        ws.on('message', function(msg) {
            ws.send(msg);
            console.log(msg);
        });

        // console.log(ws_app.getWss());
    };
};

module.exports = ws_handler_creator;