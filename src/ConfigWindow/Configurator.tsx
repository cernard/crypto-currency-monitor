/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { Spin } from 'antd';
import EditableTable from './EditableTable';
import '../App.global.css';
import './ConfiguratorStyle.css';

function renderAboutPanel() {
  return (
    <div className="about-pane">
      <div className="paragraph">
        <h4>Crypto Currency Monitor</h4>
        <div>version: 0.1.0</div>
      </div>
      <div className="paragraph">
        <div>Author: Cernard</div>
        <div>
          Github:{' '}
          <a href="https://github.com/cernard" target="_blank" rel="noreferrer">
            https://github.com/cernard
          </a>
        </div>
        <div>
          Project Github:{' '}
          <a
            href="https://github.com/cernard/crypto-currency-monitor"
            target="_blank"
            rel="noreferrer"
          >
            https://github.com/cernard/crypto-currency-monitor
          </a>
        </div>
        <div>
          <i>If you like it, please star it.</i>
        </div>
      </div>
      <div className="paragraph">
        <button className="btn btn-positive" style={{ marginRight: 10 }}>
          Donate
        </button>
        <button className="btn btn-default">
          <Spin size='small'>
            Check update
          </Spin>
        </button>
      </div>
    </div>
  );
}

function renderMonitorSettingPanel() {
  return (
    <div className="monitor-setting-pane">
      <EditableTable />
    </div>
  );
}

function renderExchangesSettingPanel() {
  return <></>;
}

enum PANEL {
  MONITOR_SETTING_PANEL,
  EXCHANGES_SETTING_PANEL,
  ABOUT_PANEL,
}

function Configurator() {
  const [panel, setPanel] = useState(PANEL.MONITOR_SETTING_PANEL);
  let renderPanel = null;
  switch (panel) {
    case PANEL.MONITOR_SETTING_PANEL:
      renderPanel = renderMonitorSettingPanel();
      break;
    case PANEL.EXCHANGES_SETTING_PANEL:
      renderPanel = renderExchangesSettingPanel();
      break;
    case PANEL.ABOUT_PANEL:
      renderPanel = renderAboutPanel();
      break;
  }

  return (
    <div className="window">
      <div className="window-content">
        <div className="pane-group">
          <div className="pane-sm sidebar">
            <nav className="nav-group">
              <h5 className="nav-group-title">Preferences</h5>
              <span
                className={`nav-group-item ${panel === PANEL.MONITOR_SETTING_PANEL ? 'active': ''}`}
                onClick={() => setPanel(PANEL.MONITOR_SETTING_PANEL)}
              >
                <span className="icon-iconfonts icon-ccm-monitor" />
                Monitor Setting
              </span>
              <span
                className={`nav-group-item ${panel === PANEL.EXCHANGES_SETTING_PANEL ? 'active': ''}`}
                onClick={() => setPanel(PANEL.EXCHANGES_SETTING_PANEL)}
              >
                <span className="icon-iconfonts icon-ccm-exchange" />
                Exchanges Setting
              </span>
              <span
                className={`nav-group-item ${panel === PANEL.ABOUT_PANEL ? 'active': ''}`}
                onClick={() => setPanel(PANEL.ABOUT_PANEL)}
              >
                <span className="icon-iconfonts icon-ccm-about" />
                About
              </span>
            </nav>
          </div>
          <div className="pane">
            { renderPanel }
          </div>
        </div>
      </div>
    </div>
  );
}

export default Configurator;
