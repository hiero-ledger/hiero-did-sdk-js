import { Publisher, DIDMessage } from '@swiss-digital-assets-institute/core';

/**
 * A step in the lifecycle pipeline.
 * A step that calls a callback function with a message and a publisher.
 */
export interface CallbackStep<Message extends DIDMessage> {
  type: 'callback';
  callback: (message: Message, publisher: Publisher) => void | Promise<void>;
}

/**
 * A step in the lifecycle pipeline.
 * A step that signs a message using provided Signer to lifecycle pipeline.
 */
export interface SignStep {
  type: 'sign';
}

/**
 * A step in the lifecycle pipeline.
 * A step that adds a provided signature to a message.
 */
export interface SignatureStep {
  type: 'signature';
}

/**
 * A step in the lifecycle pipeline.
 * A step that pauses the lifecycle pipeline.
 */
export interface PauseStep {
  type: 'pause';
}

/**
 * A step in the lifecycle pipeline.
 * A special step that catches errors in the lifecycle pipeline.
 */
export interface CatchStep {
  type: 'catch';
  callback: (error: unknown) => void | Promise<void>;
}

/**
 * An aggregation of all possible steps in the lifecycle pipeline.
 */
export type Steps<Message extends DIDMessage> =
  | CallbackStep<Message>
  | SignStep
  | SignatureStep
  | PauseStep;
