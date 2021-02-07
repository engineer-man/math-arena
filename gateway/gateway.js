const ws = require('ws');
const ioredis = require('ioredis');
const uuid = require('uuid');

let clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// config
const FIELD_MAX_WIDTH = 1000;
const FIELD_MAX_HEIGHT = 1000;

// output codes
const CODE_PING = 'ping';
const CODE_REGISTER = 'register';
const CODE_PLAYER_STATE = 'player_state';

// input codes
const CODE_MOVEMENT = 'movement';

const wss = new ws.Server({ port: config.ports.gateway });
const rpub = new ioredis(6379, 'redis');
const rsub = new ioredis(6379, 'redis');

const state = {
    game1: {
        players: {},
        problems: {}
    }
};

let loop = set_interval(() => {
    // adjust positioning
    for (let player in state.game1.players) {
        player = state.game1.players[player];

        if (player.input.up)
            player.pos.y -= 12;
        if (player.input.down)
            player.pos.y += 12;
        if (player.input.left)
            player.pos.x -= 12;
        if (player.input.right)
            player.pos.x += 12;

        player.pos.x = clamp(player.pos.x, 0, FIELD_MAX_WIDTH);
        player.pos.y = clamp(player.pos.y, 0, FIELD_MAX_HEIGHT);

        console.log(player);
    }

    rpub.publish('game1', JSON.stringify({
        code: CODE_PLAYER_STATE,
        payload: {
            players: state.game1.players
        }
    }));
}, 50);

wss.on('connection', socket => {
    socket.uuid = uuid.v4().split('-')[0];

    state.game1.players[socket.uuid] = {
        uuid: socket.uuid,
        name: 'unknown',
        pos: {
            x: 500.0,
            y: 500.0,
        },
        input: {
            up: 0,
            left: 0,
            down: 0,
            right: 0,
        }
    };

    socket.send(JSON.stringify({
        code: CODE_REGISTER,
        payload: {
            uuid: socket.uuid
        }
    }));

    // process messages
    socket.on('message', message => {
        try {
            message = JSON.parse(message);

            switch (message.code) {
                case 'movement':
                    let { pressed, dir } = message.payload;

                    state.game1.players[socket.uuid].input[dir] = pressed;
                    break;
            }
        } catch (e) {
            // invalid json
        }
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
