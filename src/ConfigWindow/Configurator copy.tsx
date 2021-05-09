import React from 'react';
import { Component } from 'react';
import config from '../config';
import '../App.global.css';
import './ConfiguratorStyle.css';
import { Pair, Currency } from '../Entities';
import log from 'electron-log';
import Store from 'electron-store';
import { remote, ipcRenderer } from 'electron';

const store = new Store();
const { dialog: { showMessageBox } } = remote;

class Configurator extends Component {
  state = {
    pairs: [],
    pair: ''
  }

  constructor(props) {
    super(props);
    // win.setSize(100, 100)
  }

  componentDidMount() {
    ipcRenderer.send('loadConfig');
    ipcRenderer.on('wakeup', () => {
      const pairs: Pair[] = store.get(config.PAIRS);
      this.setState({...this.state, pairs});
    });
  }

  close = () => {
    ipcRenderer.send('hideConfigWindow');
  }

  pairFormatCheck = (pair: string): boolean => {
    const slashCount = pair.split('').filter(c => c === '/').length;
    if (slashCount !== 1) {
      return false;
    }
    return true;
  }

  addPair = () => {
    const { pair } = this.state;

    // check input string is correct or not.
    if (!this.pairFormatCheck(pair)) {
      showMessageBox({
        type:'error',
        title: "Error",
        message: 'Please enter the correct pair format. \nFor example: BTC/USDT, ETH/USDT',
        buttons:['Retry']
      });
      return;
    }

    const pairs: Pair[] = this.state.pairs.slice();
    if (!pairs.map(_pair => `${_pair.secondaryCurrency}/${_pair.baseCurrency}`).includes(pair)) {
      const secondaryCurrency = pair.split('/')[0];
      const baseCurrency = pair.split('/')[1];

      const newPair = new Pair(secondaryCurrency, baseCurrency);
      const newCurrency = new Currency(newPair);
      store.set(newPair.pair, newCurrency)
      pairs.push(newPair);
    }
    this.setState({...this.state, pairs, pair: ''});

    store.set(config.PAIRS, pairs);

    ipcRenderer.send('updateConfig');
  }

  deletePair = (pair: Pair) => {
    let pairs: Pair[] = this.state.pairs.slice();
    const pairIndex: number = pairs.indexOf(pair);
    pairs.splice(pairIndex, 1);
    this.setState({...this.state, pairs});

    store.set(config.PAIRS, pairs);
  }

  onInputChange = ({target: { value = '' }}) => {
    this.setState({pair: value.toUpperCase()});
  }

  changePurchasePrice = (pair: Pair, {target: { value = '' }}) => {
    const pairs: Pair[] = this.state.pairs.slice();
    let p = pairs.find(_p => _p.pair === pair.pair);
    log.info(p)
    if (p) {
      p.purchasePrice = parseFloat(value);
    }
    this.setState({pairs});
    store.set(config.PAIRS, pairs);
  }

  render() {
    const { pairs, pair } = this.state;
    return (
      <div className='container'>
        <div className='title'>Add Pair
          <span className='close-btn' onClick={this.close}/>
        </div>
        <div className='input-box'>
          <input className='input' placeholder='e.g. BTC/USDT' value={pair} onChange={this.onInputChange}/>
          <div className='add-btn' onClick={this.addPair}>Add</div>
        </div>
        <div className='pair-list'>
          {
            pairs.map((pair: Pair) => (
              <>
              <div className='pair-item'>
                <span className='pair-box'>
                  <div className='pair'>{pair.secondaryCurrency}/{pair.baseCurrency}</div>
                  <div className='price-box'>
                    <span className='purchase-price-label'>Purchase price:</span>
                    <input className='price-input' type='number' value={pair.purchasePrice} onChange={e => this.changePurchasePrice(pair, e)} />
                  </div>
                </span>
                <img className='delete-icon' src='../../assets/delete.svg' onClick={() => this.deletePair(pair)}/>
              </div>
              <div className='line'/>
              </>
            ))
          }
        </div>
      </div>
    );
  }
}

export default Configurator;
