Feature: Hedera topic messaging

  Background:
    Given a Hedera client is configured

  Scenario: Create a topic and send messages
    When a new topic is created
    And messages "Hello" and "World" are sent to the topic
    Then the messages "Hello" and "World" should be received

  Scenario: Create a topic and send messages
    When a new topic is created
    And messages "Hedera" and "Test" are sent to the topic
    Then the messages "Hedera" and "Test" should be received
