import React from 'react';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styles from './MonitorStyle.css';
import setting_icon from '../../assets/setting.svg';
import '../App.global.css';
import config from '../config';

const api = 'https://api.binance.com/api/v3/avgPrice?symbol='

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

class Monitor extends Component {
  state = {
    monitor: [
    ]
  };

  priceIntervals = [];

  componentDidMount() {
    ipcRenderer.send('loadConfig');
    ipcRenderer.on('reciveConfig', (_, args) => {
      const configJson = JSON.parse(args);
      if (configJson['pairs'] == null) {
        this.setState({...this.state, monitor: [] });
      } else {
        const monitor = [];
        configJson['pairs'].forEach(pair => {
          const symbol = pair.split('/')[0];
          const unit = pair.split('/')[1];
          if (symbol && unit) {
            monitor.push({
              label: symbol,
              unit: unit,
              avgPrice: 0,
              moneySymbol: '$'
            })
          }
          this.updatePrice(symbol, unit);
        });
        this.setState({...this.state, monitor});
      }
    });
  }

  shouldComponentUpdate(props, state) {
    this.priceIntervals.forEach(intervalHandle => clearInterval(intervalHandle));
    this.priceIntervals = [];
    state.monitor.forEach(info => {
      const intervalHandle = setInterval(() => this.updatePrice(info.label, info.unit), 2000);
      this.priceIntervals.push(intervalHandle);
    });
    return true;
  }

  updatePrice = (label: string, unit: String) => {
    fetch(api + label.toUpperCase() + unit.toUpperCase())
    .then(rep => rep.json())
    .then(data => {
      const monitor = this.state.monitor.slice();
      const origin = monitor.find(info => info.label === label && info.unit === unit);
      if (origin) {
        let price = data['price'];
        let fixedIndex = 0;

        if (parseFloat(price) < 1 && parseFloat(price) >= 0) {
          for(let i = 0; i <= price.length; i++) {
            if (price[i] !== '0') {
              fixedIndex = i;
              break;
            }
          }

        }
        price = parseFloat(price).toFixed(fixedIndex);

        origin.avgPrice = price;
        this.setState({...this.state, monitor});
      }
    });
  }

  showTrendWindow = (pair: string) => {
    console.log(pair)
    ipcRenderer.send('showTrendWindow', pair);
  }

  hideTrendWindow = () => {
    ipcRenderer.send('hideTrendWindow');
  }

  navigateToSetting = () => {
    ipcRenderer.send('showConfigWindow');
  }

  render() {
    const { monitor = [] } = this.state;
    config.winMonitorHeight = 40 * this.state.monitor.length + 8 * this.state.monitor.length;
    win.setSize(config.winMonitorWidth, config.winMonitorHeight);
    return (
      <div className={styles['box']}>
        <img className={styles['setting-icon']} src={setting_icon} onClick={this.navigateToSetting} />
        {
          monitor.map(item => (
            <>
              <div
              className={styles['item']}
              onMouseDown={() => this.showTrendWindow(item.label + '/' + item.unit)}
              onMouseUp={() => this.hideTrendWindow()}
              >
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
