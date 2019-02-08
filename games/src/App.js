import React, { Component } from 'react';
import {library} from '@fortawesome/fontawesome-svg-core';
import {far} from '@fortawesome/free-regular-svg-icons';
import {
    faAngry,
    faFlushed,
    faGrin,
    faGrinHearts,
    faMehBlank
} from '@fortawesome/free-regular-svg-icons';

import {faCoffee} from '@fortawesome/free-solid-svg-icons';



import './App.css';

import GameBoard from './memory/components/board';
library.add(
  far,
  faAngry,
  faFlushed,
  faGrin,
  faGrinHearts,
  faMehBlank,
  faCoffee
)

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
