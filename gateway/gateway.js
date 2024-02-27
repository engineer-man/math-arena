const ws = require('ws');
const ioredis = require('ioredis');
const uuid = require('uuid');

let clamp = (num, min, max) => Math.min(Math.max(num, min), max);
let rand_between = (min, max) => Math.floor(Math.random() * (max - min + 1) + min);
let test_intersect = (x1, y1, r1, x2, y2, r2) => {
    let dist = (x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2);
    let rad = (r1 + r2) * (r1 + r2);

    return dist <= rad;
};

// config
const FIELD_WIDTH = 2500;
const FIELD_HEIGHT = 2500;
const PROBLEM_WIDTH = 300;
const PROBLEM_HEIGHT = 300;
const PROBLEM_RADIUS = 150;

// output codes
const CODE_PING = 'ping';
const CODE_REGISTER = 'register';
const CODE_PLAYER_STATE = 'player_state';
const CODE_PROBLEM_STATE = 'problem_state';

// input codes
const CODE_MOVEMENT = 'movement';
const CODE_SET_NAME = 'set_name';

const wss = new ws.Server({ port: config.ports.gateway });
const rpub = new ioredis(6379, 'redis');

const state = {
    game1: {
        players: {},
        problems: {}
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

        player.pos.x = clamp(player.pos.x, 0, FIELD_WIDTH);
        player.pos.y = clamp(player.pos.y, 0, FIELD_HEIGHT);
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

// problem watcher, adds new problems when they get solved
set_interval(() => {
    if (Object.keys(state.game1.problems).length >= 20) {
        return;
    }

    // add new problem
    const id = uuid.v4().split('-')[0];
    const x = rand_between(PROBLEM_RADIUS, FIELD_WIDTH - PROBLEM_RADIUS);
    const y = rand_between(PROBLEM_RADIUS, FIELD_HEIGHT - PROBLEM_RADIUS);

    // check if this new problem circle intersects with any currently on the board
    for (let problem in state.game1.problems) {
        problem = state.game1.problems[problem];

        if (test_intersect(
            problem.pos.x, problem.pos.y, PROBLEM_RADIUS, x, y, PROBLEM_RADIUS)) {
            return;
        }
    }

    state.game1.problems[id] = {
        uuid: id,
        pos: {
            x,
            y
        }
    };

    rpub.publish('game1', JSON.stringify({
        code: CODE_PROBLEM_STATE,
        payload: {
            problems: state.game1.problems
        }
    }));
}, 500);

wss.on('connection', socket => {
    const rsub = new ioredis(6379, 'redis');

    socket.uuid = uuid.v4().split('-')[0];

    state.game1.players[socket.uuid] = {
        uuid: socket.uuid,
        name: '',
        score: rand_between(1, 100),
        pos: {
            x: FIELD_WIDTH / 2,
            y: FIELD_HEIGHT / 2,
        },
        input: {
            up: 0,
            left: 0,
            down: 0,
            right: 0,
        }
    };

    // send initial registration
    socket.send(JSON.stringify({
        code: CODE_REGISTER,
        payload: {
            uuid: socket.uuid
        }
    }));

    // send initial list of problems on the map
    socket.send(JSON.stringify({
        code: CODE_PROBLEM_STATE,
        payload: {
            problems: state.game1.problems
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
