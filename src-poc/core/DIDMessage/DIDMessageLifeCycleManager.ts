import { Publisher } from "../Publisher";
import { Signer } from "../Signer";
import { DIDMessage } from "./DIDMessage";

type BaseHookData = {
  signer: Signer;
  publisher: Publisher;
};
export type HookFunction<Data extends {}, Result> = (
  data: Data & BaseHookData
) => Promise<Result> | Result;

export interface Hooks<
  InitializationHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  SigningHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  PublicationHookFn extends HookFunction<any, any> = HookFunction<any, any>
> {
  initialization: InitializationHookFn;
  signing: SigningHookFn;
  publication: PublicationHookFn;
}

export class DIDMessageLifeCycleManager<
  Message extends DIDMessage,
  HooksType extends Hooks
> {
  constructor(private readonly hooks: HooksType) {}

  async start(
    message: Message,
    signer: Signer,
    publisher: Publisher
  ): Promise<void> {
    const providers = {
      signer,
      publisher,
    } as const;

    // Initialize the DID message
    const initializeData = message.initializeData;
    const preCreationData = await this.hooks.initialization({
      ...providers,
      ...initializeData,
    });
    message.initialize(preCreationData);

    // Pre-signing
    const signingData = message.signingData;
    const signingResult = await this.hooks.signing({
      ...providers,
      ...signingData,
    });
    message.signing(signingResult);

    // Publish the DID message
    const publishingData = message.publishingData;
    await this.hooks.publication({
      ...providers,
      ...publishingData,
    });
  }
}
