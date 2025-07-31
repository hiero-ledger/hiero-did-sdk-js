import { DIDMessage } from '@hiero-did-sdk/core';

export type StateStatus = 'success' | 'error' | 'pause';

export interface RunnerState<Message extends DIDMessage> {
  message: Message;
  status: StateStatus;
  index: number;
  label: string;
}
