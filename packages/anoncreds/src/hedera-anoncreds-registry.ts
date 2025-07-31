import { HederaHcsService } from '@hiero-did-sdk/hcs';
import { Zstd } from '@hiero-did-sdk/zstd';
import {
  AnonCredsResolutionMetadataError,
  GetCredentialDefinitionReturn,
  GetRevocationRegistryDefinitionReturn,
  GetRevocationStatusListReturn,
  GetSchemaReturn,
  RegisterCredentialDefinitionOptions,
  RegisterCredentialDefinitionReturn,
  RegisterRevocationRegistryDefinitionOptions,
  RegisterRevocationRegistryDefinitionReturn,
  RegisterRevocationStatusListOptions,
  RegisterRevocationStatusListReturn,
  RegisterSchemaOptions,
  RegisterSchemaReturn,
  RevocationRegistryEntryMessage,
  RevocationRegistryEntryMessageWrapper,
} from './dto';
import { HederaAnoncredsRegistryConfiguration } from './hedera-anoncreds-registry.configuration';
import { AnonCredsRevocationRegistryDefinitionWithMetadata, AnonCredsRevocationStatusList } from './specification';
import { AnonCredsObjectType, buildAnonCredsIdentifier, parseAnonCredsIdentifier } from './utils';
import { Buffer } from 'buffer';

type NetworkName = {
  networkName?: string;
};

export class HederaAnoncredsRegistry {
  private readonly hcsService: HederaHcsService;

  constructor(config: HederaAnoncredsRegistryConfiguration) {
    this.hcsService = new HederaHcsService(config);
  }

  /**
   * Register a schema in the registry of the network.
   * @returns Register schema result
   * @param options
   */
  async registerSchema(options: RegisterSchemaOptions & NetworkName): Promise<RegisterSchemaReturn> {
    const { networkName, schema } = options;
    try {
      const payload = Buffer.from(JSON.stringify(schema));
      const schemaTopicId = await this.hcsService.submitFile({
        payload,
        networkName,
        waitForChangesVisibility: true,
      });
      return {
        schemaState: {
          state: 'finished',
          schema,
          schemaId: buildAnonCredsIdentifier(schema.issuerId, schemaTopicId, AnonCredsObjectType.SCHEMA),
        },
        schemaMetadata: {},
        registrationMetadata: {},
      };
    } catch (error) {
      return {
        schemaState: {
          state: 'failed',
          schema,
          reason: error instanceof Error ? error.message : `UnknownError: ${JSON.stringify(error)}`,
        },
        schemaMetadata: {},
        registrationMetadata: {},
      };
    }
  }

  /**
   * Get a schema definition from the registry.
   * @param schemaId - The schema definition id for resolution
   * @returns Schema definition resolution result
   */
  async getSchema(schemaId: string): Promise<GetSchemaReturn> {
    const { topicId, networkName } = parseAnonCredsIdentifier(schemaId);
    const payload = await this.hcsService.resolveFile({ topicId, networkName });
    const schema = JSON.parse(payload.toString());
    return {
      schemaId,
      schema,
      schemaMetadata: {},
      resolutionMetadata: {},
    };
  }

  /**
   * Register a credential definition in the registry.
   * @param options - Credential definition options
   * @returns Register credential definition result
   */
  async registerCredentialDefinition(
    options: RegisterCredentialDefinitionOptions & NetworkName
  ): Promise<RegisterCredentialDefinitionReturn> {
    const { networkName, credentialDefinition } = options;
    try {
      const payload = Buffer.from(JSON.stringify(credentialDefinition));
      const metadata = { ...options.options };
      const credentialDefinitionTopicId = await this.hcsService.submitFile({
        payload,
        networkName,
        waitForChangesVisibility: true,
      });
      return {
        credentialDefinitionState: {
          state: 'finished',
          credentialDefinition,
          credentialDefinitionId: buildAnonCredsIdentifier(
            options.credentialDefinition.issuerId,
            credentialDefinitionTopicId.toString(),
            AnonCredsObjectType.PUBLIC_CRED_DEF
          ),
        },
        credentialDefinitionMetadata: { ...metadata },
        registrationMetadata: {},
      };
    } catch (error) {
      return {
        credentialDefinitionState: {
          state: 'failed',
          credentialDefinition,
          reason: error instanceof Error ? error.message : `UnknownError: ${JSON.stringify(error)}`,
        },
        credentialDefinitionMetadata: {},
        registrationMetadata: {},
      };
    }
  }

  /**
   * Get a credential definition from the registry.
   * @param credentialDefinitionId - The credential definition id for resolution
   * @returns Credential definition resolution result
   */
  async getCredentialDefinition(credentialDefinitionId: string): Promise<GetCredentialDefinitionReturn> {
    const { topicId, networkName } = parseAnonCredsIdentifier(credentialDefinitionId);
    const payload = await this.hcsService.resolveFile({ topicId, networkName });
    const credentialDefinition = JSON.parse(payload.toString());
    return {
      credentialDefinitionId,
      credentialDefinition,
      credentialDefinitionMetadata: {},
      resolutionMetadata: {},
    };
  }

  /**
   * Register a revocation registry definition in the registry.
   * @param options - Revocation registry definition options
   * @returns Register revocation registry definition result
   */
  async registerRevocationRegistryDefinition(
    options: RegisterRevocationRegistryDefinitionOptions & NetworkName
  ): Promise<RegisterRevocationRegistryDefinitionReturn> {
    const { networkName, revocationRegistryDefinition } = options;
    try {
      const entriesTopicId = await this.hcsService.createTopic({
        waitForChangesVisibility: true,
      });
      const hcsMetadata = { entriesTopicId };

      const revocationRegistryDefinitionWithMetadata: AnonCredsRevocationRegistryDefinitionWithMetadata = {
        revRegDef: options.revocationRegistryDefinition,
        hcsMetadata,
      };
      const payload = Buffer.from(JSON.stringify(revocationRegistryDefinitionWithMetadata));

      const revocationRegistryDefinitionTopic = await this.hcsService.submitFile({
        payload,
        networkName,
        waitForChangesVisibility: true,
      });

      return {
        revocationRegistryDefinitionState: {
          state: 'finished',
          revocationRegistryDefinition,
          revocationRegistryDefinitionId: buildAnonCredsIdentifier(
            options.revocationRegistryDefinition.issuerId,
            revocationRegistryDefinitionTopic.toString(),
            AnonCredsObjectType.REV_REG
          ),
        },
        revocationRegistryDefinitionMetadata: hcsMetadata,
        registrationMetadata: {},
      };
    } catch (error) {
      return {
        revocationRegistryDefinitionState: {
          state: 'failed',
          revocationRegistryDefinition,
          reason: error instanceof Error ? error.message : `UnknownError: ${JSON.stringify(error)}`,
        },
        revocationRegistryDefinitionMetadata: {},
        registrationMetadata: {},
      };
    }
  }

  /**
   * Get a revocation registry definition from the registry.
   * @param revocationRegistryDefinitionId - The revocation registry definition id for resolution
   * @returns Revocation registry definition resolution result
   */
  async getRevocationRegistryDefinition(
    revocationRegistryDefinitionId: string
  ): Promise<GetRevocationRegistryDefinitionReturn> {
    try {
      return await this.resolveRevocationRegistryDefinition(revocationRegistryDefinitionId);
    } catch (error) {
      return {
        revocationRegistryDefinitionId,
        revocationRegistryDefinitionMetadata: {},
        resolutionMetadata: {
          error: error instanceof AnonCredsResolutionMetadataError ? error.error : 'invalid',
          message:
            error instanceof Error
              ? error.message
              : `Unable to resolve revocation registry definition: ${JSON.stringify(error)}`,
        },
      };
    }
  }

  /**
   * Register the revocation list in the registry.
   * @param options - Revocation list options
   * @returns Register revocation list result
   */
  async registerRevocationStatusList(
    options: RegisterRevocationStatusListOptions & NetworkName
  ): Promise<RegisterRevocationStatusListReturn> {
    const { networkName, revocationStatusList } = options;
    try {
      const timestamp = Date.now() / 1000;
      const { entriesTopicId, statusList } = await this.resolveRevocationStatusList(
        options.revocationStatusList.revRegDefId,
        timestamp
      );

      const modifiedStatusList = revocationStatusList?.revocationList ?? [];
      const originalStatusList = statusList
        ? statusList.revocationList
        : new Array<number>(modifiedStatusList.length).fill(0);

      const diff = this.getStatusListDiff(originalStatusList, modifiedStatusList);

      const message = this.packRevocationRegistryEntryMessage({
        value: {
          prevAccum: statusList?.currentAccumulator,
          accum: revocationStatusList.currentAccumulator,
          ...(diff.issued.length ? { issued: diff.issued } : undefined),
          ...(diff.revoked.length ? { revoked: diff.revoked } : undefined),
        },
      });

      await this.hcsService.submitMessage({
        topicId: entriesTopicId,
        message,
        networkName,
        waitForChangesVisibility: true,
      });

      return {
        revocationStatusListState: {
          state: 'finished',
          revocationStatusList: { ...revocationStatusList, timestamp },
        },
        registrationMetadata: {},
        revocationStatusListMetadata: {},
      };
    } catch (error) {
      return {
        revocationStatusListState: {
          state: 'failed',
          revocationStatusList,
          reason:
            error instanceof Error
              ? error.message
              : `Unable to register revocation status lst: ${JSON.stringify(error)}`,
        },
        registrationMetadata: {},
        revocationStatusListMetadata: {},
      };
    }
  }

  /**
   * Get a revocation list from the registry.
   * @param revocationRegistryId - Revocation registry ID
   * @param timestamp - Timestamp to resolve a revocation list for
   * @returns Revocation list resolution result
   */
  async getRevocationStatusList(
    revocationRegistryId: string,
    timestamp: number
  ): Promise<GetRevocationStatusListReturn> {
    try {
      const { statusList } = await this.resolveRevocationStatusList(revocationRegistryId, timestamp);
      // If the list is completely empty, then we return an error
      if (!statusList) {
        throw new AnonCredsResolutionMetadataError(
          'notFound',
          `Registered revocation list for registry id "${revocationRegistryId}" is not found`
        );
      }
      return {
        revocationStatusList: statusList,
        resolutionMetadata: {},
        revocationStatusListMetadata: {},
      };
    } catch (error) {
      return {
        resolutionMetadata: {
          error: error instanceof AnonCredsResolutionMetadataError ? error.error : 'invalid',
          message:
            error instanceof Error ? error.message : `Unable to resolve revocation list: ${JSON.stringify(error)}`,
        },
        revocationStatusList: undefined,
        revocationStatusListMetadata: {},
      };
    }
  }

  /**
   * Resolve revocation registry definition
   * @param revocationRegistryDefinitionId - The revocation registry definition id
   * @returns Resolve revocation registry definition result
   */
  private resolveRevocationRegistryDefinition = async (
    revocationRegistryDefinitionId: string
  ): Promise<GetRevocationRegistryDefinitionReturn> => {
    const { topicId, networkName } = parseAnonCredsIdentifier(revocationRegistryDefinitionId);

    const payloadBuffer = await this.hcsService.resolveFile({
      topicId,
      networkName,
    });

    if (!payloadBuffer) {
      throw new AnonCredsResolutionMetadataError(
        'notFound',
        `AnonCreds revocation registry with id ${revocationRegistryDefinitionId} not found`
      );
    }

    const payload: AnonCredsRevocationRegistryDefinitionWithMetadata = JSON.parse(payloadBuffer.toString());

    return {
      revocationRegistryDefinitionId: revocationRegistryDefinitionId,
      revocationRegistryDefinition: { ...payload.revRegDef },
      revocationRegistryDefinitionMetadata: { ...payload.hcsMetadata },
      resolutionMetadata: {},
    };
  };

  private resolveRevocationStatusList = async (
    revocationRegistryDefinitionId: string,
    onTimestamp?: number
  ): Promise<{
    entriesTopicId: string;
    statusList?: AnonCredsRevocationStatusList;
  }> => {
    const timestamp = onTimestamp ? 1000 * onTimestamp : Date.now();
    const revRegDefResult = await this.getRevocationRegistryDefinition(revocationRegistryDefinitionId);

    const revocationRegistryDefinition = revRegDefResult.revocationRegistryDefinition;
    if (!revocationRegistryDefinition) {
      throw new AnonCredsResolutionMetadataError(
        'notFound',
        `AnonCreds revocation registry with id "${revocationRegistryDefinitionId}" not found`
      );
    }

    const entriesTopicId: string = revRegDefResult.revocationRegistryDefinitionMetadata.entriesTopicId as string;
    if (!entriesTopicId) {
      throw new AnonCredsResolutionMetadataError(
        'invalid',
        'notFound: Entries topic ID is missing from revocation registry metadata'
      );
    }

    const { networkName } = parseAnonCredsIdentifier(revocationRegistryDefinitionId);

    let messages = await this.hcsService.getTopicMessages({
      networkName,
      topicId: entriesTopicId,
      toDate: new Date(timestamp),
    });

    // This means that requested timestamp is before the first submitted entry (actual registration of rev list)
    // In such case, we want to return initial state for the list (by adding first entry only)
    if (messages.length === 0) {
      messages = await this.hcsService.getTopicMessages({
        networkName,
        topicId: entriesTopicId,
        limit: 1,
      });
      if (messages.length === 0) {
        return {
          entriesTopicId,
          statusList: undefined,
        };
      }
    }

    // Extract entries
    const entries = messages
      .map((m) => ({
        ...m,
        entry: this.extractRevocationRegistryEntryMessage(m.contents),
      }))
      .filter((payload) => payload.entry && this.verifyRevocationRegistryEntryMessage(payload.entry));

    // Build status list
    const statusList = new Array<number>(revocationRegistryDefinition.value.maxCredNum).fill(0);
    for (let i = 0; i < entries.length; i++) {
      const issued = entries[i].entry?.value?.issued ?? [];
      for (let j = 0; j < issued.length; j++) {
        statusList[issued[j]] = 0;
      }
      const revoked = entries[i].entry?.value?.revoked ?? [];
      for (let j = 0; j < revoked.length; j++) {
        statusList[revoked[j]] = 1;
      }
    }

    return {
      entriesTopicId,
      statusList: {
        issuerId: revocationRegistryDefinition.issuerId,
        revRegDefId: revocationRegistryDefinitionId,
        timestamp: Math.floor(Date.now() / 1000),
        revocationList: statusList,
        currentAccumulator: entries.length ? (entries[entries.length - 1].entry?.value?.accum ?? '') : '',
      },
    };
  };

  /**
   * Get diff betwen two status lists
   * @param originalStatusList
   * @param modifiedStatusList
   * @private
   */
  private getStatusListDiff(
    originalStatusList: number[],
    modifiedStatusList: number[]
  ): { issued: number[]; revoked: number[] } {
    const issuedToRevoked: number[] = [];
    const revokedToIssued: number[] = [];

    if (originalStatusList.length !== modifiedStatusList.length) {
      throw new Error('Original and modifies status lists should have the same lengths');
    }

    for (let i = 0; i < originalStatusList.length; i++) {
      const original = originalStatusList[i];
      const modified = modifiedStatusList[i];

      if (original !== 0 && original !== 1) {
        throw new Error('Original status list should have only 0 or 1');
      }
      if (modified !== 0 && modified !== 1) {
        throw new Error('Modified status list should have only 0 or 1');
      }

      if (original === 1 && modified === 0) {
        revokedToIssued.push(i); // revoked → issued
      } else if (original === 0 && modified === 1) {
        issuedToRevoked.push(i); // issued → revoked
      }
    }

    return {
      issued: revokedToIssued,
      revoked: issuedToRevoked,
    };
  }

  /**
   * Pack the revocation register entry message
   * @param data - The revocation register entry
   */
  private packRevocationRegistryEntryMessage(data: RevocationRegistryEntryMessage): string {
    const compressedJson = Zstd.compress(Buffer.from(JSON.stringify(data), 'utf-8'));
    const payload = Buffer.from(compressedJson).toString('base64');
    const message = { payload } as RevocationRegistryEntryMessageWrapper;
    return JSON.stringify(message);
  }

  /**
   * Extract the revocation register entry message
   * @param data - The content
   * @returns Parsed model or undefined
   */
  private extractRevocationRegistryEntryMessage(data: Uint8Array): RevocationRegistryEntryMessage | undefined {
    try {
      const wrapper = JSON.parse(data.toString()) as RevocationRegistryEntryMessageWrapper;
      const encoded = Buffer.from(Zstd.decompress(Buffer.from(wrapper.payload, 'base64')));
      return JSON.parse(encoded.toString()) as RevocationRegistryEntryMessage;
    } catch {
      return undefined;
    }
  }

  /**
   * Check the message is correct HcsRevocationRegistryEntryMessage
   * @param data - The topic messages
   * @returns True if the data is verified, false for opposite
   */
  private verifyRevocationRegistryEntryMessage(data: RevocationRegistryEntryMessage) {
    return !!data.value?.accum;
  }
}
