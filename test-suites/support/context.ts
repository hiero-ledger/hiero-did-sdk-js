import { World } from '@cucumber/cucumber';

export interface DIDWorld extends World {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  sharedData: Record<string, any>;
}
