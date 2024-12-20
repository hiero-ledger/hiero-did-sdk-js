import { DataTable, Given, Then, When } from '@cucumber/cucumber';
import { expect } from 'expect';
import { createDID, DIDUpdateOperation, updateDID, UpdateDIDResult} from '@swiss-digital-assets-institute/registrar';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { DIDWorld } from '../../../../support/context';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

function parseUpdateDefinitionFromMatrix(
  didWorld: DIDWorld,
  dataTable: DataTable,
) {
  const data = dataTable.hashes();

  didWorld.sharedData['updateDefinitions'] = data.map((item) => {
    const flattenItem = {
      ...item,
      ...(item.properties &&
        item.properties != '' &&
        JSON.parse(item.properties)),
    };
    // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
    delete flattenItem.properties;
    // eslint-disable-next-line @typescript-eslint/no-unsafe-return
    return flattenItem;
  });
}

function parseUpdateDefinitions(didWorld: DIDWorld, dataTable: DataTable) {
  const data = dataTable.rowsHash();
  const updateDefinitions: DIDUpdateOperation[] = [];

  const updateDefinition = {
    operation: data.operation,
    id: data.id,
    property: data.property,
    publicKeyMultibase: data.publicKeyMultibase,
    ...(data.controller && { controller: data.controller }),
    ...(data.serviceEndpoint && { serviceEndpoint: data.serviceEndpoint }),
  };
  updateDefinitions.push(updateDefinition as DIDUpdateOperation);

  didWorld.sharedData['updateDefinitions'] = updateDefinitions;
}

Given('an existing DID with its current DID Document', async function (this: DIDWorld) {
    const { did, didDocument, privateKey } = await createDID({
      clientOptions: {
        privateKey: this.sharedData['operatorPrivateKey'],
        accountId: this.sharedData['operatorAccountId'],
        network: this.sharedData['network'],
      },
      signer: new Signer(this.sharedData['operatorPrivateKey'] as string),
    });

    this.sharedData['did'] = did;
    this.sharedData['didDocument'] = didDocument;
    this.sharedData['privateKey'] = privateKey;

    await delay(5 * 1000);

  },
);

Given('an update definition:', function (this: DIDWorld, dataTable: DataTable) {
  parseUpdateDefinitions(this, dataTable);
});

Given('an update definitions:', function (this: DIDWorld, dataTable: DataTable) {
    parseUpdateDefinitionFromMatrix(this, dataTable);
});

When('the `updateDID` is called with the SDK Client', function (this: DIDWorld, done) {
    const result: Promise<UpdateDIDResult> = updateDID(
      {
        did: this.sharedData['did'],
        updates: this.sharedData['updateDefinitions'],
      },
      {
        signer: new Signer(this.sharedData['operatorPrivateKey'] as string),
        clientOptions: {
          privateKey: this.sharedData['operatorPrivateKey'],
          accountId: this.sharedData['operatorAccountId'],
          network: this.sharedData['network'],
        },
      },
    );

    result.then((r) => {
      this.sharedData['updatedDid'] = r.did;
      this.sharedData['updatedDidDocument'] = r.didDocument;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      done();
    });
  },
);

When('the `updateDID` is called with the SDK Client and update definition:', function (this: DIDWorld, dataTable: DataTable, done) {
    parseUpdateDefinitions(this, dataTable);

    const defaultSigner = new Signer(
      this.sharedData['operatorPrivateKey'] as string,
    );

    const result: Promise<UpdateDIDResult> = updateDID(
      {
        did: this.sharedData['did'],
        updates: this.sharedData['updateDefinitions'],
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

    result.then((r) => {
      this.sharedData['updatedDid'] = r.did;
      this.sharedData['updatedDidDocument'] = r.didDocument;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      done();
    });
  },
);

When('the `updateDID` is called with the SDK Client and update definitions:', function (this: DIDWorld, dataTable, done) {
    parseUpdateDefinitionFromMatrix(this, dataTable);

    const defaultSigner = new Signer(
      this.sharedData['operatorPrivateKey'] as string,
    );

    const result: Promise<UpdateDIDResult> = updateDID(
      {
        did: this.sharedData['did'],
        updates: this.sharedData['updateDefinitions'],
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

    result.then((r) => {
      this.sharedData['updatedDid'] = r.did;
      this.sharedData['updatedDidDocument'] = r.didDocument;
      // eslint-disable-next-line @typescript-eslint/no-unsafe-call
      done();
    });
  },
);

Then('the function should return updated DID Document', async function (this: DIDWorld) {
    const did: string = this.sharedData['updatedDid'];
    const signer = new Signer(this.sharedData['operatorPrivateKey'] as string);

    await delay(5 * 1000);
    this.sharedData['updatedDidDocument'] = await resolveDID(
      did,
      'application/did+ld+json',
      { verifier: signer },
    );

    expect(this.sharedData['updatedDidDocument']).not.toBeNull();
  },
);

Then('the DID Document includes verification method with the definition:', function (this: DIDWorld, dataTable) {
    const data = dataTable.rowsHash();
    const definition = {
      id: data.id,
      type: data.type,
      publicKeyMultibase: data.publicKeyMultibase,
      ...(data.controller && { controller: data.controller }),
    };

    const verificationMethods = [
      ...(this.sharedData['updatedDidDocument'].verificationMethod || []),
      ...(this.sharedData['updatedDidDocument'].capabilityDelegation || []),
      ...(this.sharedData['updatedDidDocument'].authentication || []),
      ...(this.sharedData['updatedDidDocument'].assertionMethod || []),
      ...(this.sharedData['updatedDidDocument'].keyAgreement || []),
      ...(this.sharedData['updatedDidDocument'].capabilityInvocation || []),
    ];
    const verificationMethod = verificationMethods.find((veryficaitonMethod: any) =>  veryficaitonMethod.id === `${this.sharedData['updatedDidDocument'].id}${definition.id}`);

    expect(verificationMethod).not.toBeNull();
    expect(verificationMethod.type).toEqual(definition.type);
    expect(verificationMethod.publicKeyMultibase).toEqual(definition.publicKeyMultibase);
  },
);

Then('the DID Document includes service with the definition:', function (this: DIDWorld, dataTable) {
    const data = dataTable.rowsHash();
    const definition = {
      id: data.id,
      serviceEndpoint: data.serviceEndpoint,
    };

    const services = this.sharedData['updatedDidDocument'].service || [];
    const service = services.find((service: any) => service.id === `${this.sharedData['updatedDidDocument'].id}${definition.id}`);

    expect(service).not.toBeNull();
    expect(service.serviceEndpoint).toEqual(definition.serviceEndpoint);
  },
);

Then('the DID Document includes verification method with id {string}', function (this: DIDWorld, id: string) {
    const verificationMethods = [
      ...(this.sharedData['updatedDidDocument'].verificationMethod || []),
      ...(this.sharedData['updatedDidDocument'].capabilityDelegation || []),
      ...(this.sharedData['updatedDidDocument'].authentication || []),
      ...(this.sharedData['updatedDidDocument'].assertionMethod || []),
      ...(this.sharedData['updatedDidDocument'].keyAgreement || []),
      ...(this.sharedData['updatedDidDocument'].capabilityInvocation || []),
    ];
    const verificationMethodExists = verificationMethods.some((veryficationMethod) =>  veryficationMethod.id === `${this.sharedData['updatedDidDocument'].id}${id}`);

    expect(verificationMethodExists).toBe(true);
  },
);

Then('the DID Document does include service with id {string}',  async function (this: DIDWorld, id: string) {
    const services = this.sharedData['updatedDidDocument'].service || [];
    const serviceExists = services.some((service: any) => service.id === `${this.sharedData['updatedDidDocument'].id}${id}`);

    expect(serviceExists).toBe(true);
  },
);

Then('the DID Document does not include service with id {string}', async function (this: DIDWorld, id: string) {
    const services = this.sharedData['updatedDidDocument'].service || [];
    const serviceExists = services.some(
      (service: any) =>
        service.id === `${this.sharedData['updatedDidDocument'].id}${id}`,
    );
    expect(serviceExists).not.toBe(true);
  },
);
