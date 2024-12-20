import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect';
import { createDID } from '@swiss-digital-assets-institute/registrar';
import { DIDWorld } from '../../../../support/context';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';
import { PrivateKey } from '@hashgraph/sdk';
import * as Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';
import { basicCreateDID } from '../../../../support/common';

Given('a private key in DER format {string}', function (this: DIDWorld, privateKey: string) {
    this.sharedData['privateKey'] = privateKey;
});

When('the `createDID` is called with the SDK Client', async function (this: DIDWorld) {
    await basicCreateDID(this);
});

When('the `createDID` is called with the private key and the SDK Client', async function (this: DIDWorld) {
    if (!this.sharedData['privateKey']) {
        await basicCreateDID(this);
    } else {
        try {
            const { did, didDocument } = await createDID({
                privateKey: this.sharedData['privateKey']
            }, {
                signer:  new Signer(this.sharedData['privateKey'] as string),
                clientOptions: {
                    privateKey: this.sharedData['operatorPrivateKey'],
                    accountId: this.sharedData['operatorAccountId'],
                    network: this.sharedData['network'],
                }
            });

            this.sharedData['did'] = did;
            this.sharedData['didDocument'] = didDocument;
        } catch (error) {
            // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
            this.sharedData['error'] = error.message;
        }
    }
});

Given('an instance of PrivateKey class initiated using given private key {string}', function (this: DIDWorld, pk: string) {
    this.sharedData['privateKey'] = PrivateKey.fromStringDer(pk);
});

Then('the function should return a newly created DID and its DID Document', function (this: DIDWorld) {
    expect(this.sharedData['did']).not.toBeNull();
    expect(this.sharedData['didDocument']).not.toBeNull();
});

Then('the function should return a newly created DID, its DID Document and Private Key', function (this: DIDWorld) {
    expect(this.sharedData['did']).not.toBeNull();
    expect(this.sharedData['didDocument']).not.toBeNull();
    expect(this.sharedData['privateKey']).not.toBeNull();
});

Then('the DID should conform to {string}', function (this: DIDWorld, schemaFile: string) {
    const schemaPath = path.join(__dirname, '../../../../support/data', schemaFile)
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
    const ajv = new Ajv.Ajv();
    const validate = ajv.compile(schema);

    return expect(validate(this.sharedData['did'])).toBeTruthy();
});

Then('the DID Document should conform to {string}', function (this: DIDWorld, schemaFile: string) {
    const schemaPath = path.join(__dirname, '../../../../support/data', schemaFile)
    const schema = JSON.parse(fs.readFileSync(schemaPath, 'utf-8'))
    const ajv = new Ajv.Ajv();
    const validate = ajv.compile(schema);

    return expect(validate(this.sharedData['didDocument'])).toBeTruthy();
});

Then('an {string} should be thrown', function (this: DIDWorld, error: string) {
    return expect(this.sharedData['error']).toEqual(error);
});

Then('an exception should be thrown', function (this: DIDWorld) {
    return expect(this.sharedData['error']).not.toBeNull();
});
