import { startContainers, stopContainers } from './support/utils/containerUtils';
import { deleteDirectories } from './support/utils/fileUtils';
import * as path from 'path';

const CONFIG_PATH = path.join(__dirname, './config/hedera/local-node');

async function startLocalHederaNode() {
  console.log('Starting Hedera Local Node containers...');

  await deleteDirectories([
    `${CONFIG_PATH}/network_logs/accountBalances`,
    `${CONFIG_PATH}/network_logs/recordStreams`
  ]);

  await startContainers(CONFIG_PATH);

  console.log('Started Hedera Local Node containers...done.')

  // Handle graceful shutdown
  const handleExit = async (signal: string) => {
    console.log(`Received ${signal}. Stopping Hedera Local Node containers...`);
    try {
      await stopContainers();
      await deleteDirectories([
        `${CONFIG_PATH}/network_logs/accountBalances`,
        `${CONFIG_PATH}/network_logs/recordStreams`
      ]);
      process.exit(0);
    } catch (error) {
      console.error('Error stopping Hedera Local Node containers:', error);
      process.exit(1);
    }
  };

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGINT', () => handleExit('SIGINT'));

  // eslint-disable-next-line @typescript-eslint/no-misused-promises
  process.on('SIGTERM', () => handleExit('SIGTERM'));

  // Keep the process alive indefinitely
  setInterval(() => { }, 1000);
}

startLocalHederaNode().catch((error) => {
  console.error('An error occurred:', error);
  process.exit(1);
});
