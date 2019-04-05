import React from 'react';
import ReactDOM from 'react-dom';
import App from './App';
import TouchEmulator from "./TouchEmulator";
import { BrowserRouter as Router } from 'react-router-dom';

// Comment this to disable touch emulation
//const touchEmulator = new TouchEmulator();

//ReactDOM.render(<App />, document.getElementById('root'));
ReactDOM.render(<Router basename={process.env.PUBLIC_URL}>< App /></Router>, document.getElementById('root'));