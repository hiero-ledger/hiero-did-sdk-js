Feature: DID Creation in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "local-node"

  Scenario: Create a DID With Minimum Information
    When the `createDID` is called with the SDK Client
    Then the function should return a newly created DID, its DID Document and Private Key
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  Scenario: Create a DID Using a Valid Private Key
    Given a private key in DER format: "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    When the `createDID` is called with the private key and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID Using an Invalid Private Key
    Given a private key in DER format: "invaid_key_format"
    When the `createDID` is called with the private key and the SDK Client
    Then an `InvalidPrivateKeyError` should be thrown

  @ignore
  Scenario: Create a DID Using the Valid PrivateKey class
    Given a private key in DER format: "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    And an instance of PrivateKey class initiated using given private key
    When the `createDID` is called with the private key and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID Using a Valid Controller DID
    Given a controller DID: "did:hedera:testnet:GKTQsQBcVzt2tuAvir5o6hkkMacYQxtBVESx4YwEuA7b_0.0.1003"
    When the `createDID` is called with the controller DID and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID Using a Invalid Controller DID
    Given a controller DID: "invalid_controller_did"
    When the `createDID` is called with the controller DID and the SDK Client
    Then an `InvalidControllerError` should be thrown

  @ignore
  Scenario: Create a DID Using a Valid Topic ID
    Given a topic ID: "0.0.1003"
    When the `createDID` is called with the topic ID and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID Using a Invalid Topic ID
    Given a topic ID: "invalid_topic_id"
    When the `createDID` is called with the topic ID and the SDK Client
    Then an `InvalidTopicIdError` should be thrown

  @ignore
  Scenario: Create a DID Using an Valid Publisher
    Given a valid publisher
    When the `createDID` is called with publisher and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @ignore
  Scenario: Create a DID Using an Invalid Publisher
    Given a invalid publisher
    When the `createDID` is called with publisher and the SDK Client
    Then an `InvalidPublisherError` should be thrown
