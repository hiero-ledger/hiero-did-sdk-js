import { DIDMessageOperation } from '@swiss-digital-assets-institute/core';

export interface TopicDIDMessage {
  timestamp: string;
  operation: DIDMessageOperation;
  did: string;
  event: string;
}

export interface TopicDIDContent {
  message: TopicDIDMessage;
  signature: string;
}
