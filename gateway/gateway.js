const ws = require('ws');
const ioredis = require('ioredis');
const uuid = require('uuid');

// output codes
const CODE_PING = 'ping';
const CODE_PLAYER_STATE = 'player_state';

// input codes
const CODE_MOVEMENT = 'movement';

const wss = new ws.Server({ port: config.ports.gateway });
const rpub = new ioredis(6379, 'redis');
const rsub = new ioredis(6379, 'redis');

const state = {
    game1: {
        players: {

        },
        problems: {

        }
    }
};

let loop = set_interval(() => {
    rpub.publish('game1', JSON.stringify({
        op: CODE_PLAYER_STATE,
        payload: {
            players: state.game1.players
        }
    }));
}, 100);

wss.on('connection', socket => {
    socket.uuid = uuid.v4().split('-')[0];

    state.game1.players[socket.uuid] = {
        name: 'unknown',
        pos: {
            x: 250.0,
            y: 250.0
        },
        input: {
            top: 0,
            right: 0,
            bottom: 0,
            left: 0
        }
    };

    console.log(socket.uuid);

    // process messages
    socket.on('message', message => {

    });

    socket.on('close', () => {
        rsub.unsubscribe('game1');
        delete state.game1.players[socket.uuid];
    });

    socket.on('pong', () => {
        socket.alive = true;
    });

    // subscribe to game updates
    rsub.subscribe('game1');
    rsub.on('message', (channel, message) => {
        socket.send(message);
    });
});

// 2 second keep alive
set_interval(() => {
    wss.clients.for_each(socket => {
        if (socket.alive === false) {
            return socket.terminate();
        }

        socket.ping_start = +new Date();
        socket.alive = false;
        socket.ping(() => {});

        if (!socket.has_pong) {
            socket.on('pong', () => {
                socket.has_pong = true;

                let time_end = +new Date() - socket.ping_start;
                let latency = Math.ceil(time_end) + 'ms';

                socket.send(JSON.stringify({
                    code: CODE_PING,
                    payload: {
                        ping: latency
                    }
                }));
            });
        }
    });
}, 2000);
