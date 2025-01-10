Feature: DIDDocument Resolve

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "local-node"

  @resolve
  Scenario: Create a DID With Minimum Information
    When the `createDID` is called with the SDK Client
    Then the function should return a newly created DID, its DID Document and Private Key
    When the `resolveDID` is called with the SDK Client
    Then the function should return a newly created DID, its DID Document and Private Key
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"
