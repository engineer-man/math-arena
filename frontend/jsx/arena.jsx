import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import gateway from 'js/gateway';

class Arena extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            ping: '0ms'
        };

        this.process_feed = this.process_feed.bind(this);
        this.handle_keys = this.handle_keys.bind(this);
    }

    componentDidMount() {
        this.process_feed();
    }

    process_feed() {
        this.gateway = new gateway();
        this.gateway.start();

        this.gateway.feed(msg => {
            let data = JSON.parse(msg);

            console.log(msg);

            switch (data.code) {
                case 'ping':
                    this.setState({
                        ping: data.payload.ping
                    });
                    break;
            }
        });
    }

    handle_keys(e, type) {
        let key = e.which || e.keyCode;

        let payload = {};

        switch (key) {
            case 67: // w
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

        console.log(key);
    }

    render() {
        return (
            <div
                class="ma-arena"
                tabIndex={-1}
                onKeyDown={() => this.handle_keys(event, 'down')}
                onKeyUp={() => this.handle_keys(event, 'up')}>

                <div class="ping">{this.state.ping}</div>
                <div class="player-local">
                    <div class="name">engineerman</div>
                    <div class="points">14321</div>
                </div>
                <div class="field">
                    <div class="players-remote"></div>
                </div>
            </div>
        )
    }

}

export default Arena;
