import { Verifier } from '@hiero-did-sdk/core';
import { TopicReader } from './topic-reader';

export interface ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Verifier;

  /**
   * The TopicReader instance to use for reading messages from the topic.
   * Default is HederaClientTopicReader.
   */
  topicReader?: TopicReader;
}

export interface GetResolveDIDOptions extends ResolveDIDOptions {
  /**
   * A custom verifier to use when verifying the DID document signature.
   * If not specified, the verification with root key will be used from the DID document.
   */
  verifier?: Verifier;

  /**
   * The TopicReader instance to use for reading messages from the topic.
   * Default is HederaClientTopicReader.
   */
  topicReader?: TopicReader;
}

export type DereferenceDIDOptions = ResolveDIDOptions;
