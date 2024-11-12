Feature: DID Creation in External Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "localnode"

  @ignore
  Scenario: Create a DID using an Valid External Key from HashiCorp Vault
    Given a valid HashiCorp Vault signer
    And a keyId: "valid_key_id"
    When the `createDID` is called with signer and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID using an Invalid External Key from HashiCorp Vault
    Given a valid HashiCorp Vault signer
    And a keyId: "invalid_key_id"
    When the `createDID` is called with signer and the SDK Client
    Then an `InvalidSignerError` should be thrown
