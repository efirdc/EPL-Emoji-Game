import React, { Component } from 'react';
import './App.css';
import Game from './memory/components/Game';
import { BrowserRouter as Router, Route } from 'react-router-dom';

class App extends Component {
  render() {
    return (
        <Route exact path={`/`} render={ (routerProps) =>
            <div  className="App">
              <Game routerProps={routerProps}/>
            </div>
        }
        />
    );
  }
}

export default App;
