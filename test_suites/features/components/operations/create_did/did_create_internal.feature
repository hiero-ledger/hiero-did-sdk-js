Feature: DID Creation in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "local-node"

  @create
  Scenario: Create a DID With Minimum Information
    When the `createDID` is called with the SDK Client
    Then the function should return a newly created DID, its DID Document and Private Key
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @create
  Scenario: Create a DID Using a Valid Private Key
    Given a private key in DER format "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    When the `createDID` is called with the private key and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"

  @create
  Scenario: Create a DID Using an Invalid Private Key
    Given a private key in DER format "invaid_key_format"
    When the `createDID` is called with the private key and the SDK Client
    Then an "Invalid private key format. Expected DER." should be thrown

  @create
  Scenario: Create a DID Using a valid non ED25519 Private Key
    Given an instance of PrivateKey class initiated using given private key "3030020100300706052b8104000a0422042019b0cd8b326b6728be3ecc74c65ced17f9c487fc617b747391b9f63f27ddb298"
    When the `createDID` is called with the private key and the SDK Client
    Then an "Invalid private key type. Expected ED25519." should be thrown

  @create
  Scenario: Create a DID Using the Valid PrivateKey class
    Given an instance of PrivateKey class initiated using given private key "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    When the `createDID` is called with the private key and the SDK Client
    Then the function should return a newly created DID and its DID Document
    And the DID Document should conform to "did_document_schema.json"
    And the DID should conform to "did_hedera_format_schema.json"
