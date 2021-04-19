import React from 'react';
import { Component } from 'react';
import '../App.global.css';
import './TrendStyle.css';
import config from '../config';
import ReactECharts from 'echarts-for-react';
import "echarts/lib/component/graphic";
import log from 'electron-log';
import Store from 'electron-store';
import { ipcRenderer, remote } from 'electron';
import { Currency, Pair } from '../Entities';
import { StateType } from './StateType';
import { TrendMode } from '../Enums';

const store = new Store();

class Trend extends Component {
  state: StateType = new StateType;

  pair: string = '';

  constructor(props: any) {
    super(props);
  }

  updateState = () => {
    if (this.pair && store.has(this.pair)) {
      const currency: Currency = store.get(this.pair);
      const option = JSON.parse(JSON.stringify(this.state.option));
      option.xAxis.data = currency.kData.x;
      option.series[0].data = currency.kData.y;
      this.setState({
        currency,
        option
      });
    }
  }

  componentDidMount() {
    const { mode = TrendMode.Standalone, pair = '' } = this.props;
    if (mode === TrendMode.Standalone) {
      ipcRenderer.on('updatePair', (_, pair: Pair) => {
        this.pair = pair.pair;
        this.updateState()

        remote.getCurrentWindow().setSize(config.winTrendWidth, config.winTrendHeight);
      });
    } else {
      this.pair = pair;
    }
    ipcRenderer.on('wakeup', this.updateState);
  }

  render() {
    const { option, currency } = this.state;
    const { mode = TrendMode.Standalone } = this.props;
    if (mode === TrendMode.Standalone) {
      return (
        <div className='box'>
          <div className='title'>Last 24H Trend</div>
          <ReactECharts option={option} className='trend-chart'/>
          <div className='info-bar'>
            <span>
              <span className='info-bar-price'>{Currency.simplelyPrice(currency.avgPrice)}</span>
              <span>$</span>
            </span>
            <span className='info-bar-upanddown' style={{color: currency.priceChangePrecentIn24H?.indexOf('-') >= 0 ? 'rgb(231, 90, 112)': 'rgba(41, 209, 143, 100)'}}>{currency.priceChangePrecentIn24H}%</span>
          </div>
        </div>
      );
    } else {
      return (
        <ReactECharts option={option} className='trend-chart-embeded'/>
      )
    }
  }
}

export default Trend;
