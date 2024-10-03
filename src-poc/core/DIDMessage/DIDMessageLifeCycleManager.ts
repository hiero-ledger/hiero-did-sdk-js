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
  PreSigningHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  PostSigningHookFn extends HookFunction<any, any> = HookFunction<any, any>,
  PublicationHookFn extends HookFunction<any, any> = HookFunction<any, any>
> {
  initialization: InitializationHookFn;
  preSigning: PreSigningHookFn;
  postSigning: PostSigningHookFn;
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
    const preSigningData = message.preSigningData;
    const preSigningResult = await this.hooks.preSigning({
      ...providers,
      ...preSigningData,
    });
    message.preSigning(preSigningResult);

    // Sign the DID message
    if (!message.requiredSignature) {
      const signature = await signer.sign(message.eventBytes);
      message.setSignature(signature);
    }

    // Post-signing
    const postSigningData = message.postSigningData;
    const postSigningResult = await this.hooks.postSigning({
      ...providers,
      ...postSigningData,
    });
    message.postSigning(postSigningResult);

    // Publish the DID message
    const publishingData = message.publishingData;
    await this.hooks.publication({
      ...providers,
      ...publishingData,
    });
  }
}
