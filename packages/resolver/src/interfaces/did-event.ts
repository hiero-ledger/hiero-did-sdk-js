import { AddServiceEvent } from './add-service-event';
import { AddVerificationMethodEvent } from './add-verification-method-event';
import { AddVerificationRelationshipMethodEvent } from './add-verification-relationship-method-event';
import { DIDOwnerEvent } from './did-owner-event';
import { RemoveServiceEvent } from './remove-service-event';
import { RemoveVerificationMethodEvent } from './remove-verification-method-event';
import { RemoveVerificationRelationshipMethodEvent } from './remove-verification-relationship-method-event';

export type DIDEvent =
  | DIDOwnerEvent
  | AddVerificationMethodEvent
  | RemoveVerificationMethodEvent
  | AddVerificationRelationshipMethodEvent
  | RemoveVerificationRelationshipMethodEvent
  | AddServiceEvent
  | RemoveServiceEvent;
