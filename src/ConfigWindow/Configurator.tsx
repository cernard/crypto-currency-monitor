import React from 'react';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styles from './style.css';
import config from '../config';
import '../App.global.css';
import delete_icon from '../../assets/delete.svg'
const api = 'https://api.binance.com/api/v3/avgPrice?symbol='

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

class Monitor extends Component {
  constructor(props) {
    super(props);
    // win.setSize(100, 100)
  }

  componentDidMount() {
  }

  close = () => {
    ipcRenderer.send('hideConfigWindow');
  }

  render() {
    return (
      <div className={styles['container']}>
        <div className={styles['title']}>Add Pair
          <span className={styles['close-btn']} onClick={this.close}/>
        </div>
        <div className={styles['input-box']}>
          <input className={styles['input']}/>
          <div className={styles['add-btn']}>Add</div>
        </div>
        <div className={styles['pair-list']}>
          <div className={styles['pair-item']}>
            <span className={styles['pair']}>BTC/USDT</span>
            <img className={styles['delete-icon']} src={delete_icon} />
          </div>
          <div className={styles['line']}/>
          <div className={styles['pair-item']}>
            <span className={styles['pair']}>BTC/USDT</span>
            <img className={styles['delete-icon']} src={delete_icon} />
          </div>
          <div className={styles['line']}/>
        </div>
      </div>
    );
  }
}

export default Monitor;
