import { PublicKey } from "@hashgraph/sdk";
import { DIDMessageLifeCycle } from "../DIDMessage/DIDMessageLifeCycle";

export interface DIDOwnerMessageInitializationData {
  controller: string;
  publicKey: PublicKey;
  timestamp: string;
}
export interface DIDOwnerMessageInitializationResult {
  topicId: string;
}

export interface DIDOwnerMessageSigningData {
  event: string;
  eventBytes: Uint8Array;
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
}
export type DIDOwnerMessageSigningResult = {
  signature: Uint8Array;
};

export interface DIDOwnerMessagePublishingData {
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
  signature: Uint8Array;
  message: string;
}
export type DIDOwnerMessagePublishingResult = void;

export type DIDOwnerMessageLifeCycle = DIDMessageLifeCycle<
  DIDOwnerMessageInitializationData,
  DIDOwnerMessageInitializationResult,
  DIDOwnerMessageSigningData,
  DIDOwnerMessageSigningResult,
  DIDOwnerMessagePublishingData,
  DIDOwnerMessagePublishingResult
>;
