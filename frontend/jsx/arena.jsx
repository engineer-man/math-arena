import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import gateway from 'js/gateway';

class Arena extends React.Component {

    constructor(props) {
        super(props);

        this.controls = {
            up: 0,
            left: 0,
            down: 0,
            right: 0
        };

        this.state = {
            ping: '0ms',
            uuid: null,
            field: {
                x: 1250,
                y: 1250,
            },
            players: {},
            problems: {},
            self: {}
        };

        this.process_feed = this.process_feed.bind(this);
        this.handle_keys = this.handle_keys.bind(this);
    }

    componentDidMount() {
        this.process_feed();

        this.refs.arena.focus();
    }

    componentWillUnmount() {
        this.gateway.stop();
    }

    process_feed() {
        this.gateway = new gateway();

        this.gateway.feed(msg => {
            let data = JSON.parse(msg);
            let { code, payload } = data;

            console.log(msg);

            switch (code) {
                case 'ping':
                    this.setState({
                        ping: payload.ping
                    });
                    break;
                case 'register':
                    this.setState({
                        uuid: payload.uuid
                    });
                    console.log('registering')
                    this.gateway.send({
                        code: 'set_name',
                        payload: {
                            name: this.props.name.substring(0, 16)
                        }
                    });
                    break;
                case 'player_state':
                    if (!payload.players[this.state.uuid]) {
                        break;
                    }

                    this.setState({
                        field: {
                            x: payload.players[this.state.uuid].pos.x,
                            y: payload.players[this.state.uuid].pos.y,
                        },
                        players: payload.players,
                        self: payload.players[this.state.uuid]
                    });
                    break;
                case 'problem_state':
                    this.setState({
                        problems: payload.problems
                    });
                    break;
            }
        });

        this.gateway.start();
    }

    handle_keys(e, type) {
        let key = e.which || e.keyCode;

        let payload = {
            pressed: type === 'down' ? 1 : 0
        };

        switch (key) {
            case 38: // up arrow
            case 87: // w
                payload.dir = 'up';
                break;
            case 37: // left arrow
            case 65: // a
                payload.dir = 'left';
                break;
            case 40: // down arrow
            case 83: // s
                payload.dir = 'down';
                break;
            case 39: // right arrow
            case 68: // d
                payload.dir = 'right';
                break;
            default:
                return;
        }

        if (this.controls[payload.dir] === payload.pressed) {
            return;
        }

        this.controls[payload.dir] = payload.pressed;

        this.gateway.send({
            code: 'movement',
            payload
        });
    }

    render() {
        const players = Object
            .keys(this.state.players)
            .map(key => this.state.players[key])
            .sort((a, b) => a.score < b.score ? 1 : -1);

        return (
            <div
                class="ma-arena"
                ref="arena"
                tabIndex={-1}
                onKeyDown={() => this.handle_keys(event, 'down')}
                onKeyUp={() => this.handle_keys(event, 'up')}>

                <div class="ping">{this.state.ping}</div>
                <div class="leaderboard">
                    <h5 class="f900">Leaderboard</h5>
                    {players.map(player => {
                        return (
                            <div key={player.uuid} class="player">
                                <div class="name">{player.name}</div>
                                <div class="score">{player.score}</div>
                            </div>
                        );
                    })}
                </div>
                <div class="minimap">
                    {players.map(player => {
                        return (
                            <div
                                key={player.uuid}
                                class={'player ' + (player.uuid === this.state.uuid ? 'self' : '')}
                                style={{
                                    top: `calc(${(player.pos.y / 2500) * 100}% - 3px)`,
                                    left: `calc(${(player.pos.x / 2500) * 100}% - 3px)`,
                                }}>
                            </div>
                        );
                    })}
                </div>
                {this.state.self && (
                    <div class="player-local">
                        <div class="name">{this.state.self.name}</div>
                        <div class="score">{this.state.self.score}</div>
                    </div>
                )}
                <div
                    class="field"
                    style={{
                        top: `calc(50% - ${this.state.field.y}px)`,
                        left: `calc(50% - ${this.state.field.x}px)`,
                    }}>
                    <div class="players">
                        {players.map(player => {
                            if (player.uuid === this.state.uuid) {
                                return null;
                            }

                            return (
                                <div
                                    key={player.uuid}
                                    class="player-remote"
                                    style={{
                                        top: `calc(${(player.pos.y / 2500) * 100}% - 40px)`,
                                        left: `calc(${(player.pos.x / 2500) * 100}% - 40px)`,
                                    }}>

                                    <div class="name">{player.name}</div>
                                    <div class="score">{player.score}</div>
                                </div>
                            );
                        })}
                    </div>
                </div>
            </div>
        )
    }

}

export default Arena;
