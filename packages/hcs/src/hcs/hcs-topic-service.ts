import {
  type Client,
  PrivateKey,
  PublicKey,
  Status,
  StatusError,
  Timestamp,
  TopicCreateTransaction,
  TopicDeleteTransaction,
  TopicInfoQuery,
  TopicUpdateTransaction,
} from '@hashgraph/sdk';
import Duration from '@hashgraph/sdk/lib/Duration';
import AccountId from '@hashgraph/sdk/lib/account/AccountId';
import { HcsCacheService } from '../cache';
import { CacheConfig } from '../hedera-hcs-service.configuration';
import { Cache, Signer } from '@hiero-did-sdk/core';
import { getMirrorNetworkNodeUrl, isMirrorQuerySupported, waitForChangesVisibility } from '../shared';

const DEFAULT_AUTO_RENEW_PERIOD = 90 * 24 * 60 * 60; // 90 days

// TODO: It's not possible to clear HCS Topic fields at the moment

export interface CreateTopicProps {
  topicMemo?: string;
  submitKey?: PublicKey | PrivateKey;
  adminKeySigner?: Signer;
  autoRenewPeriod?: Duration | Long | number;
  autoRenewAccountId?: AccountId | string;
  autoRenewAccountKeySigner?: Signer;
  waitForChangesVisibility?: boolean;
  waitForChangesVisibilityTimeoutMs?: number;
}

export type UpdateTopicProps = {
  topicId: string;
  currentAdminKeySigner: Signer;
  expirationTime?: Timestamp | Date;
} & CreateTopicProps;

export type DeleteTopicProps = {
  topicId: string;
  adminKeySigner: Signer;
  waitForChangesVisibility?: boolean;
  waitForChangesVisibilityTimeoutMs?: number;
};

export interface GetTopicInfoProps {
  topicId: string;
}

export interface TopicInfo {
  topicId: string;
  topicMemo: string;
  adminKey?: string;
  submitKey?: string;
  autoRenewPeriod?: number;
  autoRenewAccountId?: string;
  expirationTime?: number;
}

interface MirrorNodeTopicResponse {
  deleted: boolean;
  topic_id: string;
  memo: string;
  admin_key?: {
    _type: string;
    key: string;
  };
  submit_key?: {
    _type: string;
    key: string;
  };
  auto_renew_period?: number;
  auto_renew_account?: string | null;
  expiration_time?: string | null;
}

export class HcsTopicService {
  private readonly cacheService?: HcsCacheService;

  /**
   * Creates a new HcsTopicService instance.
   *
   * @param client - The Hedera client instance used for HCS operations
   * @param cache - Optional cache configuration, cache instance, or HcsCacheService instance
   */
  constructor(
    private readonly client: Client,
    cache?: CacheConfig | Cache | HcsCacheService
  ) {
    if (cache) {
      this.cacheService = cache instanceof HcsCacheService ? cache : new HcsCacheService(cache);
    }
  }

  /**
   * Create a new HCS topic
   *
   * @param props - Optional configuration properties for the topic
   * @param props.topicMemo - Optional memo or description for the topic
   * @param props.submitKey - Optional key that must sign any message submitted to the topic
   * @param props.adminKeySigner - Optional Signer for private key that must sign any transaction updating the topic
   * @param props.autoRenewPeriod - Optional auto-renewal period for the topic
   * @param props.autoRenewAccountId - Optional account ID to be charged for auto-renewal fees
   * @param props.autoRenewAccountKeySigner - Optional Signer for the auto-renewal account (required if autoRenewAccountId is provided)
   * @param props.waitForChangesVisibility - Optional flag to wait until the topic is visible in the mirror node
   * @param props.waitForChangesVisibilityTimeoutMs - Optional timeout in milliseconds for waiting for changes visibility
   * @returns Promise resolving to the created topic ID as a string
   * @throws Error if autoRenewAccountId is provided without autoRenewAccountKey
   * @throws Error if the topic creation transaction fails
   */
  public async createTopic(props?: CreateTopicProps): Promise<string> {
    if (props?.autoRenewAccountId && !props?.autoRenewAccountKeySigner) {
      throw new Error('The autoRenewAccountKeySigner is required for setting autoRenewAccountId');
    }

    let transaction = new TopicCreateTransaction();

    if (props?.topicMemo) {
      transaction = transaction.setTopicMemo(props?.topicMemo);
    }

    if (props?.submitKey) {
      transaction = transaction.setSubmitKey(props.submitKey);
    }

    if (props?.adminKeySigner) {
      const adminKey = await props.adminKeySigner.publicKeyInstance();
      transaction = transaction.setAdminKey(adminKey);
    }

    if (props?.autoRenewPeriod) {
      transaction = transaction.setAutoRenewPeriod(props.autoRenewPeriod);
    }

    if (props?.autoRenewAccountId) {
      transaction = transaction.setAutoRenewAccountId(props.autoRenewAccountId);
    }

    const frozenTransaction = transaction.freezeWith(this.client);

    if (props?.autoRenewAccountKeySigner) await props.autoRenewAccountKeySigner.signTransaction(frozenTransaction);
    if (props?.adminKeySigner) await props.adminKeySigner.signTransaction(frozenTransaction);

    const response = await frozenTransaction.execute(this.client);

    const receipt = await response.getReceipt(this.client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Topic Create transaction failed: ${receipt.status.toString()}`);
    }

    if (!receipt.topicId) {
      throw new Error('Topic Create transaction failed: Transaction receipt do not contain topicId');
    }

    const topicId = receipt.topicId.toString();

    if (props?.waitForChangesVisibility) {
      await waitForChangesVisibility<TopicInfo>({
        fetchFn: () => this.fetchTopicInfo({ topicId }),
        checkFn: (topicInfo: TopicInfo) => topicInfo.topicId === topicId,
        waitTimeout: props?.waitForChangesVisibilityTimeoutMs,
      });
    }

    return topicId;
  }

  /**
   * Update HCS topic
   *
   * @param props - Configuration properties for updating the topic
   * @param props.topicId - The ID of the topic to update
   * @param props.currentAdminKeySigner - Signer for current admin private key required to sign the update transaction
   * @param props.topicMemo - Optional new memo or description for the topic
   * @param props.submitKey - Optional new key that must sign any message submitted to the topic
   * @param props.adminKeySigner - Optional Signer for new private key that must sign any transaction updating the topic
   * @param props.autoRenewPeriod - Optional new auto renewal period for the topic
   * @param props.autoRenewAccountId - Optional new account ID to be charged for auto-renewal fees
   * @param props.autoRenewAccountKeySigner - Optional Signer for new private key for the auto-renew account (required if autoRenewAccountId is provided)
   * @param props.expirationTime - Optional new expiration time for the topic
   * @param props.waitForChangesVisibility - Optional flag to wait until the topic changes are visible in the mirror node
   * @param props.waitForChangesVisibilityTimeoutMs - Optional timeout in milliseconds for waiting for changes visibility
   * @returns Promise that resolves when the topic has been updated
   * @throws Error if autoRenewAccountId is provided without autoRenewAccountKey
   * @throws Error if the topic update transaction fails
   */
  public async updateTopic(props: UpdateTopicProps): Promise<void> {
    if (props?.autoRenewAccountId && !props?.autoRenewAccountKeySigner) {
      throw new Error('The autoRenewAccountKeySigner is required for updating autoRenewAccountId');
    }

    let transaction = new TopicUpdateTransaction().setTopicId(props.topicId);

    if (props.topicMemo !== undefined) {
      transaction = transaction.setTopicMemo(props.topicMemo ?? '');
    }

    if (props.submitKey !== undefined) {
      transaction = transaction.setSubmitKey(props.submitKey);
    }

    if (props.adminKeySigner !== undefined) {
      const adminKey = await props.adminKeySigner.publicKeyInstance();
      transaction = transaction.setAdminKey(adminKey);
    }

    if (props.autoRenewPeriod !== undefined) {
      transaction = transaction.setAutoRenewPeriod(props.autoRenewPeriod ?? DEFAULT_AUTO_RENEW_PERIOD);
    }

    if (props.autoRenewAccountId !== undefined) {
      transaction = transaction.setAutoRenewAccountId(props.autoRenewAccountId);
    }

    if (props.expirationTime !== undefined) {
      transaction = transaction.setExpirationTime(props.expirationTime);
    }

    const frozenTransaction = transaction.freezeWith(this.client);

    if (props.autoRenewAccountKeySigner) await props.autoRenewAccountKeySigner.signTransaction(frozenTransaction);
    if (props.adminKeySigner) await props.adminKeySigner.signTransaction(frozenTransaction);
    await props.currentAdminKeySigner.signTransaction(frozenTransaction);

    const response = await frozenTransaction.execute(this.client);

    const receipt = await response.getReceipt(this.client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Topic update transaction failed: ${receipt.status.toString()}`);
    }

    await this.cacheService?.removeTopicInfo(this.client, props.topicId);

    const currentAdminKeyDer = await props.currentAdminKeySigner.publicKey();

    if (props?.waitForChangesVisibility) {
      await waitForChangesVisibility({
        fetchFn: () => this.fetchTopicInfo({ topicId: props.topicId }),
        checkFn: (topicInfo: TopicInfo) =>
          (props.topicMemo === undefined || props.topicMemo === topicInfo.topicMemo) &&
          (props.submitKey === undefined || props.submitKey.toStringDer() === topicInfo.submitKey) &&
          (props.currentAdminKeySigner === undefined || currentAdminKeyDer === topicInfo.adminKey) &&
          (props.autoRenewPeriod === undefined || props.autoRenewPeriod === topicInfo.autoRenewPeriod) &&
          (props.autoRenewAccountId === undefined || props.autoRenewAccountId === topicInfo.autoRenewAccountId) &&
          (props.expirationTime === undefined ||
            this.convertExpirationTimeToSeconds(props.expirationTime) === topicInfo.expirationTime),
        waitTimeout: props?.waitForChangesVisibilityTimeoutMs,
      });
    }
  }

  /**
   * Delete HCS topic
   *
   * @param props - Configuration properties for deleting the topic
   * @param props.topicId - The ID of the topic to delete
   * @param props.adminKeySigner - Signer for an admin key required to sign the delete transaction
   * @param props.waitForChangesVisibility - Optional flag to wait until the topic deletion is visible in the mirror node
   * @param props.waitForChangesVisibilityTimeoutMs - Optional timeout in milliseconds for waiting for changes visibility
   * @returns Promise that resolves when the topic has been deleted
   * @throws Error if the topic delete transaction fails
   */
  public async deleteTopic(props: DeleteTopicProps): Promise<void> {
    const topicTransaction = new TopicDeleteTransaction().setTopicId(props.topicId);

    const frozenTransaction = topicTransaction.freezeWith(this.client);

    await props.adminKeySigner.signTransaction(frozenTransaction);

    const topicDeleteResult = await frozenTransaction.execute(this.client);

    const receipt = await topicDeleteResult.getReceipt(this.client);
    if (receipt.status !== Status.Success) {
      throw new Error(`Topic delete transaction failed: ${receipt.status.toString()}`);
    }

    await this.cacheService?.removeTopicInfo(this.client, props.topicId);

    if (props?.waitForChangesVisibility) {
      await waitForChangesVisibility<boolean>({
        fetchFn: async () => {
          try {
            await this.fetchTopicInfo({ topicId: props.topicId });
            return false;
          } catch (error) {
            return error instanceof StatusError && error.status === Status.InvalidTopicId;
          }
        },
        checkFn: (value: boolean) => value === true,
        waitTimeout: props?.waitForChangesVisibilityTimeoutMs,
      });
    }
  }

  /**
   * Get HCS topic info
   * If a cache service is configured, it will first check the cache before fetching from the network
   *
   * @param props - Configuration properties for retrieving topic info
   * @param props.topicId - The ID of the topic to retrieve info for
   * @returns Promise resolving to the topic info
   * @throws Error if the topic info cannot be retrieved
   */
  public async getTopicInfo(props: GetTopicInfoProps): Promise<TopicInfo> {
    const cachedInfo = await this.cacheService?.getTopicInfo(this.client, props.topicId);
    if (cachedInfo) return cachedInfo;

    const result = await this.fetchTopicInfo(props);

    await this.cacheService?.setTopicInfo(this.client, props.topicId, result);

    return result;
  }

  /**
   * Fetch HCS topic info using either the Hedera SDK Client or REST API based on client capabilities.
   *
   * @param props - Configuration properties for fetching topic info
   * @param props.topicId - The ID of the topic to fetch info for
   * @returns Promise resolving to the topic info
   * @private
   */
  private fetchTopicInfo(props: GetTopicInfoProps): Promise<TopicInfo> {
    return isMirrorQuerySupported(this.client)
      ? this.fetchTopicInfoWithClient(props)
      : this.fetchTopicInfoWithRest(props);
  }

  /**
   * Fetch HCS topic info using the Hedera SDK Client (via gRPC)
   *
   * @param props - Configuration properties for fetching topic info
   * @param props.topicId - The ID of the topic to fetch info for
   * @returns Promise resolving to the topic info
   * @private
   */
  private async fetchTopicInfoWithClient(props: GetTopicInfoProps): Promise<TopicInfo> {
    const topicInfoQuery = new TopicInfoQuery().setTopicId(props.topicId);
    const info = await topicInfoQuery.execute(this.client);

    return {
      topicId: info.topicId.toString(),
      topicMemo: info.topicMemo,
      adminKey: (info.adminKey as PublicKey)?.toStringRaw(),
      submitKey: (info.submitKey as PublicKey)?.toStringRaw(),
      autoRenewPeriod: info.autoRenewPeriod?.seconds.low,
      autoRenewAccountId: info.autoRenewAccountId?.toString(),
      expirationTime: info.expirationTime?.toDate().getTime(),
    };
  }

  /**
   * Fetch HCS topic info using REST API
   *
   * @param props - Configuration properties for fetching topic info
   * @param props.topicId - The ID of the topic to fetch info for
   * @returns Promise resolving to the topic info
   * @throws Error if the fetch request fails
   * @throws StatusError with InvalidTopicId status if the topic has been deleted
   * @private
   */
  private async fetchTopicInfoWithRest(props: GetTopicInfoProps): Promise<TopicInfo> {
    const restApiUrl = getMirrorNetworkNodeUrl(this.client);

    const response = await fetch(`${restApiUrl}/api/v1/topics/${props.topicId}?_=${Date.now()}`, {
      method: 'GET',
      headers: {
        Accept: 'application/json',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch topic info: ${response.statusText}`);
    }

    const data: MirrorNodeTopicResponse = await response.json();
    if (data.deleted) {
      throw new StatusError(
        { status: Status.InvalidTopicId, transactionId: undefined },
        Status.InvalidTopicId.toString()
      );
    }

    return {
      topicId: data.topic_id,
      topicMemo: data.memo,
      adminKey: data.admin_key?.key,
      submitKey: data.submit_key?.key,
      autoRenewPeriod: data.auto_renew_period,
      autoRenewAccountId: data.auto_renew_account ?? undefined,
      expirationTime: data.expiration_time ? new Date(data.expiration_time).getTime() : undefined,
    };
  }

  /**
   * Converts an expiration time to seconds since epoch.
   *
   * @param expirationTime - The expiration time to convert, can be a Timestamp, Date, or undefined
   * @returns The expiration time in seconds since epoch, or undefined if the input is undefined
   * @throws Error if the expirationTime is not a Timestamp or Date
   * @private
   */
  private convertExpirationTimeToSeconds = (expirationTime: Timestamp | Date): number | undefined => {
    if (expirationTime instanceof Timestamp) {
      return expirationTime.toDate().getTime();
    }

    if (expirationTime instanceof Date) {
      return expirationTime.getTime();
    }

    throw new Error('Unsupported expirationTime type');
  };
}
