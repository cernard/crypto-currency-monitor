import React from 'react';
import { Component } from 'react';
import { BrowserRouter as Router, Switch, Route } from 'react-router-dom';
import styles from './style.css';

class Setting extends Component {
  render() {
    return (
      <div className={styles['box']}>
        Hello World
      </div>
    );
  }
}

export default Setting;
