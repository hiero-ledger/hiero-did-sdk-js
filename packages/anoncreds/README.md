# @hiero-did-sdk/anoncreds

This package provides implementation of Hedera AnonCreds Registry, following [Hedera AnonCreds Method specification](https://dsrcorporation.github.io/hedera-anoncreds-method/).
It enables the management of AnonCreds resources using Hedera Consensus Service (HCS) as Verifiable Data Registry (VDR) with support for revocation.

## Features

- **AnonCreds VDR:** Register and resolve AnonCreds objects using HCS as highly-performant and cost-effective VDR.
- **Revocation Support:** Comprehensive support for AnonCreds revocation through effective approach for revocation registry management.
- **TypeScript Support:** Built with TypeScript to enhance developer experience and code maintainability.

## Installation

Install the package via npm:

```bash
npm install @hiero-did-sdk/anoncreds
```

## Usage

The package provides a `HederaAnoncredsRegistry` class that serves as the main entry point for interacting with anonymous credentials on the Hedera network:

```typescript
import { HederaAnoncredsRegistry, HederaAnoncredsRegistryConfiguration } from '@hiero-did-sdk/anoncreds';

// Configure the registry
const config: HederaAnoncredsRegistryConfiguration = {
  // Configuration options from HederaHcsServiceConfiguration
};

// Create a registry instance
const registry = new HederaAnoncredsRegistry(config);

// Register a schema
const schemaResult = await registry.registerSchema({
  schema: {
    // Schema definition
  }
});

// Get a schema
const schema = await registry.getSchema(schemaId);

// Register a credential definition
const credDefResult = await registry.registerCredentialDefinition({
  credentialDefinition: {
    // Credential definition
  }
});

// Work with revocation
const revRegDefResult = await registry.registerRevocationRegistryDefinition({
  revocationRegistryDefinition: {
    // Revocation registry definition
  }
});
```

For more detailed examples and usage scenarios, refer to the [AnonCreds Package Guide](https://github.com/DSRCorporation/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/anoncreds-guide.html).

## API Reference

Learn more in the [AnonCreds API Reference](https://github.com/DSRCorporation/hiero-did-sdk-js/documentation/0.0.2-alpha/04-implementation/components/anoncreds-api.html).

## Running Tests

Unit tests are included to validate functionality. Run tests with:

```bash
npm test
```

## License

This project is licensed under the Apache License 2.0. See the [LICENSE](LICENSE) file for details.

## References

- [Hiero DID SDK](https://github.com/DSRCorporation/hiero-did-sdk-js) - The official repository for the Hashgraph DID SDK, containing the complete source code and documentation.
- [Hedera JavaScript SDK](https://github.com/hashgraph/hedera-sdk-js) - The official Hedera JavaScript SDK, used for interacting with the Hedera network.
- [Hedera AnonCreds Method](https://dsrcorporation.github.io/hedera-anoncreds-method/) - The specification for Hedera AnonCreds Method implemented in thus package.
- [Hedera Consensus Service](https://docs.hedera.com/hedera/sdks-and-apis/sdks/consensus-service) - Documentation for the Hedera Consensus Service used by this package.