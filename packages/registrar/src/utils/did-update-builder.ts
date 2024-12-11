import {
  AddServiceOperation,
  AddVerificationMethodOperation,
  DIDUpdateOperation,
} from '../update-did';

type VerificationMethod = Omit<
  AddVerificationMethodOperation,
  'operation' | 'property'
>;
type Service = Omit<AddServiceOperation, 'operation'>;

export class DIDUpdateBuilder {
  private operations: DIDUpdateOperation[] = [];

  addAuthenticationMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'authentication',
      id,
    });
    return this;
  }

  addAssertionMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'assertionMethod',
      id,
    });
    return this;
  }

  addKeyAgreementMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'keyAgreement',
      id,
    });
    return this;
  }

  addVerificationMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'verificationMethod',
      id,
    });
    return this;
  }

  addCapabilityInvocationMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'capabilityInvocation',
      id,
    });
    return this;
  }

  addCapabilityDelegationMethod(method: VerificationMethod): DIDUpdateBuilder {
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
      property: 'capabilityDelegation',
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
