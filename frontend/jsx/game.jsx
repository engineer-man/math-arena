import React from 'react';
import ReactDOM from 'react-dom';
import {BrowserRouter as Router, Switch, Route, Link} from 'react-router-dom';
import axios from 'axios';

import Util from 'js/util';

import Landing from './landing.jsx';
import Arena from './arena.jsx';

class Game extends React.Component {

    constructor(props) {
        super(props);

        this.state = {
            name: localStorage.getItem('name') || ''
        };

        this.update_name = this.update_name.bind(this);
    }

    update_name(e) {
        this.setState({
            name: e.target.value
        });
    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/arena">
                        <Arena
                            name={this.state.name} />
                    </Route>
                    <Route path="/">
                        <Landing
                            name={this.state.name}
                            update_name={this.update_name} />
                    </Route>
                </Switch>
            </Router>
        )
    }

}

Util.try_render('react_game', Game);

export default Game;
