import React from 'react';
import ReactDOM from 'react-dom';
import { withRouter as WithRouter } from 'react-router-dom';
import axios from 'axios';

class Landing extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        };

        this.detect_start = this.detect_start.bind(this);
    }

    detect_start(e) {
        let code = e.which || e.keyCode;

        if (code === 13) {
            localStorage.setItem('name', this.props.name);
            this.props.history.push('/arena');
        }
    }

    render() {
        return (
            <div class="ma-landing">
                <div class="register">
                    <div class="logo">Math Arena</div>
                    <div class="name">
                        <input
                            type="text"
                            class="form-control"
                            placeholder="Enter your name and hit Enter"
                            value={this.props.name}
                            onChange={this.props.update_name}
                            onKeyUp={this.detect_start} />
                    </div>
                </div>
            </div>
        )
    }

}

export default WithRouter(Landing);
