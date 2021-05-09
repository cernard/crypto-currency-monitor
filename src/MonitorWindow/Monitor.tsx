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
import { NONAME } from 'dns';

const store = new Store();
const win = remote.getCurrentWindow();

class Monitor extends Component {
  state = {
    currencies: [],
    isShowBtn: false,
    isPin: true
  };

  priceIntervals = [];

  updateState = () => {
    const pairs: Pair[] = store.get(config.PAIRS);
    const currencies: Currency[] = pairs.map((pair) => store.get(pair.pair));
    this.setState({ currencies });
  };

  componentDidMount() {
    this.updatePinState();

    ipcRenderer.on('updatePinState', this.updatePinState);
    ipcRenderer.on('wakeup', this.updateState)
  }

  shouldComponentUpdate(props: any, state: any) {
    const { currencies = [] } = state;

    // resize with monitor currency count;
    if (this.state.currencies.length <= 1) {
      config.winMonitorHeight = 70;
    } else {
      config.winMonitorHeight = 50 * currencies.length;
    }
    win.setSize(config.winMonitorWidth, config.winMonitorHeight);
    return true;
  }

  showTrendWindow = (pair: Pair) => {
    // ipcRenderer.send('showTrendWindow', pair);
  };

  hideTrendWindow = () => {
    // ipcRenderer.send('hideTrendWindow');
  };

  navigateToSetting = () => {
    ipcRenderer.send('showConfigWindow');
  };

  showBtn = (trigger: Boolean) => {
    this.setState({
      isShowBtn: trigger,
    });
  };

  updatePinState = () => {
    let isPin = store.get('isPin');
    if (isPin == null) isPin = true;
    this.setState({isPin});
  }

  togglePin = () => {
    ipcRenderer.send('togglePin');
  }

  quitApp = () => {
    ipcRenderer.send('quitApp');
  }

  render() {
    const { currencies = [], isShowBtn, isPin = true } = this.state;
    console.log(isPin)
    return (
      <div
        className="box"
        onMouseEnter={(_) => this.showBtn(true)}
        onMouseLeave={(_) => this.showBtn(false)}
      >
        <div
          className={`float-btn pin-btn ${isShowBtn ? 'show-btn' : 'hide-btn'} ${isPin ? 'switch-on': 'switch-off'}`}
          onClick={this.togglePin}
        >
          <img src="../../assets/icons/pin.svg" className="btn-icon" style={{width: 10, height: 10}}/>
        </div>
        <div
          className={`float-btn scale-btn ${
            isShowBtn ? 'show-btn' : 'hide-btn'
          }`}
        >
          <img className="btn-icon" src="../../assets/icons/zoom-in.svg" style={{width: 10, height: 10}} />
        </div>
        <div
          className={`float-btn close-btn ${
            isShowBtn ? 'show-btn' : 'hide-btn'
          }`}
          onClick={this.quitApp}
        >
          <img className="btn-icon" src="../../assets/icons/cross.svg" />
        </div>
        <div
          className={`float-btn setting-btn ${
            isShowBtn ? 'show-btn' : 'hide-btn'
          }`}
          onClick={this.navigateToSetting}
        >
          <img className="btn-icon" src="../../assets/icons/setting.svg" style={{width: 12, height: 12}} />
        </div>
        {currencies && currencies.length >= 1 ? (
          currencies.map((currency: Currency) => (
            <>
              <div
                className="item"
                onMouseDown={() => this.showTrendWindow(currency.pair)}
                onMouseUp={() => this.hideTrendWindow()}
              >
                <div className="priceInfo">
                  <span
                    className="dot"
                    style={{
                      backgroundColor:
                        currency.avgPrice >= currency.pair.purchasePrice
                          ? 'rgba(41, 209, 143, 100)'
                          : 'rgb(231, 90, 112)',
                    }}
                  />
                  <span className="symbol">
                    {currency.pair.secondaryCurrency}
                  </span>
                  <span className="symbolUnit">
                    /{currency.pair.baseCurrency}
                  </span>
                  <span className="price">
                    {Currency.simplelyPrice(currency.avgPrice)}
                  </span>
                  {/* <span className="money-symbol">{currency.symbol}</span> */}
                </div>
                <Trend pair={currency.pair.pair} mode={TrendMode.Embedded} />
              </div>
              <div className="line" />
            </>
          ))
        ) : (
          <div className="blank">
            <img src="../../assets/monitor.svg" className="blank-icon" />
            <span>Add pair to monitor</span>
          </div>
        )}
      </div>
    );
  }
}

export default Monitor;
