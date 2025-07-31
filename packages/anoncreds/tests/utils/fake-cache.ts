import { Cache } from '@hiero-did-sdk/core';

export class FakeCache implements Cache {
  get<CacheValue>(_: string): Promise<CacheValue | null> {
    return new Promise(() => null);
  }

  set<CacheValue>(_key: string, _value: CacheValue, _expiresInSeconds?: number): Promise<void> {
    throw new Error('Method not implemented.');
  }

  remove(_: string): Promise<void> {
    throw new Error('Method not implemented.');
  }

  clear(): Promise<void> {
    throw new Error('Method not implemented.');
  }

  cleanupExpired(): Promise<void> {
    throw new Error('Method not implemented.');
  }
}
