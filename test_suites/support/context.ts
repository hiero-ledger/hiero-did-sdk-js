import { World } from '@cucumber/cucumber';

export interface DIDWorld extends World {
    sharedData: Record<string, any>;
}
