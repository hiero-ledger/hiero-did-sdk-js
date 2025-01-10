import {
  Before,
  After,
  BeforeAll,
  AfterAll,
  setDefaultTimeout,
} from '@cucumber/cucumber';
import { startContainers, stopContainers } from './utils/container-utils';
import { deleteDirectories } from './utils/file-utils';
import { DIDWorld } from './context';
import * as path from 'path';

const CONFIG_PATH = path.join(__dirname, '../config/hedera/local-node');

setDefaultTimeout(15 * 60 * 1000);

BeforeAll(async () => {
  const spinNode = process.env.SPIN_NODE || false;

  if (spinNode) {
    await deleteDirectories([
      `${CONFIG_PATH}/network_logs/accountBalances`,
      `${CONFIG_PATH}/network_logs/recordStreams`,
    ]);

    await startContainers(CONFIG_PATH);
  }
});

AfterAll(async () => {
  const spinNode = process.env.SPIN_NODE || false;

  if (spinNode) {
    await stopContainers();

    await deleteDirectories([
      `${CONFIG_PATH}/network_logs/accountBalances`,
      `${CONFIG_PATH}/network_logs/recordStreams`,
    ]);
  }
});

Before(function (this: DIDWorld) {
  this.sharedData = {};
});

After(function () {
  this.sharedData = {};
});
