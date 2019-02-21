import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import TouchEmulator from "./TouchEmulator";

const touchEmulator = new TouchEmulator();

ReactDOM.render(<App />, document.getElementById('root'));