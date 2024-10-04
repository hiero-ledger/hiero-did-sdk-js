import { Publisher } from "../Publisher";
import { Signer } from "../Signer";
import { DIDMessage } from "./DIDMessage";

interface BaseHookData {
  signer: Signer;
  publisher: Publisher;
}
interface ResultBase {
  // To determine if the process should continue or be stopped/paused
  continue: boolean;
}
export type HookFunction<Data extends {}, Result> = (
  data: Data & BaseHookData
) => Promise<Result & ResultBase> | (Result & ResultBase);

export interface Hooks<
  InitializationHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  SigningHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  PublicationHookFn extends HookFunction<any, any> = HookFunction<any, any>
> {
  initialization: InitializationHookFn;
  signing: SigningHookFn;
  publication: PublicationHookFn;
}

interface Providers {
  signer: Signer;
  publisher: Publisher;
}

export class DIDMessageLifeCycleManager<
  Message extends DIDMessage,
  HooksType extends Hooks
> {
  constructor(private readonly hooks: HooksType) {}

  async start(
    message: Message,
    signer: Signer,
    publisher: Publisher,
    stageData?: Record<any, any>
  ): Promise<void> {
    const providers: Providers = {
      signer,
      publisher,
    };

    if (message.stage === "complete") {
      return;
    }

    let result: any;
    if (stageData) {
      message[message.stage](stageData);
      result = { continue: true };
    } else {
      result = await this[message.stage](message, providers);
    }

    if (result.continue) {
      await this.start(message, signer, publisher);
    }
  }

  private async initialize(message: Message, providers: Providers) {
    // Initialize the DID message
    const initializeData = message.initializeData;
    const preCreationData = await this.hooks.initialization({
      ...providers,
      ...initializeData,
    });
    message.initialize(preCreationData);
    return preCreationData;
  }

  private async signing(message: Message, providers: Providers) {
    const signingData = message.signingData;
    const signingResult = await this.hooks.signing({
      ...providers,
      ...signingData,
    });
    message.signing(signingResult);
    return signingResult;
  }

  private async publishing(message: Message, providers: Providers) {
    // Publish the DID message
    const publishingData = message.publishingData;
    await this.hooks.publication({
      ...providers,
      ...publishingData,
    });
    return publishingData;
  }
}
