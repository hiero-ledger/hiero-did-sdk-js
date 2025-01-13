import { DIDMessage } from '@swiss-digital-assets-institute/core';

export type StateStatus = 'success' | 'error' | 'pause';

export interface RunnerState<Message extends DIDMessage> {
  message: Message;
  status: StateStatus;
  index: number;
  label: string;
}
