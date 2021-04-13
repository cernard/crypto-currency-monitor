import React from 'react';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styles from './style.css';
import setting_icon from '../../assets/setting.svg';
import '../App.global.css';

const api = 'https://api.binance.com/api/v3/avgPrice?symbol='

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

class Monitor extends Component {
  state = {
    monitor: [
      {
        label: 'BTC',
        unit: 'USDT',
        avgPrice: '',
        moneySymbol: '$'
      },
      {
        label: 'ETH',
        unit: 'USDT',
        avgPrice: '',
        moneySymbol: '$'
      }
    ]
  }

  componentDidMount() {
    const { monitor } = this.state;
    monitor.forEach(info => setInterval(() => this.updatePrice(info.label, info.unit), 1000));
  }

  updatePrice = (label: string, unit: String) => {
    fetch(api + label.toUpperCase() + unit.toUpperCase())
    .then(rep => rep.json())
    .then(data => {
      const monitor = this.state.monitor.slice();
      const origin = monitor.find(info => info.label === label && info.unit === unit);
      if (origin) {
        origin.avgPrice = parseFloat(data['price']).toFixed(0);
        this.setState({...this.state, monitor});
      }
    });
  }

  navigateToSetting = () => {
    ipcRenderer.send('showConfigWindow');
  }

  render() {
    const { monitor = [] } = this.state;
    const [width, _] = win.getSize();
    win.setSize(width, 40 * this.state.monitor.length + 10);
    return (
      <div className={styles['box']}>
        <img className={styles['setting-icon']} src={setting_icon} onClick={this.navigateToSetting} />
        {
          monitor.map(item => (
            <>
              <div className={styles['item']}>
                <span className={styles['symbol']}>{item.label}</span>
                <span className={styles['symbolUnit']}>/{item.unit}</span>
                <span className={styles['price']}>{item.avgPrice}</span>
                <span className={styles['money-symbol']}>{item.moneySymbol}</span>
              </div>
              <div className={styles['line']}/>
            </>
          ))
        }
      </div>
    );
  }
}

export default Monitor;
