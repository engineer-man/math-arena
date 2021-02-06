import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

import gateway from 'js/gateway';

class Arena extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {
        this.gateway = new gateway();
        this.gateway.start();

        this.gateway.feed(msg => {
            console.log(msg);
        });
    }

    render() {
        return (
            <div class="ma-arena">
                <div class="player-local">
                    <div class="name">engineerman</div>
                    <div class="points">14321</div>
                </div>
                <div class="field">

                </div>
            </div>
        )
    }

}

export default Arena;
