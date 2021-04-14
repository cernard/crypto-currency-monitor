import React from 'react';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styles from './style.css';
import setting_icon from '../../assets/setting.svg';
import '../App.global.css';
import config from '../config';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts'

const api = 'https://api.binance.com/api/v3/avgPrice?symbol='

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

const option = {
  xAxis: {
      type: 'category',
      data: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
      axisLabel: {
          show: false
      },
      axisLine: {
          show: false
      },
      axisTick: {
          show: false
      },
      splitLine: {
          show: false
      }
  },
  yAxis: {
      type: 'value',
      axisLabel: {
          show: false
      },
      axisLine: {
          show: false
      },
      axisTick: {
          show: false
      },
      splitLine: {
          show: false
      }
  },
  series: [{
      data: [150, 230, 224, 218, 135, 147, 260],
      type: 'line',
      itemStyle: {
          opacity: 0
      },
      lineStyle: {
          color: 'rgba(238, 205, 73, 100)'
      },
      areaStyle: {
          color: new echarts.grapic.LinearGradient(0, 0, 0, 1,[{
                   offset: 0, color: 'rgb(235, 208, 100)' // 0% 处的颜色
                   },{
                       offset: 0.4, color: '#fff' // 100% 处的颜色
                   }]
       )
      }
  }]
};

class Trend extends Component {
  state = {
    monitor: [
    ]
  };

  priceIntervals = [];

  componentDidMount() {
    // ipcRenderer.send('loadConfig');
    // ipcRenderer.on('reciveConfig', (_, args) => {
    //   const configJson = JSON.parse(args);
    //   if (configJson['pairs'] == null) {
    //     this.setState({...this.state, monitor: [] });
    //   } else {
    //     const monitor = [];
    //     configJson['pairs'].forEach(pair => {
    //       const symbol = pair.split('/')[0];
    //       const unit = pair.split('/')[1];
    //       if (symbol && unit) {
    //         monitor.push({
    //           label: symbol,
    //           unit: unit,
    //           avgPrice: 0,
    //           moneySymbol: '$'
    //         })
    //       }
    //     });
    //     this.setState({...this.state, monitor});
    //   }
    // });
  }

  shouldComponentUpdate(props, state) {
    // this.priceIntervals.forEach(intervalHandle => clearInterval(intervalHandle));
    // this.priceIntervals = [];
    // state.monitor.forEach(info => {
    //   const intervalHandle = setInterval(() => this.updatePrice(info.label, info.unit), 1000);
    //   this.priceIntervals.push(intervalHandle);
    // });
    return true;
  }

  updatePrice = (label: string, unit: String) => {
    // fetch(api + label.toUpperCase() + unit.toUpperCase())
    // .then(rep => rep.json())
    // .then(data => {
    //   const monitor = this.state.monitor.slice();
    //   const origin = monitor.find(info => info.label === label && info.unit === unit);
    //   if (origin) {
    //     origin.avgPrice = parseFloat(data['price']).toFixed(0);
    //     this.setState({...this.state, monitor});
    //   }
    // });
  }

  getOption = () => {

    return option;
  }

  render() {
    const { monitor = [] } = this.state;
    win.setSize(100, 500)
    console.log(echarts)
    return (
      <div className={styles['box']}>
        <div>24H Trend</div>
        <ReactECharts option={option} />
      </div>
    );
  }
}

export default Trend;
