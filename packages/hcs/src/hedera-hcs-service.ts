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

  constructor(config: HederaHcsServiceConfiguration) {
    this.clientService = new HederaClientService(config);
    if (config.cache) {
      this.cacheService = new HcsCacheService(config.cache);
    }
  }

  public async createTopic(props?: CreateTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).createTopic(props)
    );
  }

  public async updateTopic(props: UpdateTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).updateTopic(props)
    );
  }

  public async deleteTopic(props: DeleteTopicProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).deleteTopic(props)
    );
  }

  public async getTopicInfo(props: GetTopicInfoProps & NetworkName) {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsTopicService(client, this.cacheService).getTopicInfo(props)
    );
  }

  public async submitMessage(props: SubmitMessageProps & NetworkName): Promise<SubmitMessageResult> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsMessageService(client, this.cacheService).submitMessage(props)
    );
  }

  public async getTopicMessages(props: GetTopicMessagesProps & NetworkName): Promise<TopicMessageData[]> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsMessageService(client, this.cacheService).getTopicMessages(props)
    );
  }

  public async submitFile(props: SubmitFileProps & NetworkName): Promise<string> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsFileService(client, this.cacheService).submitFile(props)
    );
  }

  public async resolveFile(props: ResolveFileProps & NetworkName): Promise<Buffer> {
    return this.clientService.withClient(
      { ...props },
      async (client) => await new HcsFileService(client, this.cacheService).resolveFile(props)
    );
  }
}
