export interface DIDMessageLifeCycle<
  PreCreationData extends {} = {},
  PreCreationResult extends any = any,
  PreSigningData extends {} = {},
  PreSigningResult extends any = any,
  PostSigningData extends {} = {},
  PostSigningResult extends any = any,
  PostCreationData extends {} = {},
  PostCreationResult extends any = any
> {
  /**
   * This method is called before the creation of the DID message.
   */
  preCreation(
    data: PreCreationData
  ): Promise<PreCreationResult> | PreCreationResult;

  /**
   * This method is called before the signing of the DID message.
   */
  preSigning(
    data: PreSigningData
  ): Promise<PreSigningResult> | PreSigningResult;

  /**
   * This method is called after the signing of the DID message.
   */
  postSigning(
    data: PostSigningData
  ): Promise<PostSigningResult> | PostSigningResult;

  /**
   * This method is called after the creation of the DID message.
   */
  postCreation(
    data: PostCreationData
  ): Promise<PostCreationResult> | PostCreationResult;
}
