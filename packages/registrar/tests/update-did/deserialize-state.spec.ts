import {
  DIDAddServiceMessage,
  DIDAddVerificationMethodMessage,
  DIDRemoveServiceMessage,
  DIDRemoveVerificationMethodMessage,
} from '@hiero-did-sdk/messages';
import { PUBLIC_KEY_MULTIBASE, VALID_DID } from '../helpers';
import { OperationState } from '../../src/interfaces';
import { deserializeState } from '../../src/update-did/helpers/deserialize-state';

describe('Deserialize State of DID update', () => {
  it('should deserialize state of add verification method', () => {
    const message = new DIDAddVerificationMethodMessage({
      did: VALID_DID,
      property: 'assertionMethod',
      controller: VALID_DID,
      publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      id: '#key-1',
    });
    const serializedMessage = message.toBytes();
    const state: OperationState = {
      label: 'label',
      index: 1,
      message: serializedMessage,
      status: 'pause',
    };

    const deserializedState = deserializeState([state]);

    expect(deserializedState).toEqual([
      {
        ...state,
        operation: 'add-verification-method',
        message,
      },
    ]);
  });

  it('should deserialize state of remove verification method', () => {
    const message = new DIDRemoveVerificationMethodMessage({
      did: VALID_DID,
      property: 'assertionMethod',
      id: '#key-1',
    });
    const serializedMessage = message.toBytes();
    const state: OperationState = {
      label: 'label',
      index: 1,
      message: serializedMessage,
      status: 'pause',
    };

    const deserializedState = deserializeState([state]);

    expect(deserializedState).toEqual([
      {
        ...state,
        operation: 'remove-verification-method',
        message,
      },
    ]);
  });

  it('should deserialize state of add service', () => {
    const message = new DIDAddServiceMessage({
      did: VALID_DID,
      serviceEndpoint: 'https://example.com',
      type: 'Example',
      id: '#srv-1',
    });
    const serializedMessage = message.toBytes();
    const state: OperationState = {
      label: 'label',
      index: 1,
      message: serializedMessage,
      status: 'pause',
    };

    const deserializedState = deserializeState([state]);

    expect(deserializedState).toEqual([
      {
        ...state,
        operation: 'add-service',
        message,
      },
    ]);
  });

  it('should deserialize state of remove service', () => {
    const message = new DIDRemoveServiceMessage({
      did: VALID_DID,
      id: '#srv-1',
    });
    const serializedMessage = message.toBytes();
    const state: OperationState = {
      label: 'label',
      index: 1,
      message: serializedMessage,
      status: 'pause',
    };

    const deserializedState = deserializeState([state]);

    expect(deserializedState).toEqual([
      {
        ...state,
        operation: 'remove-service',
        message,
      },
    ]);
  });

  it('should deserialize multiple states', () => {
    const message1 = new DIDRemoveServiceMessage({
      did: VALID_DID,
      id: '#srv-1',
    });
    const message2 = new DIDAddServiceMessage({
      did: VALID_DID,
      serviceEndpoint: 'https://example.com',
      type: 'Example',
      id: '#srv-1',
    });
    const message3 = new DIDRemoveVerificationMethodMessage({
      did: VALID_DID,
      property: 'assertionMethod',
      id: '#key-1',
    });
    const message4 = new DIDAddVerificationMethodMessage({
      did: VALID_DID,
      property: 'assertionMethod',
      controller: VALID_DID,
      publicKeyMultibase: PUBLIC_KEY_MULTIBASE,
      id: '#key-1',
    });

    const messages = [message1, message2, message3, message4];
    const states: OperationState[] = messages.map((message, index) => ({
      label: `label-${index}`,
      index,
      message: message.toBytes(),
      status: 'pause',
    }));

    const deserializedState = deserializeState(states);

    expect(deserializedState).toEqual([
      {
        ...states[0],
        operation: 'remove-service',
        message: message1,
      },
      {
        ...states[1],
        operation: 'add-service',
        message: message2,
      },
      {
        ...states[2],
        operation: 'remove-verification-method',
        message: message3,
      },
      {
        ...states[3],
        operation: 'add-verification-method',
        message: message4,
      },
    ]);
  });

  it('should throw an error if the message is invalid', () => {
    const state: OperationState = {
      label: 'label',
      index: 1,
      message: '{}',
      status: 'pause',
    };

    expect(() => deserializeState([state])).toThrow();
  });
});
