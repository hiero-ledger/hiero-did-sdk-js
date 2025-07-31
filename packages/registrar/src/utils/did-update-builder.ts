import { AddServiceOperation, AddVerificationMethodOperation, DIDUpdateOperation } from '../update-did';

type VerificationMethod = Omit<AddVerificationMethodOperation, 'operation' | 'property'>;
type Service = Omit<AddServiceOperation, 'operation'>;

export class DIDUpdateBuilder {
  private operations: DIDUpdateOperation[] = [];

  addAuthenticationMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'authentication',
      ...method,
    });
    return this;
  }

  removeAuthenticationMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addAssertionMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'assertionMethod',
      ...method,
    });
    return this;
  }

  removeAssertionMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addKeyAgreementMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'keyAgreement',
      ...method,
    });
    return this;
  }

  removeKeyAgreementMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addVerificationMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'verificationMethod',
      ...method,
    });
    return this;
  }

  removeVerificationMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addCapabilityInvocationMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'capabilityInvocation',
      ...method,
    });
    return this;
  }

  removeCapabilityInvocationMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addCapabilityDelegationMethod(methodOrId: VerificationMethod | string): DIDUpdateBuilder {
    let method: VerificationMethod;
    if (typeof methodOrId === 'string') {
      method = { id: methodOrId };
    } else {
      method = methodOrId;
    }

    this.operations.push({
      operation: 'add-verification-method',
      property: 'capabilityDelegation',
      ...method,
    });
    return this;
  }

  removeCapabilityDelegationMethod(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-verification-method',
      id,
    });
    return this;
  }

  addService(service: Service): DIDUpdateBuilder {
    this.operations.push({
      operation: 'add-service',
      ...service,
    });
    return this;
  }

  removeService(id: string): DIDUpdateBuilder {
    this.operations.push({
      operation: 'remove-service',
      id,
    });
    return this;
  }

  build(): DIDUpdateOperation[] {
    return this.operations;
  }
}
