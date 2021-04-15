// Check if the renderer and main bundles are built
import path from 'path';
import chalk from 'chalk';
import fs from 'fs';

// const mainPath = path.join(__dirname, '../../src/main.prod.js');
const ConfigWindow = getRendererPath('ConfigWindow');
const MonitorWindow = getRendererPath('MonitorWindow');
const TrendWindow = getRendererPath('TrendWindow');

if (!fs.existsSync(mainPath)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The main process is not built yet. Build it by running "yarn build:main"'
    )
  );
}

if (!fs.existsSync(ConfigWindow)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The ConfigWindow renderer process is not built yet. Build it by running "yarn build:renderer"'
    )
  );
}

if (!fs.existsSync(MonitorWindow)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The MonitorWindow renderer process is not built yet. Build it by running "yarn build:renderer"'
    )
  );
}

if (!fs.existsSync(TrendWindow)) {
  throw new Error(
    chalk.whiteBright.bgRed.bold(
      'The MonitorWindow renderer process is not built yet. Build it by running "yarn build:renderer"'
    )
  );
}
