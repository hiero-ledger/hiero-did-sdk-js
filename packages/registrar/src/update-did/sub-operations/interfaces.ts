import {
  DIDDocument,
  Publisher,
  Signer,
  DIDMessage,
} from '@swiss-digital-assets-institute/core';
import { RunnerState } from '@swiss-digital-assets-institute/lifecycle';
import { DIDUpdateOperation, UpdateDIDOptions } from '../interface';

export type PrepareFunction<
  Message extends DIDMessage = DIDMessage,
  Operation extends DIDUpdateOperation = DIDUpdateOperation,
> = (
  data: Operation,
  options: UpdateDIDOptions,
  currentDidDocument: DIDDocument,
  signer: Signer,
  publisher: Publisher,
) => Promise<RunnerState<Message>>;

export type ExecuteFunction<Message extends DIDMessage = DIDMessage> = (
  message: RunnerState<Message>,
  signer: Signer,
  publisher: Publisher,
) => Promise<RunnerState<Message>>;
