import { 
  Before, 
  After, 
  BeforeAll, 
  AfterAll, 
  setDefaultTimeout } from '@cucumber/cucumber';
import { startContainers, stopContainers } from './utils/containerUtils';
import { deleteDirectories } from './utils/fileUtils';
import path from 'path';
import { purgeReceivedMessages } from './utils/hederaUtils';

const CONFIG_PATH = __dirname;

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

Before(async () => {
});

After(async function (scenario) {
  purgeReceivedMessages();
});