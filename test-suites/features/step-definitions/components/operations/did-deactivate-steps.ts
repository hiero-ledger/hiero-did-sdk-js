/* eslint-disable @typescript-eslint/no-unsafe-member-access */
import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect';
import {
  deactivateDID,
  DeactivateDIDResult,
} from '@swiss-digital-assets-institute/registrar';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { DIDWorld } from '../../../../support/context';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

When(
  'the `deactivateDID` is called with the SDK Client',
  function (this: DIDWorld, done) {
    const defaultSigner = new Signer(
      this.sharedData['operatorPrivateKey'] as string,
    );

    const result: Promise<DeactivateDIDResult> = deactivateDID(
      {
        did: this.sharedData['did'],
      },
      {
        signer: defaultSigner,
        clientOptions: {
          privateKey: this.sharedData['operatorPrivateKey'],
          accountId: this.sharedData['operatorAccountId'],
          network: this.sharedData['network'],
        },
      },
    );

    result
      .then((r) => {
        this.sharedData['deactivatedDid'] = r.did;
        this.sharedData['deactivatedDidDocument'] = r.didDocument;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        done();
      })
      .catch((e) => {
        this.sharedData['error'] = e.message;
        // eslint-disable-next-line @typescript-eslint/no-unsafe-call
        done();
      });
  },
);

Then(
  'the function should return deactivated DID Document',
  async function (this: DIDWorld) {
    const did: string = this.sharedData['deactivatedDid'];
    const signer = new Signer(this.sharedData['operatorPrivateKey'] as string);

    await delay(5 * 1000);
    this.sharedData['deactivatedDidDocument'] = await resolveDID(
      did,
      'application/did+json',
      { verifier: signer },
    );

    expect(this.sharedData['deactivatedDidDocument']).not.toBeNull();
    expect(
      this.sharedData['deactivatedDidDocument'].verificationMethod,
    ).toHaveLength(0);
  },
);

Given(
  'an non existing DID with its non existing DID Document',
  function (this: DIDWorld) {
    this.sharedData['did'] =
      'did:hedera:local-node:icSQUreA6LXir7aJq5wnnwQmjcmyGffwNfmEM48Ec4Z_0.0.0000';
  },
);
