import { DIDMessage } from '@hashgraph-did-sdk/core';
import { Steps, CallbackStep, CatchStep } from './interfaces/steps';

/**
 * A builder for constructing a lifecycle pipeline.
 * A lifecycle pipeline is a series of steps that are executed in order.
 */
// TODO: add labels to the steps
export class LifecycleBuilder<Message extends DIDMessage> {
  protected readonly pipeline: Steps<Message>[] = [];
  public catchStep?: CatchStep;

  /**
   * The number of steps in the pipeline.
   * @returns The number of steps in the pipeline.
   */
  get length(): number {
    return this.pipeline.length;
  }

  /**
   * Gets the step at the specified index.
   * @param step - The index of the step to get.
   * @returns The step at the specified index.
   */
  get(step: number): Steps<Message> {
    return this.pipeline[step];
  }

  /**
   * Adds a callback step to the pipeline.
   * A callback step is a step that calls a callback function with a message and a publisher.
   * The callback function can be used to perform any operation on the message, such as signing or verifying.
   * @param callback - The callback function to be executed.
   * @returns The builder instance.
   */
  callback(callback: CallbackStep<Message>['callback']): this {
    this.pipeline.push({ type: 'callback', callback });
    return this;
  }

  /**
   * Adds a signature step to the pipeline.
   * A signature step is a step that adds a provided signature to a message.
   * @returns The builder instance.
   */
  signature(): this {
    this.pipeline.push({ type: 'signature' });
    return this;
  }

  /**
   * Adds a sign step to the pipeline.
   * A sign step is a step that signs a message using a provided Signer to the lifecycle pipeline.
   * @returns The builder instance.
   */
  signWithSigner(): this {
    this.pipeline.push({ type: 'sign' });
    return this;
  }

  /**
   * Adds a pause step to the pipeline.
   * A pause step is a step that pauses the lifecycle pipeline. The pipeline can be resumed from the paused step.
   * @returns The builder instance.
   */
  pause(): this {
    this.pipeline.push({ type: 'pause' });
    return this;
  }

  /**
   * Adds a catch step to the pipeline.
   * A catch step is a special step that catches errors in the whole lifecycle pipeline.
   * Only one catch step can be added to the pipeline.
   * @param callback - The callback function to be executed.
   * @returns The builder instance.
   */
  catch(callback: CatchStep['callback']): this {
    this.catchStep = { type: 'catch', callback };
    return this;
  }
}
