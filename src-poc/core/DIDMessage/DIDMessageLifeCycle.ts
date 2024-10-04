export interface DIDMessageLifeCycle<
  InitializationData extends {} = {},
  InitializationResult extends any = any,
  SigningData extends {} = {},
  SigningResult extends any = any,
  CreationData extends {} = {},
  CreationResult extends any = any
> {
  /**
   * This method is called before the creation of the DID message.
   */
  initialize(
    data: InitializationData
  ): Promise<InitializationResult> | InitializationResult;

  /**
   * This method is called before the signing of the DID message.
   */
  signing(data: SigningData): Promise<SigningResult> | SigningResult;

  /**
   * This method is called after the creation of the DID message.
   */
  publishing(data: CreationData): Promise<CreationResult> | CreationResult;
}
