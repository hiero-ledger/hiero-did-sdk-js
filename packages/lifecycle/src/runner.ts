import {
  DIDError,
  DIDMessage,
  Publisher,
  Signer,
  Verifier,
} from '@swiss-digital-assets-institute/core';
import { LifecycleBuilder } from './builder';
import { RunnerState } from './interfaces/runner-state';
import { HookFunction } from './interfaces/hooks';

/**
 * Options for the lifecycle runner.
 */
export interface LifecycleRunnerOptions<Context extends object = object> {
  /**
   * Additional arguments to pass to the runner.
   */
  args?: {
    /**
     * Signature to use for the message.
     */
    signature?: Uint8Array;

    /**
     * Verifier to use for verifying the signature.
     */
    verifier?: Verifier;
  };

  /**
   * The signer to use for signing the message.
   */
  signer?: Signer;

  /**
   * The step label to resume from.
   */
  label?: string;

  /**
   * The publisher to use for publishing the message.
   */
  publisher: Publisher;

  /**
   * The context to use for the runner.
   */
  context?: Context;
}

/**
 * A runner for executing a lifecycle pipeline.
 * A lifecycle pipeline is a series of steps that are executed in order.
 */
export class LifecycleRunner<
  Message extends DIDMessage,
  Context extends object = object,
> {
  private readonly hooks: Record<string, HookFunction<Message>[]> = {};

  /**
   * Creates a new instance of the LifecycleRunner class.
   * @param builder - The lifecycle builder to use.
   * @returns A new instance of the LifecycleRunner class.
   */
  constructor(private readonly builder: LifecycleBuilder<Message, Context>) {}

  /**
   * Resumes the lifecycle pipeline from the specified state.
   * @param state - The state to resume from.
   * @param options - The options to use.
   * @returns The state of the lifecycle pipeline after resuming.
   * @throws If an error occurs during the process.
   */
  async resume(
    state: RunnerState<Message>,
    options: LifecycleRunnerOptions<Context>,
  ): Promise<RunnerState<Message>> {
    return this.process(state.message, { ...options, label: state.label });
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
    options: LifecycleRunnerOptions<Context>,
  ): Promise<RunnerState<Message>> {
    try {
      const initialStep = options.label
        ? (this.builder.getIndexByLabel(options.label) ?? -1) + 1
        : 0;

      for (
        let stepIndex = initialStep;
        stepIndex < this.builder.length;
        stepIndex++
      ) {
        const step = this.builder.getByIndex(stepIndex);
        const prevStep =
          stepIndex > 0 ? this.builder.getByIndex(stepIndex - 1) : undefined;

        if (prevStep?.type === 'pause') {
          await this.callHooks(prevStep.label, message);
        }

        if (step.type === 'callback') {
          await step.callback(message, options.publisher, options.context);
          await this.callHooks(step.label, message);

          continue;
        }

        if (step.type === 'sign') {
          if (!options.signer) {
            throw new DIDError(
              'invalidArgument',
              'Signer is missing, but required',
            );
          }
          await message.signWith(options.signer);
          await this.callHooks(step.label, message);

          continue;
        }

        if (step.type === 'signature') {
          if (!options.args?.signature || !options.args?.verifier) {
            throw new DIDError(
              'invalidArgument',
              'Signature and verifier are required for the signature step',
            );
          }

          await message.setSignature(
            options.args.signature,
            options.args.verifier,
          );
          await this.callHooks(step.label, message);

          continue;
        }

        if (step.type === 'pause') {
          // Pause the process
          return {
            message,
            status: 'pause',
            index: stepIndex,
            label: step.label,
          };
        }
      }

      return {
        message,
        status: 'success',
        label: '',
        index: -1,
      };
    } catch (error: unknown) {
      if (!this.builder.catchStep) {
        throw error;
      }

      await this.builder.catchStep.callback(error);
      return {
        message,
        status: 'error',
        label: '',
        index: -1,
      };
    }
  }

  /**
   * Registers a hook to be called when the specified label is completed.
   * Hooks are called in the parallel been the completion of the label and the next step.
   * @param label Name of the label to hook into.
   * @param callback The hook function to call.
   */
  onComplete(label: string, callback: HookFunction<Message>): void {
    this.hooks[label] = this.hooks[label] ?? [];
    this.hooks[label].push(callback);
  }

  /**
   * Calls the hooks for the specified label.
   * @param label The label to call the hooks for.
   */
  private async callHooks(label: string, message: Message) {
    const hooks = this.hooks[label] ?? [];

    await Promise.all(hooks.map((hook) => hook(message)));
  }
}
