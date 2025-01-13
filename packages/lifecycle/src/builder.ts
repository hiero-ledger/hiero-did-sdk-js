import { DIDMessage } from '@swiss-digital-assets-institute/core';
import { Steps, CallbackStep, CatchStep } from './interfaces/steps';

/**
 * A builder for constructing a lifecycle pipeline.
 * A lifecycle pipeline is a series of steps that are executed in order.
 */
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
   * @param stepIndex The index of the step to get.
   * @returns The step at the specified index.
   * @throws If the step does not exist.
   */
  getByIndex(stepIndex: number): Steps<Message> {
    if (stepIndex >= this.pipeline.length) {
      throw new Error('Step does not exist');
    }
    return this.pipeline[stepIndex];
  }

  /**
   * Gets the step with the specified label.
   * @param stepLabel The label of the step to get.
   * @returns The step with the specified label.
   * @throws If the step does not exist.
   */
  getByLabel(stepLabel: string): Steps<Message> {
    const stepOrUndefined = this.pipeline.find((s) => s.label === stepLabel);

    if (!stepOrUndefined) {
      throw new Error(`Step with label ${stepLabel} does not exist`);
    }

    return stepOrUndefined;
  }

  /**
   * Gets the step with the specified label.
   * @param stepLabel The label of the step to get.
   * @returns The step with the specified label.
   * @throws If the step does not exist.
   */
  getIndexByLabel(stepLabel: string): number {
    const stepIndexOrUndefined = this.pipeline.findIndex(
      (s) => s.label === stepLabel,
    );

    if (stepIndexOrUndefined < 0) {
      throw new Error(`Step with label ${stepLabel} does not exist`);
    }

    return stepIndexOrUndefined;
  }

  /**
   * Adds a callback step to the pipeline.
   * A callback step is a step that calls a callback function with a message and a publisher.
   * The callback function can be used to perform any operation on the message, such as signing or verifying.
   * @param label The label of the step.
   * @param callback The callback function to be executed.
   * @returns The builder instance.
   */
  callback(label: string, callback: CallbackStep<Message>['callback']): this {
    this.validateLabel(label);

    this.pipeline.push({ type: 'callback', label, callback });
    return this;
  }

  /**
   * Adds a signature step to the pipeline.
   * A signature step is a step that adds a provided signature to a message.
   * @param label The label of the step.
   * @returns The builder instance.
   */
  signature(label: string): this {
    this.validateLabel(label);

    this.pipeline.push({ type: 'signature', label });
    return this;
  }

  /**
   * Adds a sign step to the pipeline.
   * A sign step is a step that signs a message using a provided Signer to the lifecycle pipeline.
   * @param label The label of the step.
   * @returns The builder instance.
   */
  signWithSigner(label: string): this {
    this.validateLabel(label);

    this.pipeline.push({ type: 'sign', label });
    return this;
  }

  /**
   * Adds a pause step to the pipeline.
   * A pause step is a step that pauses the lifecycle pipeline. The pipeline can be resumed from the paused step.
   * @param label The label of the step.
   * @returns The builder instance.
   */
  pause(label: string): this {
    this.validateLabel(label);

    this.pipeline.push({ type: 'pause', label });
    return this;
  }

  /**
   * Adds a catch step to the pipeline.
   * A catch step is a special step that catches errors in the whole lifecycle pipeline.
   * Only one catch step can be added to the pipeline.
   * @param label The label of the step.
   * @param callback The callback function to be executed.
   * @returns The builder instance.
   */
  catch(label: string, callback: CatchStep['callback']): this {
    this.validateLabel(label);

    this.catchStep = { type: 'catch', label, callback };
    return this;
  }

  private validateLabel(label: string): void {
    if (this.pipeline.some((s) => s.label === label)) {
      throw new Error(`Step with label ${label} already exists`);
    }
  }
}
