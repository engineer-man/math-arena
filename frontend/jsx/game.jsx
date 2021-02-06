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

        this.state = {};
    }

    componentDidMount() {

    }

    render() {
        return (
            <Router>
                <Switch>
                    <Route path="/arena">
                        <Arena />
                    </Route>
                    <Route path="/">
                        <Landing />
                    </Route>
                </Switch>
            </Router>
        )
    }

}

Util.try_render('react_game', Game);

export default Game;
