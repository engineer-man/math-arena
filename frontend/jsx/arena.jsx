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
                x: 250,
                y: 250,
            }
        };

        this.process_feed = this.process_feed.bind(this);
        this.handle_keys = this.handle_keys.bind(this);
    }

    componentDidMount() {
        this.process_feed();

        this.refs.arena.focus();
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
                    break;
                case 'player_state':
                    if (!payload.players[this.state.uuid]) {
                        break;
                    }

                    this.setState({
                        field: {
                            x: payload.players[this.state.uuid].pos.x,
                            y: payload.players[this.state.uuid].pos.y,
                        }
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
            case 87: // w
                payload.dir = 'up';
                break;
            case 65: // a
                payload.dir = 'left';
                break;
            case 83: // s
                payload.dir = 'down';
                break;
            case 68: //
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
        return (
            <div
                class="ma-arena"
                ref="arena"
                tabIndex={-1}
                onKeyDown={() => this.handle_keys(event, 'down')}
                onKeyUp={() => this.handle_keys(event, 'up')}>

                <div class="ping">{this.state.ping}</div>
                <div class="player-local">
                    <div class="name">engineerman</div>
                    <div class="points">14321</div>
                </div>
                <div
                    class="field"
                    style={{
                        top: `calc(50% - ${this.state.field.y}px)`,
                        left: `calc(50% - ${this.state.field.x}px)`,
                    }}>
                    <div class="players-remote"></div>
                </div>
            </div>
        )
    }

}

export default Arena;
