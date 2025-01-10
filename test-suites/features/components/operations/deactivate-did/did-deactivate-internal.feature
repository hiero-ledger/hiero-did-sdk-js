Feature: DID Deactivation in Internal Secret Mode

  Background:
    Given a SDK Client instance is set with a operator private key "302e020100300506032b65700422042091132178e72057a1d7528025956fe39b0b847f200ab59b2fdd367017f3087137" and account ID "0.0.2" on "local-node"

  @deactivate
  Scenario: Deactivate the DID Document
    Given an existing DID with its current DID Document
    When the `deactivateDID` is called with the SDK Client
    Then the function should return deactivated DID Document
    
  @deactivate
  Scenario: Deactivate a DID with Not Existing DID
    Given an non existing DID with its non existing DID Document
    When the `deactivateDID` is called with the SDK Client
    Then an exception should be thrown

  @deactivate
  Scenario: Deactivate a DID Using a Valid Private Key
    Given an instance of PrivateKey class initiated using given private key "302e020100300506032b657004220420dde8238132f3448e52d4466d06d7fe6b0a56e288ada0c0646dd029a6d1c97c35"
    When the `createDID` is called with the private key and the SDK Client
    Then the function should return a newly created DID and its DID Document
    When the `deactivateDID` is called with the SDK Client
    Then the function should return deactivated DID Document

