import { DIDMessage } from '@swiss-digital-assets-institute/core';
import { RunnerState } from '@swiss-digital-assets-institute/lifecycle';

/**
 * The state of the current registrar operation.
 */
export interface OperationState
  extends Omit<RunnerState<DIDMessage>, 'message'> {
  /**
   * Serialized messages for the operation.
   */
  message: string;
}
