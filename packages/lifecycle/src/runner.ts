import { DIDMessage, Publisher, Signer } from '@hashgraph-did-sdk/core';
import { LifecycleBuilder } from './builder';
import { RunnerState } from './interfaces/runner-state';

/**
 * Options for the lifecycle runner.
 */
export interface LifecycleRunnerOptions {
  /**
   * Additional arguments to pass to the runner.
   */
  args?: {
    /**
     * Signature to use for the message.
     */
    signature?: Uint8Array;
  };

  /**
   * The signer to use for signing the message.
   */
  signer?: Signer;

  /**
   * The step to resume from.
   */
  step?: number;

  /**
   * The publisher to use for publishing the message.
   */
  publisher: Publisher;
}

/**
 * A runner for executing a lifecycle pipeline.
 * A lifecycle pipeline is a series of steps that are executed in order.
 */
export class LifecycleRunner<Message extends DIDMessage> {
  /**
   * Creates a new instance of the LifecycleRunner class.
   * @param builder - The lifecycle builder to use.
   * @returns A new instance of the LifecycleRunner class.
   */
  constructor(private readonly builder: LifecycleBuilder<Message>) {}

  /**
   * Resumes the lifecycle pipeline from the specified state.
   * @param state - The state to resume from.
   * @param options - The options to use.
   * @returns The state of the lifecycle pipeline after resuming.
   * @throws If an error occurs during the process.
   */
  async resume(
    state: RunnerState<Message>,
    options: LifecycleRunnerOptions,
  ): Promise<RunnerState<Message>> {
    return this.process(state.message, { ...options, step: state.step });
  }

  /**
   * Starts the lifecycle pipeline from the beginning and processes the message.
   * @param message - The message to process.
   * @param options - The options to use.
   * @returns The state of the lifecycle pipeline after processing.
   * @throws If an error occurs during the process. If a catch step is not provided, the error is rethrown.
   */
  async process(
    message: Message,
    options: LifecycleRunnerOptions,
  ): Promise<RunnerState<Message>> {
    try {
      const initialStep = options.step ? options.step + 1 : 0;
      for (
        let stepIndex = initialStep;
        stepIndex < this.builder.length;
        stepIndex++
      ) {
        const step = this.builder.get(stepIndex);

        if (step.type === 'callback') {
          await step.callback(message, options.publisher);
          continue;
        }

        if (step.type === 'sign') {
          if (!options.signer) {
            throw new Error('Signer is missing, but required.');
          }
          await message.signWith(options.signer);
          continue;
        }

        if (step.type === 'signature') {
          if (!options.args?.signature) {
            throw new Error('Signature is missing, but required.');
          }

          message.setSignature(options.args.signature);
          continue;
        }

        if (step.type === 'pause') {
          // Pause the process
          return {
            message,
            status: 'pause',
            step: stepIndex,
          };
        }
      }

      return {
        message,
        status: 'success',
        step: -1,
      };
    } catch (error: unknown) {
      if (!this.builder.catchStep) {
        throw error;
      }

      await this.builder.catchStep.callback(error);
      return {
        message,
        status: 'error',
        step: -1,
      };
    }
  }

  // TODO: Implement this method
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  onComplete(label: string, callback: () => void) {
    throw new Error('Method not implemented.');
  }
}
