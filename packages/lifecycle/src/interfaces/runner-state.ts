import { DIDMessage } from '@hashgraph-did-sdk/core';

export type StateStatus = 'success' | 'error' | 'pause';

export interface RunnerState<Message extends DIDMessage> {
  message: Message;
  status: StateStatus;
  step: number;
}
