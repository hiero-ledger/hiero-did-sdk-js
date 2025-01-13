import { DIDMessage } from '@swiss-digital-assets-institute/core';

/**
 * A hook function that can be registered with a lifecycle.
 */
export type HookFunction<Message extends DIDMessage> = (
  message: Message,
) => void | Promise<void>;
