const ws = require('ws');
const ioredis = require('ioredis');
const uuid = require('uuid');

let clamp = (num, min, max) => Math.min(Math.max(num, min), max);

// config
const FIELD_MAX_WIDTH = 2500;
const FIELD_MAX_HEIGHT = 2500;

// output codes
const CODE_PING = 'ping';
const CODE_REGISTER = 'register';
const CODE_PLAYER_STATE = 'player_state';

// input codes
const CODE_MOVEMENT = 'movement';
const CODE_SET_NAME = 'set_name';

const wss = new ws.Server({ port: config.ports.gateway });
const rpub = new ioredis(6379, 'redis');

const state = {
    game1: {
        players: {}
    }
};

// handle game ticks, approx 20/sec
set_interval(() => {
    // adjust positioning
    for (let player in state.game1.players) {
        player = state.game1.players[player];

        if (player.input.up)
            player.pos.y -= 30;
        if (player.input.down)
            player.pos.y += 30;
        if (player.input.left)
            player.pos.x -= 30;
        if (player.input.right)
            player.pos.x += 30;

        player.pos.x = clamp(player.pos.x, 0, FIELD_MAX_WIDTH);
        player.pos.y = clamp(player.pos.y, 0, FIELD_MAX_HEIGHT);
    }

    console.log(JSON.stringify(state, null, 2));

    // publish current player positions to all connected clients
    rpub.publish('game1', JSON.stringify({
        code: CODE_PLAYER_STATE,
        payload: {
            players: state.game1.players
        }
    }));
}, 50);

wss.on('connection', socket => {
    const rsub = new ioredis(6379, 'redis');

    socket.uuid = uuid.v4().split('-')[0];

    state.game1.players[socket.uuid] = {
        uuid: socket.uuid,
        name: '',
        score: Math.floor(Math.random() * 30),
        pos: {
            x: FIELD_MAX_WIDTH / 2,
            y: FIELD_MAX_HEIGHT / 2,
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

            let player = state.game1.players[socket.uuid];

            switch (message.code) {
                case 'movement':
                    let { pressed, dir } = message.payload;

                    player.input[dir] = pressed;
                    break;
                case 'set_name':
                    let { name } = message.payload;

                    player.name = name;
                    break;
            }
        } catch (e) {
            // invalid json
        }
    });

    socket.on('close', () => {
        rsub.disconnect();
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
