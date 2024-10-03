import { PublicKey } from "@hashgraph/sdk";
import { DIDMessageLifeCycle } from "../DIDMessage/DIDMessageLifeCycle";

export interface DIDOwnerMessagePreCreationData {
  controller: string;
  publicKey: PublicKey;
  timestamp: string;
}
export interface DIDOwnerMessagePreCreationResult {
  topicId: string;
}

export interface DIDOwnerMessagePreSigningData {
  event: string;
  eventBytes: Uint8Array;
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
}
export type DIDOwnerMessagePreSigningResult = {
  signature: Uint8Array;
};

export interface DIDOwnerMessagePostSigningData {
  signature: Uint8Array;
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
  message: string;
}
export type DIDOwnerMessagePostSigningResult = void;

export interface DIDOwnerMessagePostCreationData {
  controller: string;
  publicKey: PublicKey;
  topicId: string;
  timestamp: string;
  signature: Uint8Array;
  message: string;
}
export type DIDOwnerMessagePostCreationResult = void;

export type DIDOwnerMessageLifeCycle = DIDMessageLifeCycle<
  DIDOwnerMessagePreCreationData,
  DIDOwnerMessagePreCreationResult,
  DIDOwnerMessagePreSigningData,
  DIDOwnerMessagePreSigningResult,
  DIDOwnerMessagePostSigningData,
  DIDOwnerMessagePostSigningResult,
  DIDOwnerMessagePostCreationData,
  DIDOwnerMessagePostCreationResult
>;
