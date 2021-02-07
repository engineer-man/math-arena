import React from 'react';
import ReactDOM from 'react-dom';

class Gateway {

    constructor() {
        this.connected = false;
        this.callbacks = [];
    }

    start() {
        this.connection = new WebSocket(process.config.urls.gateway);

        this.connection.onopen = this.on_open.bind(this);
        this.connection.onmessage = this.on_message.bind(this);
        this.connection.onclose = this.on_close.bind(this);
        this.connection.onerror = this.on_error.bind(this);
    }

    on_open() {
        this.connected = true;

        console.log('gateway ready');
    }

    on_message(message) {
        for (const cb of this.callbacks) {
            cb(message.data);
        }
    }

    on_close() {
        this.connected = false;

        console.log('gateway closed');

        setTimeout(() => {
            console.log('gateway reconnecting');
            this.start();
        }, 3000);
    }

    on_error(error) {
        throw new Error(error);
    }

    send(data) {
        if (!this.connected) {
            return;
        }

        this.connection.send(JSON.stringify(data));
    }

    feed(callback) {
        this.callbacks.push(callback);
    }

}

export default Gateway;
