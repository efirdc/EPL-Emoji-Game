import React, { Component } from 'react';

import './App.css';

import GameBoard from './memory/components/board';

const styles = {
  container: {
    "height" : "100%"
  }
}

class App extends Component {
  
  render() {
    return (
      <div className="App" style = {styles.container}>
        <GameBoard/>
      </div>
    );
  }
}

export default App;
