import { Given, When, Then } from '@cucumber/cucumber';
import { expect } from 'expect';
import { createDID } from '@swiss-digital-assets-institute/registrar';
import { DIDWorld } from '../../../../support/context';
import * as Ajv from 'ajv';
import * as fs from 'fs';
import * as path from 'path';

Given('a SDK Client instance is set with a operator private key {string} and account ID {string} on {string}', async function (this: DIDWorld, privateKey: string, accountId: string, network: string) {
    this.sharedData['operatorPrivateKey'] = privateKey;
    this.sharedData['operatorAccountId'] = accountId;
    this.sharedData['network'] = network;
});

Given('a private key in DER format: {string}', async function (this: DIDWorld, privateKey: string) {
    this.sharedData['privateKey'] = privateKey;
});

When('the `createDID` is called with the SDK Client', async function (this: DIDWorld) {
    const { did, didDocument, privateKey } = await createDID({
        clientOptions: {
            privateKey: this.sharedData['operatorPrivateKey'],
            accountId: this.sharedData['operatorAccountId'],
            network: this.sharedData['network'],
        },
    });

    this.sharedData['did'] = did;
    this.sharedData['didDocument'] = didDocument;
    this.sharedData['privateKey'] = privateKey;
});

When('the `createDID` is called with the private key and the SDK Client', async function (this: DIDWorld) {
    if (!this.sharedData['privateKey']) {
        const { did, didDocument, privateKey } = await createDID({
            clientOptions: {
                privateKey: this.sharedData['operatorPrivateKey'],
                accountId: this.sharedData['operatorAccountId'],
                network: this.sharedData['network'],
            },
        });

        this.sharedData['did'] = did;
        this.sharedData['didDocument'] = didDocument;
        this.sharedData['privateKey'] = privateKey;
    } else {
        const { did, didDocument } = await createDID({
            privateKey: this.sharedData['privateKey']
        }, {
            clientOptions: {
                privateKey: this.sharedData['operatorPrivateKey'],
                accountId: this.sharedData['operatorAccountId'],
                network: this.sharedData['network'],
            }
        });

        this.sharedData['did'] = did;
        this.sharedData['didDocument'] = didDocument;
    }
});

Then('the function should return a newly created DID and its DID Document', async function (this: DIDWorld) {
    expect(this.sharedData['did']).not.toBeNull();
    expect(this.sharedData['didDocument']).not.toBeNull();
});

Then('the function should return a newly created DID, its DID Document and Private Key', async function (this: DIDWorld) {
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

