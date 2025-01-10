Feature: DID Update in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "local-node"

  @update
  Scenario: Add a Verification Method with Verification Method Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-verMet                                   |
      | property           | verificationMethod                            |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-verMet                                   |
      | property           | verificationMethod                            |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Verification Method with Authentication Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-auth                                     |
      | property           | authentication                                |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-auth                                     |
      | property           | authentication                                |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Verification Method with Assertion Method Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-assert                                   |
      | property           | assertionMethod                               |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-assert                                   |
      | property           | assertionMethod                               |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Verification Method with Key Aggreement Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-keyAggr                                  |
      | property           | keyAgreement                                  |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-keyAggr                                  |
      | property           | keyAgreement                                  |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Verification Method with Capability Invocation Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-capInv                                   |
      | property           | capabilityInvocation                          |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-capInv                                   |
      | property           | capabilityInvocation                          |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Verification Method with Capability Delegation Relationship to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName          | fieldValue                                    |
      | operation          | add-verification-method                       |
      | id                 | #key-capDel                                   |
      | property           | capabilityDelegation                          |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes verification method with the definition:
      | fieldName          | fieldValue                                    |
      | id                 | #key-capDel                                   |
      | property           | capabilityDelegation                          |
      | publicKeyMultibase | z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t |
      | type               | Ed25519VerificationKey2020                    |

  @update
  Scenario: Add a Service to the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName       | fieldValue                  |
      | operation       | add-service                 |
      | id              | #service-1                  |
      | serviceEndpoint | https://example.com/checkme |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document includes service with the definition:
      | fieldName       | fieldValue                  |
      | id              | #service-1                  |
      | serviceEndpoint | https://example.com/checkme |

  @update
  Scenario: Remove a Service from the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName       | fieldValue                  |
      | operation       | add-service                 |
      | id              | #service-1                  |
      | serviceEndpoint | https://example.com/checkme |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And  the DID Document does include service with id "#service-1"
    When the `updateDID` is called with the SDK Client and update definition:
      | operation | remove-service |
      | id        | #service-1     |
    Then the function should return updated DID Document
    And  the DID Document does not include service with id "#service-1"

  @update
  Scenario: Update Multiple Properties of the DID Document
    Given an existing DID with its current DID Document
    And an update definition:
      | fieldName       | fieldValue                  |
      | operation       | add-service                 |
      | id              | #service-1                  |
      | serviceEndpoint | https://example.com/checkme |
    When the `updateDID` is called with the SDK Client
    Then the function should return updated DID Document
    And the DID Document does include service with id "#service-1"
    When the `updateDID` is called with the SDK Client and update definitions:
      | operation               | id         | properties                                                                                                                                  |
      | add-verification-method | #key-2     | { "property": "authentication", "publicKeyMultibase":"z3pZ3c9KcYBmRrT5K4zaJxM69sBtiibENUjhHnE8jX82t", "type":"Ed25519VerificationKey2020" } |
      | remove-service          | #service-1 |                                                                                                                                             |
    Then the function should return updated DID Document
    And the DID Document includes verification method with id "#key-2"
    And the DID Document does not include service with id "#service-1"

