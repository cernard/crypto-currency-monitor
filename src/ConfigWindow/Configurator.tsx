import React from 'react';
import { Component } from 'react';
import config from '../config';
import '../App.global.css';
import './ConfiguratorStyle.css';

const { ipcRenderer } = require('electron');
class Monitor extends Component {
  state = {
    pairs: []
  }

  constructor(props) {
    super(props);
    // win.setSize(100, 100)
  }

  componentDidMount() {
    ipcRenderer.send('loadConfig');
    ipcRenderer.on('reciveConfig', (_, args) => {
      const configJson = JSON.parse(args);
      if (configJson['pairs'] == null) {
        this.setState({...this.state, pairs: [] });
      } else {
        this.setState({...this.state, pairs: configJson['pairs']});
      }
    });
  }

  close = () => {
    ipcRenderer.send('hideConfigWindow');
  }

  addPair = () => {
    const pair: string = this.refs.pairInput.value;

    const pairs: string[] = this.state.pairs.slice();
    if (!pairs.includes(pair)) {
      pairs.push(pair);
    }
    this.setState({...this.state, pairs}, () => console.log('state', this.state));

    config.pairs = pairs;
    ipcRenderer.send('saveConfig', config);
    this.refs.pairInput.value = "";
  }

  deletePair = (pair: string) => {
    let pairs: string[] = this.state.pairs.slice();
    const pairIndex: number = pairs.indexOf(pair);
    pairs.splice(pairIndex, 1);
    this.setState({...this.state, pairs});

    config.pairs = pairs;
    ipcRenderer.send('saveConfig', config);
  }

  render() {
    const { pairs } = this.state;
    return (
      <div className='container'>
        <div className='title'>Add Pair
          <span className='close-btn' onClick={this.close}/>
        </div>
        <div className='input-box'>
          <input className='input' ref='pairInput'/>
          <div className='add-btn' onClick={this.addPair}>Add</div>
        </div>
        <div className='pair-list'>
          {
            pairs.map(pair => (
              <>
              <div className='pair-item'>
                <span className='pair'>{pair}</span>
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

export default Monitor;
