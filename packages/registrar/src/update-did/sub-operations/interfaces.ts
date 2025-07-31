import { DIDDocument, Publisher, Signer, DIDMessage, Verifier } from '@hiero-did-sdk/core';
import { RunnerState } from '@hiero-did-sdk/lifecycle';
import { DIDUpdateOperation, UpdateDIDOptions } from '../interface';

export type PrepareFunction<
  Message extends DIDMessage = DIDMessage,
  Operation extends DIDUpdateOperation = DIDUpdateOperation,
> = (
  data: Operation,
  options: UpdateDIDOptions,
  currentDidDocument: DIDDocument,
  clientMode: boolean,
  publisher: Publisher,
  signer?: Signer,
  verifier?: Verifier
) => Promise<RunnerState<Message>>;

export type PreExecuteFunction<Message extends DIDMessage = DIDMessage> = (
  message: RunnerState<Message>,
  publisher: Publisher,
  signature: Uint8Array,
  verifier: Verifier
) => Promise<RunnerState<Message>>;

export type ExecuteFunction<Message extends DIDMessage = DIDMessage> = (
  message: RunnerState<Message>,
  clientMode: boolean,
  publisher: Publisher,
  signer?: Signer
) => Promise<RunnerState<Message>>;
