import React from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import './App.global.css';
import Monitor from './windows/Monitor/Monitor';
import Setting from './windows/Setting/Setting';

export default function App() {
  return (
    <Router>
      <Switch>
        <Route path="/" component={Monitor} />
        <Route path="/setting" component={Setting} />
      </Switch>
    </Router>
  );
}
