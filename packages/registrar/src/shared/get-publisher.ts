import { Client } from '@hashgraph/sdk';
import { Publisher } from '@swiss-digital-assets-institute/core';
import { InternalPublisher } from '@swiss-digital-assets-institute/publisher-internal';
import { Providers } from '../interfaces';

/**
 * Extracts the publisher from the providers.
 * Creates a new publisher if it is not provided.
 * Uses the client to create a new publisher or use client options to create a new client.
 *
 * @param providers Registrar providers
 * @throws Error if client options, client and publisher are not provided
 * @returns Extracted publisher
 */
export function getPublisher(providers: Providers): Publisher {
  if (providers.publisher) {
    return providers.publisher;
  }

  if (providers.client) {
    const client = providers.client;
    return new InternalPublisher(client);
  }

  if (!providers.clientOptions) {
    throw new Error(
      'Missing client options or client or publisher, but one of them is required',
    );
  }

  const clientOptions = providers.clientOptions;

  const client = Client.forName(providers.clientOptions.network).setOperator(
    clientOptions.accountId,
    clientOptions.privateKey,
  );

  return new InternalPublisher(client);
}
