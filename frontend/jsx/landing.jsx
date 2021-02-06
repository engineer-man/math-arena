import React from 'react';
import ReactDOM from 'react-dom';
import axios from 'axios';

class Landing extends React.Component {

    constructor(props) {
        super(props);

        this.state = {

        };
    }

    componentDidMount() {

    }

    render() {
        return (
            <div class="ma-landing">
                <div class="register">
                    <div class="logo">Math Arena</div>
                    <div class="name">
                        <input type="text" class="form-control" placeholder="Enter your name" />
                    </div>
                </div>
            </div>
        )
    }

}

export default Landing;
