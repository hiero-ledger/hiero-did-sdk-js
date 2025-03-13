import { TopicReader } from '@swiss-digital-assets-institute/resolver';

export interface CommonRegistrarOptions {
  /**
   * Whether to wait for the DID to be **visible** on the network.
   *
   * The DID registration transaction may be confirmed before the DID is actually accessible
   * and usable on the network. This option ensures that the function waits until the DID is
   * fully propagated and discoverable.
   *
   * If set to `false`, the function will return as soon as the registration transaction is
   * confirmed, which may be faster but could lead to errors if you immediately try to use
   * the DID.
   *
   * Defaults to `true`.
   */
  waitForDIDVisibility?: boolean;

  /**
   * The maximum time (in milliseconds) to wait for the DID to be **visible** on the network.
   *
   * This option is only relevant if `waitForDIDVisibility` is set to `true`. If the DID is not
   * visible within this timeout period, the function will throw an error.
   *
   * Defaults to 120000 milliseconds (2 minutes).
   */
  visibilityTimeoutMs?: number;

  /**
   * The topic reader to use for reading messages from the topic. It is used to wait for the DID
   * to be visible on the network and resolve the final DID document.
   *
   * Defaults to `TopicReaderHederaClient`.
   */
  topicReader?: TopicReader;
}
