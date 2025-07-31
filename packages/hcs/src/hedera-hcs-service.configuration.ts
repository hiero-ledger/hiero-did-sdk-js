import { HederaClientConfiguration } from '@hiero-did-sdk/client';
import { Cache } from '@hiero-did-sdk/core';

export type CacheConfig = {
  maxSize: number;
};

export interface HederaHcsServiceConfiguration extends HederaClientConfiguration {
  cache?: CacheConfig | Cache;
}
