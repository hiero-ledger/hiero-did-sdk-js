import { DIDMessage } from '@hiero-did-sdk/core';
import { RunnerState } from '@hiero-did-sdk/lifecycle';

/**
 * The state of the current registrar operation.
 */
export interface OperationState extends Omit<RunnerState<DIDMessage>, 'message'> {
  /**
   * Serialized messages for the operation.
   */
  message: string;
}
