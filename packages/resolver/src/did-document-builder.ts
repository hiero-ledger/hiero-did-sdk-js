import {
  Service,
  VerificationMethod,
  Verifier,
  DIDDocument,
  KeysUtility,
  RelationShipProperties,
  DIDResolution,
  JsonLdDIDDocument,
  DIDResolutionMetadata,
  DIDDocumentMetadata,
  isHederaDID,
  CborCodec,
  DIDError,
  DID_ROOT_KEY_ID,
} from '@hiero-did-sdk/core';
import { Verifier as InternalVerifier } from '@hiero-did-sdk/verifier-internal';
import { PublicKey } from '@hashgraph/sdk';
import {
  TopicDIDContent,
  TopicDIDMessage,
  DIDEvent,
  AddVerificationMethodEvent,
  AddVerificationRelationshipMethodEvent,
  AddServiceEvent,
  DIDOwnerEvent,
  RemoveVerificationMethodEvent,
  RemoveServiceEvent,
  RemoveVerificationRelationshipMethodEvent,
} from './interfaces';
import { isDIDMessageEvent } from './validators/is-did-message-event';
import { isJsonString } from './validators/is-json';
import { isDIDMessage } from './validators/is-did-message';
import { Buffer } from 'buffer';

/**
 * A class to build a DID Document from a list of messages
 */
export class DidDocumentBuilder {
  private did: string;
  private verifier: Verifier;

  private createdAt?: Date;
  private updatedAt?: Date;
  private deactivated = false;
  private controller: string;
  private service = new Map<string, Service>();
  private verificationMethod = new Map<string, VerificationMethod>();
  private verificationRelationships = {
    authentication: new Map<string, string | VerificationMethod>(),
    assertionMethod: new Map<string, string | VerificationMethod>(),
    keyAgreement: new Map<string, string | VerificationMethod>(),
    capabilityInvocation: new Map<string, string | VerificationMethod>(),
    capabilityDelegation: new Map<string, string | VerificationMethod>(),
  };

  constructor(private readonly messages: string[]) {}

  forDID(did: string): DidDocumentBuilder {
    if (!isHederaDID(did)) {
      throw new DIDError('invalidDid', 'The DID must be a valid Hedera DID');
    }

    this.did = did;
    return this;
  }

  withVerifier(verifier: Verifier): DidDocumentBuilder {
    this.verifier = verifier;
    return this;
  }

  async build(): Promise<DidDocumentBuilder> {
    if (!this.did) {
      throw new DIDError('internalError', 'The DID is required to build a DID document, call forDID() first');
    }

    let exists = false;

    for (const rawMessage of this.messages) {
      const didMessage = this.parseTopicMessage(rawMessage);

      // Message is not a DID message
      if (!didMessage) {
        continue;
      }

      const { message, signature } = didMessage;

      // Handle deactivate message
      if (message.operation === 'delete') {
        const isSignatureValid = await this.verifySignature(message, signature);
        if (!isSignatureValid) {
          continue;
        }

        this.deactivated = true;

        break;
      }

      const event = this.parseEventString(message.event);

      // Missing valid event object in topic message
      if (!event) {
        continue;
      }

      // Checking if signature is valid
      const isSignatureValid = await this.verifySignature(message, signature);
      if (!isSignatureValid) {
        continue;
      }

      // Handling the event
      if ('DIDOwner' in event) {
        exists = true;
        this.handleDIDOwner(event);

        if (!this.createdAt) {
          this.createdAt = new Date(message.timestamp);
        }
      } else if ('VerificationMethod' in event) {
        if (message.operation === 'update') {
          this.handleAddVerificationMethod(event as AddVerificationMethodEvent);
        }

        if (message.operation === 'revoke') {
          this.handleRemoveVerificationMethod(event);
        }
      } else if ('Service' in event) {
        if (message.operation === 'update') {
          this.handleAddService(event as AddServiceEvent);
        }

        if (message.operation === 'revoke') {
          this.handleRemoveService(event);
        }
      } else if ('VerificationRelationship' in event) {
        if (message.operation === 'update') {
          this.handleAddVerificationRelationship(event as AddVerificationRelationshipMethodEvent);
        }

        if (message.operation === 'revoke') {
          this.handleRemoveVerificationRelationship(event);
        }
      }

      this.updatedAt = new Date(message.timestamp);
    }

    if (!exists) {
      throw new DIDError('notFound', 'The DID document was not found');
    }

    return this;
  }

  toDidDocument(): DIDDocument {
    const didDocument: DIDDocument = {
      id: this.did,
      controller: this.controller ?? this.did,
      verificationMethod: [],
    };

    const propertyMap = {
      service: this.service,
      verificationMethod: this.verificationMethod,
      authentication: this.verificationRelationships.authentication,
      assertionMethod: this.verificationRelationships.assertionMethod,
      keyAgreement: this.verificationRelationships.keyAgreement,
      capabilityInvocation: this.verificationRelationships.capabilityInvocation,
      capabilityDelegation: this.verificationRelationships.capabilityDelegation,
    } as const;

    if (!this.deactivated) {
      for (const property in propertyMap) {
        const values = [...propertyMap[property as keyof typeof propertyMap].values()];
        if (values.length > 0) {
          didDocument[property] = [...values];
        }
      }

      const { id: controllerVerificationMethodId } = didDocument.verificationMethod.find((verificationMethod) =>
        verificationMethod.id.endsWith(DID_ROOT_KEY_ID)
      );

      if (!didDocument.authentication?.includes(controllerVerificationMethodId)) {
        didDocument.authentication = !didDocument.authentication
          ? [controllerVerificationMethodId]
          : [...didDocument.authentication, controllerVerificationMethodId];
      }

      if (!didDocument.assertionMethod?.includes(controllerVerificationMethodId)) {
        didDocument.assertionMethod = !didDocument.assertionMethod
          ? [controllerVerificationMethodId]
          : [...didDocument.assertionMethod, controllerVerificationMethodId];
      }
    }

    return didDocument;
  }

  toJsonLdDIDDocument(): JsonLdDIDDocument {
    const didDocument = this.toDidDocument();
    return {
      '@context': [
        'https://www.w3.org/ns/did/v1',
        'https://w3id.org/security/suites/ed25519-2020/v1',
        'https://w3id.org/security/suites/ed25519-2018/v1',
      ],
      ...didDocument,
    };
  }

  toResolution(): DIDResolution {
    const didDocument: JsonLdDIDDocument = this.toJsonLdDIDDocument();
    const didDocumentMetadata: DIDDocumentMetadata = {
      created: this.createdAt ? this.createdAt.toISOString() : undefined,
      updated: this.updatedAt ? this.updatedAt.toISOString() : undefined,
      deactivated: this.deactivated,
    };

    const didResolutionMetadata: DIDResolutionMetadata = {
      contentType: 'application/ld+json;profile="https://w3id.org/did-resolution"',
    };

    return { didDocument, didDocumentMetadata, didResolutionMetadata };
  }

  toDidDocumentCbor(): Uint8Array {
    return CborCodec.encode(this.toDidDocument());
  }

  private parseTopicMessage(topicMessage: string): TopicDIDContent | undefined {
    if (!topicMessage || !isJsonString(topicMessage)) {
      return undefined;
    }

    const messageObject = JSON.parse(topicMessage);

    if (!isDIDMessage(messageObject)) {
      return undefined;
    }

    const message = messageObject.message;
    const signature = messageObject.signature;

    if (message.did !== this.did) {
      return undefined;
    }

    return { message, signature };
  }

  private parseEventString(eventString: string): DIDEvent | undefined {
    const eventObject = Buffer.from(eventString, 'base64').toString('utf-8');

    if (!isJsonString(eventObject)) {
      return undefined;
    }

    const event = JSON.parse(eventObject);

    if (!isDIDMessageEvent(event)) {
      return undefined;
    }

    if ('DIDOwner' in event) {
      this.setPublicKeyFromDIDOwner(event);
    }

    return event;
  }

  private async verifySignature(message: TopicDIDMessage, signature: string): Promise<boolean> {
    if (!this.verifier) {
      throw new DIDError('internalError', 'Cannot verify signature without a public key or a verifier');
    }

    const messageBytes = Buffer.from(JSON.stringify(message));
    const signatureBytes = Buffer.from(signature, 'base64');

    try {
      return await this.verifier.verify(messageBytes, signatureBytes);
    } catch {
      return false;
    }
  }

  private handleDIDOwner({ DIDOwner }: DIDOwnerEvent): void {
    const verificationMethod = {
      id: `${DIDOwner.id}${DID_ROOT_KEY_ID}`,
      controller: DIDOwner.controller,
      type: 'Ed25519VerificationKey2020',
      publicKeyMultibase: DIDOwner.publicKeyMultibase ?? KeysUtility.fromBase58(DIDOwner.publicKeyBase58).toMultibase(),
    } as const;
    this.controller = DIDOwner.controller;

    this.verificationMethod.set(verificationMethod.id, verificationMethod);
  }

  private handleAddVerificationMethod({ VerificationMethod }: AddVerificationMethodEvent): void {
    this.verificationMethod.set(VerificationMethod.id, VerificationMethod as VerificationMethod);
  }

  private handleRemoveVerificationMethod({ VerificationMethod }: RemoveVerificationMethodEvent): void {
    if (VerificationMethod.id.endsWith(DID_ROOT_KEY_ID)) {
      return;
    }

    this.verificationMethod.delete(VerificationMethod.id);
  }

  private handleAddService({ Service }: AddServiceEvent): void {
    this.service.set(Service.id, Service);
  }

  private handleRemoveService({ Service }: RemoveServiceEvent): void {
    this.service.delete(Service.id);
  }

  private handleAddVerificationRelationship({
    VerificationRelationship,
  }: AddVerificationRelationshipMethodEvent): void {
    const { id, relationshipType, ...rest } = VerificationRelationship;

    const objectToDisplay = this.verificationMethod.has(id)
      ? id
      : ({
          id,
          ...rest,
        } as VerificationMethod);
    this.verificationRelationships[relationshipType].set(id, objectToDisplay);
  }

  private handleRemoveVerificationRelationship({
    VerificationRelationship,
  }: RemoveVerificationRelationshipMethodEvent): void {
    const { id } = VerificationRelationship;

    for (const relationshipType in this.verificationRelationships) {
      const key = relationshipType as RelationShipProperties;
      if (this.verificationRelationships[key].has(id)) {
        this.verificationRelationships[key].delete(id);
        break;
      }
    }
  }

  private setPublicKeyFromDIDOwner(event: DIDOwnerEvent): void {
    let publicKey: PublicKey;
    if (event.DIDOwner.publicKeyMultibase) {
      publicKey = KeysUtility.fromMultibase(event.DIDOwner.publicKeyMultibase).toPublicKey();
    }

    if (event.DIDOwner.publicKeyBase58) {
      publicKey = KeysUtility.fromBase58(event.DIDOwner.publicKeyBase58).toPublicKey();
    }

    if (!publicKey) {
      throw new DIDError('internalError', 'No public key found in `DIDOwner` event');
    }

    this.verifier = new InternalVerifier(publicKey);
  }

  static from(messages: string[]): DidDocumentBuilder {
    const document = new DidDocumentBuilder(messages);

    return document;
  }
}
