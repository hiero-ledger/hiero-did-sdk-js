import { type Client, PrivateKey } from '@hashgraph/sdk';
import { Crypto } from '@hiero-did-sdk/crypto';
import { Zstd } from '@hiero-did-sdk/zstd';
import { HcsCacheService } from '../cache';
import { HcsMessageService } from './hcs-message-service';
import { HcsTopicService } from './hcs-topic-service';
import { CacheConfig } from '../hedera-hcs-service.configuration';
import { Cache } from '@hiero-did-sdk/core';
import { waitForChangesVisibility } from '../shared';
import { Buffer } from 'buffer';

const HCS_FILE_TOPIC_MEMO_REGEX = /^[A-Fa-f0-9]{64}:zstd:base64$/;

const BASE64_JSON_CONTENT_PREFIX = 'data:application/json;base64,';

// 1024 bytes is a max size for HCS transaction (non-chunked) + we're reserving some space for JSON structural characters - 64 bytes
const MAX_CHUNK_CONTENT_SIZE_IN_BYTES = 960;

export interface HcsFileChunkMessage {
  orderIndex: number;
  content: string;
}

export interface SubmitFileProps {
  payload: Buffer;
  submitKey?: PrivateKey;
  waitForChangesVisibility?: boolean;
  waitForChangesVisibilityTimeoutMs?: number;
}

export interface ResolveFileProps {
  topicId: string;
}

export interface ChunkMessage {
  o: number;
  c: string;
}

export class HcsFileService {
  private readonly cacheService?: HcsCacheService;

  constructor(
    private readonly client: Client,
    cache?: CacheConfig | Cache | HcsCacheService
  ) {
    if (cache) {
      this.cacheService = cache instanceof HcsCacheService ? cache : new HcsCacheService(cache);
    }
  }

  /**
   * Submit HCS-1 file to HCS
   * @param props - The properties for submitting a file
   * @param props.payload - The file content as a Buffer
   * @param props.submitKey - Optional private key used to sign the transaction
   * @param props.waitForChangesVisibility - Optional flag to wait until the file is visible in the network
   * @param props.waitForChangesVisibilityTimeoutMs - Optional timeout in milliseconds for waiting
   * @returns The topic ID where the file was submitted
   * @throws Error if there's an issue with file submission
   */
  public async submitFile(props: SubmitFileProps): Promise<string> {
    const hcsMessagesService = new HcsMessageService(this.client, this.cacheService);

    const payloadHash = Crypto.sha256(props.payload);
    const topicId = await new HcsTopicService(this.client, this.cacheService).createTopic({
      topicMemo: this.createHCS1Memo(payloadHash),
      submitKey: props.submitKey,
    });

    const chunks = this.buildChunkMessagesFromFile(props.payload);
    for (const chunk of chunks) {
      const message = JSON.stringify({ o: chunk.orderIndex, c: chunk.content } satisfies ChunkMessage);
      await hcsMessagesService.submitMessage({
        topicId,
        message,
        submitKey: props.submitKey,
        waitForChangesVisibility: false,
      });
    }

    if (props?.waitForChangesVisibility) {
      await waitForChangesVisibility<Buffer>({
        fetchFn: () => this.resolveFileWithoutCache({ topicId }),
        checkFn: (file: Buffer) => file.equals(props.payload),
        waitTimeout: props?.waitForChangesVisibilityTimeoutMs,
      });
    }

    return topicId;
  }

  /**
   * Resolve HCS-1 file from a topic ID
   * @param props - The properties for resolving a file
   * @param props.topicId - The topic ID where the file was submitted
   * @returns A Buffer containing the resolved file content
   * @throws Error if the file cannot be resolved
   */
  public async resolveFile(props: ResolveFileProps): Promise<Buffer> {
    const cachedFile = await this.cacheService?.getTopicFile(this.client, props.topicId);
    if (cachedFile) return cachedFile;

    const payload = await this.resolveFileWithoutCache(props);

    await this.cacheService?.setTopicFile(this.client, props.topicId, payload);

    return payload;
  }

  /**
   * Resolve HCS-1 file without using cache
   * @param props - The properties for resolving a file
   * @param props.topicId - The topic ID where the file was submitted
   * @returns A Buffer containing the resolved file content
   * @throws Error if the topic memo is invalid, if the topic contains an admin key, or if the file checksum is invalid
   * @private
   */
  private async resolveFileWithoutCache(props: ResolveFileProps): Promise<Buffer> {
    const hcsTopicService = new HcsTopicService(this.client, this.cacheService);

    const topicInfo = await hcsTopicService.getTopicInfo(props);

    if (!this.isValidHCS1Memo(topicInfo.topicMemo)) {
      throw new Error(`HCS file Topic ${props.topicId} is invalid - must contain memo compliant with HCS-1 standard`);
    }

    if (topicInfo.adminKey) {
      throw new Error(`HCS file topic ${props.topicId} contains adminKey`);
    }

    const hcsMessagesService = new HcsMessageService(this.client, this.cacheService);

    const messages = await hcsMessagesService.getTopicMessages({ topicId: props.topicId });
    const chunkMessages = messages.map((message) => JSON.parse(message.contents.toString()) as ChunkMessage);
    const payload = this.buildFileFromChunkMessages(chunkMessages);

    if (!this.isValidHCS1Checksum(topicInfo.topicMemo, Crypto.sha256(payload))) {
      throw new Error('Resolved HCS file payload is invalid');
    }

    return payload;
  }

  /**
   * Build HCS-1 file from chunk messages
   * @param chunkMessages - Array of chunk messages to be combined and decompressed
   * @returns A Buffer containing the reconstructed file content
   * @throws Error if there's an issue building the file from chunks
   * @private
   */
  private buildFileFromChunkMessages(chunkMessages: ChunkMessage[]): Buffer {
    let messageContent = '';

    try {
      for (const chunkMessage of chunkMessages.sort((a, b) => a.o - b.o)) {
        messageContent += chunkMessage.c;
      }
      const compressedPayload = Buffer.from(messageContent.replace(BASE64_JSON_CONTENT_PREFIX, ''), 'base64');

      return Buffer.from(Zstd.decompress(compressedPayload));
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error);
      throw new Error(`Error on building HCS-1 file payload from chunk messages: ${errorMessage}`);
    }
  }

  /**
   * Build chunk messages from HCS-1 file payload
   * @param payload - The file content as a Buffer to be chunked
   * @returns Array of chunk messages with order index and content
   * @throws Error if there's an issue creating chunk messages
   * @private
   */
  private buildChunkMessagesFromFile(payload: Buffer): HcsFileChunkMessage[] {
    try {
      const compressedPayload = Zstd.compress(payload);
      const compressedPayloadBase64 = Buffer.from(compressedPayload).toString('base64');

      const messageContent = `${BASE64_JSON_CONTENT_PREFIX}${compressedPayloadBase64}`;
      const encoded = new TextEncoder().encode(messageContent);

      const chunks: HcsFileChunkMessage[] = [];

      let orderIndex = 0;
      for (let i = 0; i < encoded.length; i += MAX_CHUNK_CONTENT_SIZE_IN_BYTES) {
        const chunk = encoded.slice(i, i + MAX_CHUNK_CONTENT_SIZE_IN_BYTES);
        chunks.push({
          orderIndex: orderIndex++,
          content: new TextDecoder().decode(chunk),
        });
      }

      return chunks;
    } catch (error) {
      throw new Error(`Error on getting chunk messages for HCS-1 file: ${error}`);
    }
  }

  /**
   * Create Topic memo in HCS-1 format
   * @param hash - The SHA-256 hash of the file payload
   * @returns A string in the format "{hash}:zstd:base64"
   * @private
   */
  private createHCS1Memo(hash: string): string {
    return `${hash}:zstd:base64`;
  }

  /**
   * Check if the memo follows the HCS-1 format
   * @param memo - The memo string to validate
   * @returns True if the memo matches the HCS-1 format pattern, false otherwise
   * @private
   */
  private isValidHCS1Memo(memo: string): boolean {
    return !!memo && HCS_FILE_TOPIC_MEMO_REGEX.test(memo);
  }

  /**
   * Validate that the file checksum matches the expected hash in the memo
   * @param memo - The HCS-1 memo string containing the expected hash
   * @param checksum - The calculated SHA-256 hash of the file payload
   * @returns True if the checksum matches the hash in the memo, false otherwise
   * @throws Error if the memo is empty or null
   * @private
   */
  private isValidHCS1Checksum(memo: string, checksum: string): boolean {
    if (!memo) throw new Error('Memo is required');

    const [expectedPayloadHash, ,] = memo.split(':');
    return checksum === expectedPayloadHash;
  }
}
