export interface CommonRegistrarOptions {
  /**
   * Whether to wait for the DID to be visible on the network.
   * Set to false to skip this check. Transaction will be confirmed but the DID may not be visible yet.
   * Default is true.
   */
  messageAwaiting?: boolean;

  /**
   * The timeout in milliseconds to wait for the DID to be visible on the network.
   * Default is 2 minutes.
   */
  messageAwaitingTimeout?: number;
}
