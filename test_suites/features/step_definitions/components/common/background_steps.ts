import { Given } from '@cucumber/cucumber';
import { DIDWorld } from '../../../../support/context';

Given('a SDK Client instance is set with a operator private key {string} and account ID {string} on {string}', function (this: DIDWorld, privateKey: string, accountId: string, network: string) {
    this.sharedData['operatorPrivateKey'] = privateKey;
    this.sharedData['operatorAccountId'] = accountId;
    this.sharedData['network'] = network;
});
