import React from 'react';
import { render } from 'react-dom';
import App from './App';
import Monitor from './Monitor';
import config from '../config';

const electron = require('electron');
const { remote, ipcRenderer } = electron;

let win = remote.getCurrentWindow();
let biasX = 0;
let biasY = 0;

document.addEventListener('mousedown', e => {
  switch (e.button) {
    case 0:
        biasX = e.x;
        biasY = e.y;
        document.addEventListener('mousemove', moveEvent);
        break;
    case 2:
        ipcRenderer.send('createSuspensionMenu');
        break;
  }
});

document.addEventListener('mouseup', () => {
  biasX = 0;
  biasY = 0;
  document.removeEventListener('mousemove', moveEvent)
});

const moveEvent = (e: MouseEvent) => {
  const [width, height] = win.getSize();
  win.setBounds({ x: e.screenX - biasX, y: e.screenY - biasY, width: width, height: height })
}

render(<Monitor />, document.getElementById('root'));
