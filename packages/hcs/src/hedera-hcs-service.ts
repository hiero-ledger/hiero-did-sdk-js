import { HederaClientService, NetworkName } from '@hiero-did-sdk/client';
import { HcsCacheService } from './cache';
import {
  CreateTopicProps,
  DeleteTopicProps,
  GetTopicInfoProps,
  GetTopicMessagesProps,
  HcsFileService,
  HcsMessageService,
  HcsTopicService,
  ResolveFileProps,
  SubmitFileProps,
  SubmitMessageProps,
  SubmitMessageResult,
  TopicMessageData,
  UpdateTopicProps,
} from './hcs';
import { HederaHcsServiceConfiguration } from './hedera-hcs-service.configuration';

export class HederaHcsService {
  private readonly clientService: HederaClientService;
  private readonly cacheService: HcsCacheService;

  /**
   * Creates a new instance of the HederaHcsService
   * @param config - Configuration for the Hedera HCS service
   */
  constructor(config: HederaHcsServiceConfiguration) {
    this.clientService = new HederaClientService(config);
    if (config.cache) {
      this.cacheService = new HcsCacheService(config.cache);
    }
  }

  /**
   * Creates a new topic on the Hedera network
   * @param props - Optional properties for creating a topic, including network specification
   * @returns A promise that resolves to the created topic information
   */
  public async createTopic(props?: CreateTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).createTopic(props)
    );
  }

  /**
   * Updates an existing topic on the Hedera network
   * @param props - Properties for updating a topic, including network specification
   * @returns A promise that resolves to the updated topic information
   */
  public async updateTopic(props: UpdateTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).updateTopic(props)
    );
  }

  /**
   * Deletes a topic from the Hedera network
   * @param props - Properties for deleting a topic, including network specification
   * @returns A promise that resolves when the topic is deleted
   */
  public async deleteTopic(props: DeleteTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).deleteTopic(props)
    );
  }

  /**
   * Retrieves information about a topic from the Hedera network
   * @param props - Properties for getting topic information, including network specification
   * @returns A promise that resolves to the topic information
   */
  public async getTopicInfo(props: GetTopicInfoProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).getTopicInfo(props)
    );
  }

  /**
   * Submits a message to a topic on the Hedera network
   * @param props - Properties for submitting a message, including network specification
   * @returns A promise that resolves to the submission result
   */
  public async submitMessage(props: SubmitMessageProps & NetworkName): Promise<SubmitMessageResult> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsMessageService(client, this.cacheService).submitMessage(props)
    );
  }

  /**
   * Retrieves messages from a topic on the Hedera network
   * @param props - Properties for getting topic messages, including network specification
   * @returns A promise that resolves to an array of topic messages
   */
  public async getTopicMessages(props: GetTopicMessagesProps & NetworkName): Promise<TopicMessageData[]> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsMessageService(client, this.cacheService).getTopicMessages(props)
    );
  }

  /**
   * Submits a file to the Hedera network
   * @param props - Properties for submitting a file, including network specification
   * @returns A promise that resolves to the file ID as a string
   */
  public async submitFile(props: SubmitFileProps & NetworkName): Promise<string> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsFileService(client, this.cacheService).submitFile(props)
    );
  }

  /**
   * Resolves (retrieves) a file from the Hedera network
   * @param props - Properties for resolving a file, including network specification
   * @returns A promise that resolves to the file content as a Buffer
   */
  public async resolveFile(props: ResolveFileProps & NetworkName): Promise<Buffer> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsFileService(client, this.cacheService).resolveFile(props)
    );
  }
}
