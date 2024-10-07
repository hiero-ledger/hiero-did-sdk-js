import { DIDMessage } from "../DIDMessage";
import { Publisher } from "../Publisher";

interface CallbackStep<Message extends DIDMessage> {
  type: "callback";
  callback: (msg: Message, publisher: Publisher) => void | Promise<void>;
}

interface SignStep {
  type: "sign";
}

interface SignatureStep {
  type: "signature";
}

interface PauseStep {
  type: "pause";
}

interface CatchStep {
  type: "catch";
  callback: (error: unknown) => void | Promise<void>;
}

export class LifecycleBuilder<Message extends DIDMessage> {
  public readonly pipeline: (
    | CallbackStep<Message>
    | SignStep
    | SignatureStep
    | PauseStep
  )[] = [];
  public catchStep?: CatchStep;

  callback(callback: CallbackStep<Message>["callback"]) {
    this.pipeline.push({ type: "callback", callback });
    return this;
  }

  signature() {
    this.pipeline.push({ type: "signature" });
    return this;
  }

  signWithSigner() {
    this.pipeline.push({ type: "sign" });
    return this;
  }

  pause() {
    this.pipeline.push({ type: "pause" });
    return this;
  }

  catch(callback: CatchStep["callback"]) {
    this.catchStep = { type: "catch", callback };
    return this;
  }
}
