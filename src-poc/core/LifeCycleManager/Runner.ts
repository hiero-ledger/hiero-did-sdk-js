import { DIDMessage } from "../DIDMessage";
import { Publisher } from "../Publisher";
import { Signer } from "../Signer";
import { LifecycleBuilder } from "./Builder";

interface Options {
  signature?: Uint8Array;
  signer?: Signer;
  step?: number;
  publisher: Publisher;
}

interface State<Message extends DIDMessage> {
  message: Message;
  status: "success" | "error" | "pause";
  step: number;
}

export class LifecycleRunner<Message extends DIDMessage> {
  constructor(private readonly builder: LifecycleBuilder<Message>) {}

  async resume(
    state: State<Message>,
    options: Options
  ): Promise<State<Message>> {
    return this.process(state.message, { ...options, step: state.step });
  }

  async process(message: Message, options: Options): Promise<State<Message>> {
    try {
      const initialStep = options.step ? options.step + 1 : 0;
      for (
        let stepIndex = initialStep;
        stepIndex < this.builder.pipeline.length;
        stepIndex++
      ) {
        const step = this.builder.pipeline[stepIndex];
        console.log("Processing step", step);

        if (step.type === "callback") {
          await step.callback(message, options.publisher);
          continue;
        }

        if (step.type === "sign") {
          if (!options.signer) {
            throw new Error("Signer is missing");
          }
          await message.signWith(options.signer);
          continue;
        }

        if (step.type === "signature") {
          if (!options.signature) {
            throw new Error("Signature is missing");
          }

          message.setSignature(options.signature);
          continue;
        }

        if (step.type === "pause") {
          // Pause the process
          return {
            message,
            status: "pause",
            step: stepIndex,
          };
        }
      }

      return {
        message,
        status: "success",
        step: -1,
      };
    } catch (error: unknown) {
      if (!this.builder.catchStep) {
        throw error;
      }

      await this.builder.catchStep.callback(error);
      return {
        message,
        status: "error",
        step: -1,
      };
    }
  }
}
