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
  public readonly steps: (
    | CallbackStep<Message>
    | SignStep
    | SignatureStep
    | PauseStep
  )[] = [];
  public catchStep?: CatchStep;

  callback(callback: CallbackStep<Message>["callback"]) {
    this.steps.push({ type: "callback", callback });
    return this;
  }

  signature() {
    this.steps.push({ type: "signature" });
    return this;
  }

  signWithSigner() {
    this.steps.push({ type: "sign" });
    return this;
  }

  pause() {
    this.steps.push({ type: "pause" });
    return this;
  }

  catch(callback: CatchStep["callback"]) {
    this.catchStep = { type: "catch", callback };
    return this;
  }
}
