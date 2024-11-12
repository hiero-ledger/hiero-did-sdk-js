import { Before, After, BeforeAll, AfterAll, setDefaultTimeout } from '@cucumber/cucumber';
import { startContainers, stopContainers } from './utils/containerUtils';
import { deleteDirectories } from './utils/fileUtils';
import { DIDWorld } from './context';
import * as path from 'path';

const CONFIG_PATH = path.join(__dirname, '../config/hedera/local-node');

setDefaultTimeout(15 * 60 * 1000);

BeforeAll(async () => {
  await deleteDirectories([
    `${CONFIG_PATH}/network_logs/accountBalances`,
    `${CONFIG_PATH}/network_logs/recordStreams`
  ]);

  await startContainers(CONFIG_PATH);
});

AfterAll(async () => {
  await stopContainers();

  await deleteDirectories([
    `${CONFIG_PATH}/network_logs/accountBalances`,
    `${CONFIG_PATH}/network_logs/recordStreams`
  ]);
});

Before(async function (this: DIDWorld) { 
  this.sharedData = {} 
});

After(async function (scenario) {
  this.sharedData = {} 
});