import React from 'react';
import { Component } from 'react';
import { Link, Redirect } from 'react-router-dom';
import styles from './ConfiguratorStyle.css';
import config from '../config';
import '../App.global.css';
import delete_icon from '../../assets/delete.svg'

const { remote, ipcRenderer } = require('electron');
const win = remote.getCurrentWindow();

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
      <div className={styles['container']}>
        <div className={styles['title']}>Add Pair
          <span className={styles['close-btn']} onClick={this.close}/>
        </div>
        <div className={styles['input-box']}>
          <input className={styles['input']} ref='pairInput'/>
          <div className={styles['add-btn']} onClick={this.addPair}>Add</div>
        </div>
        <div className={styles['pair-list']}>
          {
            pairs.map(pair => (
              <>
              <div className={styles['pair-item']}>
                <span className={styles['pair']}>{pair}</span>
                <img className={styles['delete-icon']} src={delete_icon} onClick={() => this.deletePair(pair)}/>
              </div>
              <div className={styles['line']}/>
              </>
            ))
          }
        </div>
      </div>
    );
  }
}

export default Monitor;
