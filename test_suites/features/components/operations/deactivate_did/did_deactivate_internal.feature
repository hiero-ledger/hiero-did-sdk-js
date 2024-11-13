Feature: DID Deactivation in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "localnode"

  @ignore
  Scenario: Deactivate the DID Document
    Given an existing DID with its current DID Document
    When the `deactivateDID` is called with the SDK Client
    Then the function should return the DID and empty DID Document
    
  @ignore
  Scenario: Deactivate a DID with Not Existing DID
    Given an non existing DID with its non existing DID Document
    When the `deactivateDID` is called with the SDK Client
    Then an DIDNotFoundError is thrown

  @ignore
  Scenario: Deactivate a DID Using a Valid Private Key
    Given a private key in DER format: "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    When the `deactivateDID` is called with the private key and the SDK Client
    Then the function should return the DID and empty DID Document

  @ignore
  Scenario: Deactivate a DID Using an Invalid Private Key
    Given a private key in DER format: "invaid_key_format"
    When the `deactivateDID` is called with the private key and the SDK Client
    Then an `InvalidPrivateKeyError` should be thrown

