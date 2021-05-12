/* eslint-disable react/button-has-type */
import React, { useState } from 'react';
import { Spin, Modal, Collapse, Input } from 'antd';
import EditableTable from './EditableTable';
import Store from 'electron-store';
import '../App.global.css';
import './ConfiguratorStyle.css';

const store = new Store();

const { Panel } = Collapse;
const DonatePanelContent = (
  <Collapse defaultActiveKey={['1']} accordion>
    <Panel header="Payment via BTC" key="1">
      <p>
        BTC wallet address: <Input value="1PtbtEsB6NPQjLdoXsScTjbkfHtwzJ7hrR" />
      </p>
    </Panel>
    <Panel header="Payment via Doge" key="2">
      <p>
        Doge wallet address:{' '}
        <Input value="DFttbRCZY71hShWR4GRoZjgRNku5878TAd" />
      </p>
    </Panel>
    <Panel header="Payment via Alipay" key="3">
      <img src="../../assets/alipay.png" width={200} alt="alipay qrcode" />
    </Panel>
    <Panel header="Payment via WeChat" key="4">
      <img src="../../assets/wechat.png" width={200} alt="wechat qrcode" />
    </Panel>
  </Collapse>
);

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
      <button
          className="btn btn-default"
          style={{ marginRight: 10 }}
          onClick={() =>
            store.clear()
          }
        >
          Clean data
        </button>
        <button
          className="btn btn-positive"
          style={{ marginRight: 10 }}
          onClick={() =>
            Modal.confirm({
              title: 'Donate',
              content: DonatePanelContent,
              okText: 'Ok',
              cancelText: 'Cancel',
              width: 500,
            })
          }
        >
          Donate
        </button>
        <button className="btn btn-default">
          <Spin size="small">Check update</Spin>
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
  return (
    <div
      style={{
        height: '100%',
        width: '100%',
        textAlign: 'center',
        color: 'black',
      }}
    >
      <h3>Coming soon</h3>
      <p>
        Exchange setting allows you to set the exchange key so that the program
        can automatically obtain the cryptocurrency information of your account
        and monitor it. These operations are safe. You can compile the software
        from GitHub code by yourself.
      </p>
    </div>
  );
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
    default:
      renderPanel = renderMonitorSettingPanel();
  }

  return (
    <div className="window">
      <div className="window-content">
        <div className="pane-group">
          <div className="pane-sm sidebar">
            <nav className="nav-group">
              <h5 className="nav-group-title">Preferences</h5>
              <span
                role="button"
                className={`nav-group-item ${
                  panel === PANEL.MONITOR_SETTING_PANEL ? 'active' : ''
                }`}
                onClick={() => setPanel(PANEL.MONITOR_SETTING_PANEL)}
                onKeyPress={() => setPanel(PANEL.MONITOR_SETTING_PANEL)}
                tabIndex={0}
              >
                <span className="icon-iconfonts icon-ccm-monitor" />
                Monitor Setting
              </span>
              <span
                role="button"
                className={`nav-group-item ${
                  panel === PANEL.EXCHANGES_SETTING_PANEL ? 'active' : ''
                }`}
                onClick={() => setPanel(PANEL.EXCHANGES_SETTING_PANEL)}
                onKeyDown={() => setPanel(PANEL.EXCHANGES_SETTING_PANEL)}
                tabIndex={0}
              >
                <span className="icon-iconfonts icon-ccm-exchange" />
                Exchanges Setting
              </span>
              <span
                role="button"
                className={`nav-group-item ${
                  panel === PANEL.ABOUT_PANEL ? 'active' : ''
                }`}
                onClick={() => setPanel(PANEL.ABOUT_PANEL)}
                onKeyDown={() => setPanel(PANEL.ABOUT_PANEL)}
                tabIndex={0}
              >
                <span className="icon-iconfonts icon-ccm-about" />
                About
              </span>
            </nav>
          </div>
          <div className="pane">{renderPanel}</div>
        </div>
      </div>
    </div>
  );
}

export default Configurator;
