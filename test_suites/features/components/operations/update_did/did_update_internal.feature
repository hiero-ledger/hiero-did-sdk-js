Feature: DID Update in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "localnode"

  @ignore
  Scenario: Add a Verification Method with Verification Method Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-1"                     |
      | property           | "verificationMethod"         |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-1"                     |
      | property           | "verificationMethod"         |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Verification Method Relationship to the DID Document Using a Valid Private Key
    Given a private key in DER format: "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    And a new DID is created with usage of private key
    And an update definition:
      | operation          | "add-verification-method" |
      | id                 | "#key-2"                  |
      | property           | "verificationMethod"      |
      | publicKeyMultibase | "z6Mkw..."                |
    When the `updateDID` is called with the private key and the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-2"             |
      | property           | "verificationMethod" |
      | publicKeyMultibase | "z6Mkq..."           |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Authentication Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-3"                     |
      | property           | "authentication"             |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-3"                     |
      | property           | "authentication"             |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Assertion Method Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-4"                     |
      | property           | "assertionMethod"            |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-4"                     |
      | property           | "assertionMethod"            |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Key Aggreement Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-5"                     |
      | property           | "keyAgreement"               |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-5"                     |
      | property           | "keyAgreement"               |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Capability Invocation Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-6"                     |
      | property           | "capabilityInvocation"       |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-6"                     |
      | property           | "capabilityInvocation"       |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Verification Method with Capability Delegation Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-7"                     |
      | property           | "capabilityDelegation"       |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with the definition:
      | id                 | "#key-7"                     |
      | property           | "capabilityDelegation"       |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Add a Service to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation       | "add-service"            |
      | id              | "#service-1"             |
      | serviceEndpoint | "http://example.com/..." |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes service with the definition:
      | operation       | "add-service"            |
      | id              | "#service-1"             |
      | serviceEndpoint | "http://example.com/..." |
    And the DID Document should conform to "did_document_schema.json"

  @ignore
  Scenario: Remove a Service from the DID Document
    Given an existing DID with its current DID Document including service with id "#service-1"
    And an update definition:
      | operation | "remove-service" |
      | id        | "#service-1"     |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the service with id "#service-1" is no longer present
    And the document conforms to "did_document_schema.json"

  Scenario: Remove a Invalid Service from the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | operation | "remove-service" |
      | id        | "#service-2"     |
    When the `updateDID` is called with the SDK Client
    Then an `InvalidServiceIdError` should be throw
    And the DID Document remains unchanged

  @ignore
  Scenario: Update Multiple Properties of the DID Document
    Given an existing DID with its current DID Document including service with id "#service-2"
    And an update definitions:
      | operation                 | id           | properties                                                        |
      | "add-verification-method" | "#key-2"     | { "property", "authentication", "publicKeyMultibase":"z9Kpq..." } |
      | "remove-service"          | "#service-2" |                                                                   |
    When the `updateDID` is called with the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with id "#key-2"
    And the DID Document does not include service with id "#service-2"
    And the document conforms to "did_document_schema.json"

  @ignore
  Scenario: Update Multiple Properties of the DID Document with DIDUpdateBuilder
    Given an existing DID with its current DID Document including service with id "#service-2"
    And an update definitions:
      | operation                 | id           | properties                                                        |
      | "add-verification-method" | "#key-2"     | { "property", "authentication", "publicKeyMultibase":"z9Kpq..." } |
      | "remove-service"          | "#service-2" |                                                                   |
    And an instance of a DIDUpdateBulder initiated using given update definitions                                                                 |
    When the `updateDID` is called with the DIDUpdateBuilder and the SDK Client
    Then the function should return the updated DID Document
    And the DID Document includes verification method with id "#key-2"
    And the DID Document does not include service with id "#service-2"
    And the document conforms to "did_document_schema.json"

  @ignore
  Scenario: Update DID with Not Existing DID
    Given an non existing DID with its non existing DID Document
    And an update definition:
      | operation          | "add-verification-method"    |
      | id                 | "#key-5"                     |
      | property           | "keyAgreement"               |
      | publicKeyMultibase | "z6Mkq..."                   |
      | type               | "Ed25519VerificationKey2020" |
    When the `updateDID` is called with the SDK Client
    Then an DIDNotFoundError is thrown

  @ignore
  Scenario: Update DID with Invalid Operation
    Given an existing DID with its current DID Document
    And an update definition:
      | operation | "invalid-operation" |
      | id        | "#key-invalid"      |
    When the `updateDID` is called with the SDK Client
    Then an InvalidUpdateOperationError is thrown

  @ignore
  Scenario: Update DID with Invalid Private Key
    Given a private key in DER format: "invalid_private_key"
    And an existing DID with its current DID Document created with usage of private key
    And an update definition:
      | operation          | "add-verification-method" |
      | id                 | "#key-2"                  |
      | property           | "verificationMethod"      |
      | publicKeyMultibase | "z6Mkw..."                |
    When the `updateDID` is called with the private key and the SDK Client
    Then an InvalidPrivateKeyError is thrown
