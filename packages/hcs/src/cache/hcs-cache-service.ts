import { Client } from '@hashgraph/sdk';
import { LRUMemoryCache } from '@hiero-did-sdk/cache';
import { Cache } from '@hiero-did-sdk/core';
import { TopicInfo, TopicMessageData } from '../hcs';
import { CacheConfig } from '../hedera-hcs-service.configuration';

export class HcsCacheService {
  private readonly cache: Cache;

  constructor(configOrCache: CacheConfig | Cache) {
    if (this.isCache(configOrCache)) {
      this.cache = configOrCache;
    } else {
      this.cache = new LRUMemoryCache(configOrCache.maxSize);
    }
  }

  public getTopicInfo(client: Client, topicId: string): Promise<TopicInfo | null> {
    return this.getFromCache<TopicInfo>(this.buildCacheKey(client, 'info', topicId));
  }

  public setTopicInfo(client: Client, topicId: string, topicInfo: TopicInfo): Promise<void> {
    return this.putToCache(this.buildCacheKey(client, 'info', topicId), topicInfo);
  }

  public async removeTopicInfo(client: Client, topicId: string): Promise<void> {
    await this.removeFromCache(this.buildCacheKey(client, 'info', topicId));
    await this.removeTopicMessages(client, topicId);
  }

  public getTopicMessages(client: Client, topicId: string): Promise<TopicMessageData[] | null> {
    return this.getFromCache<TopicMessageData[]>(this.buildCacheKey(client, 'messages', topicId));
  }

  public async setTopicMessages(client: Client, topicId: string, messages: TopicMessageData[]): Promise<void> {
    await this.putToCache(this.buildCacheKey(client, 'messages', topicId), messages);
    await this.removeTopicFile(client, topicId);
  }

  public async removeTopicMessages(client: Client, topicId: string): Promise<void> {
    await this.removeFromCache(this.buildCacheKey(client, 'messages', topicId));
    await this.removeTopicFile(client, topicId);
  }

  public getTopicFile(client: Client, topicId: string): Promise<Buffer | null> {
    return this.getFromCache<Buffer>(this.buildCacheKey(client, 'file', topicId));
  }

  public setTopicFile(client: Client, topicId: string, file: Buffer): Promise<void> {
    return this.putToCache(this.buildCacheKey(client, 'file', topicId), file);
  }

  public removeTopicFile(client: Client, topicId: string): Promise<void> {
    return this.removeFromCache(this.buildCacheKey(client, 'file', topicId));
  }

  /**
   * Check the cacheConfig is external cache or not
   * @param configOrCache
   * @private
   */
  private isCache(configOrCache: Cache | CacheConfig): configOrCache is Cache {
    return 'get' in configOrCache && typeof configOrCache.get === 'function';
  }

  /**
   * Check the cacheConfig is external cache or not
   * @private
   * @param client
   * @param target
   * @param topicId
   */
  private buildCacheKey(client: Client, target: 'info' | 'messages' | 'file', topicId: string): string {
    const ledgerId = client.ledgerId?.toString() ?? 'unknown';
    return `${ledgerId}-${target}-${topicId}`;
  }

  /**
   * Get data from cache
   * @param key - The cache key
   * @return The saved value
   */
  private getFromCache<T>(key: string): Promise<T | null> {
    return this.cache.get<T>(key);
  }

  /**
   * Put data to cache
   * @param key - The cache key
   * @param value - The value for save
   * @param expiresInSeconds - The cached value lifetime
   */
  private putToCache<T>(key: string, value: T, expiresInSeconds?: number): Promise<void> {
    return this.cache.set<T>(key, value, expiresInSeconds);
  }

  /**
   * Remove data from cache
   * @param key - The cache key
   */
  private removeFromCache(key: string): Promise<void> {
    return this.cache.remove(key);
  }
}
