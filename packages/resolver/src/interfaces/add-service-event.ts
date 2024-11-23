export interface AddServiceEvent {
  Service: {
    id: string;
    type: string;
    serviceEndpoint: string;
  };
}
