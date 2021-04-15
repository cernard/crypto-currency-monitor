import React from 'react';
import { Component } from 'react';
import styles from './TrendStyle.css';
import '../App.global.css';
import config from '../config';
import ReactECharts from 'echarts-for-react';
import * as echarts from 'echarts';
import "echarts/lib/component/graphic";

const avgPriceAPI = 'https://api.binance.com/api/v3/avgPrice';
const kLineDataAPI = 'https://api.binance.com/api/v3/klines';
const priceChangeIn24HAPI = 'https://api.binance.com/api/v3/ticker/24hr';

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();
class Trend extends Component {
  state = {
    option: {
      grid: {
        left: 0,
        top: 0,
        right: 0,
        bottom: 0
      },
      xAxis: {
          type: 'category',
          data: [],
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
          data: [],
          type: 'line',
          // itemStyle: {
          //     opacity: 0
          // },
          lineStyle: {
              color: 'rgba(238, 205, 73, 100)'
          },
          areaStyle: {
              color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[{
                       offset: 0, color: 'rgb(235, 208, 100)' // 0% 处的颜色
                       },{
                           offset: 0.55, color: 'rgb(0, 0, 0, 0)' // 100% 处的颜色
                       }]
           )
          }
      }],
      tooltip: {
        show: true,
        formatter: (param: any, ticket: string, callback: Function) => {
          return parseFloat(param.value).toFixed(0) + ' $'
        },
        padding: 0,
        backgroundColor: 'transparent',
        borderWidth: 0,
        textStyle: {
            color: 'rgba(238, 205, 73, 100)',
            fontSize: 12
        },
        extraCssText: 'box-shadow: 0 0 0px rgba(0, 0, 0, 0);',
        position: ([x, y]) => {
          return [x + 10, y + 10]
        }
      }
    },
    pair: 'BTC/USDT',
    price: 0,
    changePercentIn24H: '0'
  };

  priceInterval: any = null;
  kDataInterval: any = null;
  priceChangeIn24HInterval: any = null;

  constructor(props: any) {
    super(props);
    ipcRenderer.on('updatePair', (event, pair) => {
      if (this.state.pair !== pair) {
        this.setState({...this.state, pair: pair});

        clearInterval(this.priceInterval);
        clearInterval(this.kDataInterval);
        clearInterval(this.priceChangeIn24HInterval);

        console.log(pair);
        this.updatePrice(pair);
        this.updateTrend(pair);
        this.updateChangePercent(pair);

        this.priceInterval = setInterval(() => this.updatePrice(pair), 2000);
        this.kDataInterval = setInterval(() => this.updateTrend(pair), 2000);
        this.priceChangeIn24HInterval = setInterval(() => this.updateChangePercent(pair), 2000);
      }
    });

    ipcRenderer.on('stopUpdate', () => {
      clearInterval(this.priceInterval);
      clearInterval(this.kDataInterval);
      clearInterval(this.priceChangeIn24HInterval);
    });
  }

  updatePrice = (pair: string) => {
    fetch(avgPriceAPI + '?symbol=' + pair.toUpperCase().replace('/', ''))
    .then(rep => rep.json())
    .then(data => {
      this.setState({price: parseFloat(data['price']).toFixed(0)});
    })
    .catch(e => console.log(e));
  }

  updateTrend = (pair: string) => {
    let option = JSON.parse(JSON.stringify(this.state.option));
    const now = Date.now();
    const OneHourAgo = now - 86400000;
    console.log(OneHourAgo)
    fetch(kLineDataAPI + '?symbol=' + pair.toUpperCase().replace('/', '') + '&interval=1h' + `&startTime=${1618045200000}&endTime=${now}`)
    .then(rep => rep.json())
    .then(data => {
      option.xAxis.data = data.map(d => 0);
      option.series = [];
      option.series[0] = {
        data: data.map(d => d[1]),
        type: 'line',
        itemStyle: {
            opacity: 0
        },
        lineStyle: {
            color: 'rgba(238, 205, 73, 100)'
        },
        areaStyle: {
            color: new echarts.graphic.LinearGradient(0, 0, 0, 1,[{
                     offset: 0, color: 'rgb(235, 208, 100)' // 0% 处的颜色
                     },{
                         offset: 0.55, color: 'rgb(0, 0, 0, 0)' // 100% 处的颜色
                     }]
         )
        }
      };
      this.setState({...this.state, option})
    })
    .catch(e => console.log(e));
  }

  updateChangePercent = (pair: string) => {
    fetch(priceChangeIn24HAPI + '?symbol=' + pair.replace('/', ''))
    .then(rep => rep.json())
    .then(data => {
      this.setState({...this.state, changePercentIn24H: data['priceChangePercent'] + '%'})
    })
    .catch(e => console.log(e));
  }

  render() {
    const { option = {}, price, changePercentIn24H } = this.state;
    return (
      <div className={styles['box']}>
        <div className={styles['title']}>Last 24H Trend</div>
        <ReactECharts option={option} className={styles['trend-chart']}/>
        <div className={styles['info-bar']}>
          <span>
            <span className={styles['info-bar-price']}>{price}</span>
            <span>$</span>
          </span>
          <span className={styles['info-bar-upanddown']} style={{color: changePercentIn24H.indexOf('-') >= 0 ? 'rgb(231, 90, 112)': 'rgba(41, 209, 143, 100)'}}>{changePercentIn24H}</span>
        </div>
      </div>
    );
  }
}

export default Trend;
