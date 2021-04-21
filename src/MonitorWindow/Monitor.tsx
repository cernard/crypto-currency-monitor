import React from 'react';
import { Component } from 'react';
// import setting_icon from '../../assets/setting.svg';
import '../App.global.css';
import './MonitorStyle.css';
import config from '../config';
import { ipcRenderer, remote } from 'electron';
import { Pair, Currency } from '../Entities';
import log, { info } from 'electron-log';
import Store from 'electron-store';
import Trend from '../TrendWindow/Trend';
import { TrendMode } from '../Enums';

const store = new Store();
const win = remote.getCurrentWindow();

class Monitor extends Component {
  state = {
    currencies: []
  };

  priceIntervals = [];

  updateState = () => {
    const pairs:Pair[] = store.get(config.PAIRS);
    console.log(pairs);
    const currencies: Currency[] = pairs.map(pair => store.get(pair.pair));
    this.setState({currencies});
  }

  componentDidMount() {
    ipcRenderer.on('wakeup', this.updateState);
  }

  shouldComponentUpdate(props: any, state: any) {
    const { currencies = [] } = state;

    // resize with monitor currency count;
    if (this.state.currencies.length === 0) {
      config.winMonitorHeight = 35;
    } else {
      config.winMonitorHeight = 35 * currencies.length;
    }
    win.setSize(config.winMonitorWidth, config.winMonitorHeight);
    return true;
  }

  showTrendWindow = (pair: Pair) => {
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
    const { currencies = [] } = this.state;
    return (
      <div className='box'>
        {/* <img className='setting-icon' src='../../assets/setting.svg' onClick={this.navigateToSetting} /> */}
        <div className='setting-handle' onClick={this.navigateToSetting} />
        {
          currencies && currencies.length >= 1 ? currencies.map((currency: Currency) => (
            <>
            {log.info(currency)}
              <div
              className='item'
              onMouseDown={() => this.showTrendWindow(currency.pair)}
              onMouseUp={() => this.hideTrendWindow()}
              >
                <div className='priceInfo'>
                <span className='dot' style={{
                  backgroundColor: currency.avgPrice >= currency.pair.purchasePrice ? 'rgba(41, 209, 143, 100)' : 'rgb(231, 90, 112)'
                }}/>
                  <span className='symbol'>
                    {currency.pair.secondaryCurrency}</span>
                  <span className='symbolUnit'>/{currency.pair.baseCurrency}</span>
                  <span className='price'>
                      {Currency.simplelyPrice(currency.avgPrice)}
                  </span>
                  <span className='money-symbol'>{currency.symbol}</span>
                </div>
                <Trend pair={currency.pair.pair} mode={TrendMode.Embedded}/>
              </div>
              <div className='line'/>
            </>
          ))
          :
          <div className='blank'>
            <img src='../../assets/monitor.svg' className='blank-icon' />
            <span>Add pair to monitor</span>
          </div>
        }
      </div>
    );
  }
}

export default Monitor;
