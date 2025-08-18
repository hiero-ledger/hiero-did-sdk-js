import { createDID, updateDID } from '@hiero-did-sdk/registrar';
import { KeysUtility, parseDID } from '@hiero-did-sdk/core';
import { Client, PrivateKey } from '@hashgraph/sdk';
import { resolveDID } from '@hiero-did-sdk/resolver';
import { HederaAnoncredsRegistry } from '@hiero-did-sdk/anoncreds';
import {
  AnonCredsCredentialDefinition,
  AnonCredsRevocationRegistryDefinition,
  AnonCredsSchema,
} from '../packages/anoncreds/src/specification';

import * as assert from 'assert';
import { parseAnonCredsIdentifier } from '../packages/anoncreds/src/utils';
import { AnonCredsRevocationStatusListWithoutTimestamp } from '../packages/anoncreds/src/dto';

// In real scenario, these credential definition and revocation registry definition values are provided by AnonCreds implementation

const demoCredDefValue = {
  primary: {
    n: '92511867718854414868106363741369833735017762038454769060600859608405811709675033445666654908195955460485998711087020152978597220168927505650092431295783175164390266561239892662085428655566792056852960599485298025843840058914610127716620252006466964070280255168745873592143068949458568751438337748294055976926080232538440619420568859737673474560851456027625679328271511966332808025880807996449998057729417608399774744254122385012832309402226532031122728445959276178939234308090390331654445053482963947804769291501664200141562885660084823885847247231002821472258218384342423605116504024514572826071246440130942849549441',
    s: '80388543865249952799447792504739237616187770512259677275061283897050980768551818104137338144380636412773836688624071360386172349725818126495487584981520630638409717065318132420766896092370913800616033623618952639023946750307405126873476182540669638841562357523429245685476919178722373320218824590869735129801004394337640642997250464303104754942997839179333543643110326022824394934965538190976474473353762308333205671176627192797138375084260446324344637548455228161138089974447059481109651156379803576163576511072261388342837813901850712083922506433336723723235701670225584863772222447543742649328218950436824219992164',
    r: {
      age: '676933340341980399002624386891134393471002096508227567343731826159610079436978196421307099268754545293545727546242372579987825752872485684085629459107300175443328323289748793060894500514926703654606851666031895448970879827423190730510730624784665299646624113512701254199984520803796529034094958026048762178753193812250643294518237843809104055653333871102658177900702978008644780459400512716361564897282969982554031820285585105004870317861287847206222714589633178648982299799311192432563797220854755882933052881306804544233529886513105815543097685128456041780804442879272476590077760678785460726492895806240870944398',
      master_secret:
        '57770757113548032970308439965749734133430520933173186296299026579579930337912607419798836831937319372744879560676750427054135869214212225572618340088847222727882935159356459822445182287686057012197046378986248048722180093079919306125315662058290895629438767985427829790980355162853804522854494960613869765167538645624719923127052541372069255024631093663068055100579264049925388231368871107383977060590248865498902704546409806115171120555709438784189721957301548212242748685629860268468247494986146122636455769804467583612610341632602695197189514316033637331733820369170763954604394734655429769801516997967996980978751',
    },
    rctxt:
      '19574881057684356733946284215946569464410211018678168661028327420122678446653210056362495902735819742274128834330867933095119512313591151219353395069123546495720010325822330866859140765940839241212947354612836044244554152389691282543839111284006009168728161183863936810142428875817934316327118674532328892591410224676539770085459540786747902789677759379901079898127879301595929571621032704093287675668250862222728331030586585586110859977896767318814398026750215625180255041545607499673023585546720788973882263863911222208020438685873501025545464213035270207099419236974668665979962146355749687924650853489277747454993',
    z: '18569464356833363098514177097771727133940629758890641648661259687745137028161881113251218061243607037717553708179509640909238773964066423807945164288256211132195919975343578956381001087353353060599758005375631247614777454313440511375923345538396573548499287265163879524050255226779884271432737062283353279122281220812931572456820130441114446870167673796490210349453498315913599982158253821945225264065364670730546176140788405935081171854642125236557475395879246419105888077042924382595999612137336915304205628167917473420377397118829734604949103124514367857266518654728464539418834291071874052392799652266418817991437',
  },
  revocation: true,
};

const demoRevRegDefValue = {
  publicKeys: {
    accumKey: {
      z: '1 08C6E71D1CE1D1690AED25BC769646538BEC69600829CE1FB7AA788479E0B878 1 026909513F9901655B3F9153071DB43A846418F00F305BA25FE851730ED41102 1 10E9D5438AE95AE2BED78A33716BFF923A0F4CA980A9A599C25A24A2295658DA 1 0A04C318A0DFD29ABB1F1D8DD697999F9B89D6682272C591B586D53F8A9D3DC4 1 0501E5FFCE863E08D209C2FA7B390A5AA91F462BB71957CF8DB41EACDC9EB222 1 14BED208817ACB398D8476212C987E7FF77265A72F145EF2853DDB631758AED4 1 180774B2F67179FB62BD452A15F6C034599DA7BF45CC15AA2138212B53A0C110 1 00A0B87DDFFC047BE07235DD11D31226A9F5FA1E03D49C03843AA36A8AF68194 1 10218703955E0B53DB93A8D2D593EB8120A9C9739F127325CB0865ECA4B2B42F 1 08685A263CD0A045FD845AAC6DAA0FDDAAD0EC222C1A0286799B69F37CD75919 1 1FA3D27E70C185C1A16D9A83D3EE7D8CACE727A99C882EE649F87BD52E9EEE47 1 054704706B95A154F5AFC3FBB536D38DC9DCB9702EA0BFDCCB2E36A3AA23F3EC',
    },
  },
  maxCredNum: 10,
  tailsLocation: 'https://my.revocations.tails/tailsfile.txt',
  tailsHash: '91zvq2cFmBZmHCcLqFyzv7bfehHH5rMhdAG5wTjqy2PE',
};

const demoRevListAccum =
  '21 124C594B6B20E41B681E92B2C43FD165EA9E68BC3C9D63A82C8893124983CAE94 21 124C5341937827427B0A3A32113BD5E64FB7AB39BD3E5ABDD7970874501CA4897 6 5438CB6F442E2F807812FD9DC0C39AFF4A86B1E6766DBB5359E86A4D70401B0F 4 39D1CA5C4716FFC4FE0853C4FF7F081DFD8DF8D2C2CA79705211680AC77BF3A1 6 70504A5493F89C97C225B68310811A41AD9CD889301F238E93C95AD085E84191 4 39582252194D756D5D86D0EED02BF1B95CE12AED2FA5CD3C53260747D891993C';

const network = 'testnet';
const operatorId = process.env.HEDERA_TESTNET_OPERATOR_ID;
const operatorKey = process.env.HEDERA_TESTNET_OPERATOR_KEY;

const client = Client.forName(network);
client.setOperator(operatorId, PrivateKey.fromStringDer(operatorKey));

async function main() {
  // Create issuer private key and register Hedera DID
  const issuerPrivateKey = await PrivateKey.generateED25519Async();
  const issuerDid = await createDID(
    {
      privateKey: issuerPrivateKey,
      waitForDIDVisibility: true,
    },
    { client }
  );

  const { topicId: issuerDidTopicId } = parseDID(issuerDid.did);

  console.log(
    `Issuer DID has been registered, see HCS topic details: https://hashscan.io/testnet/topic/${issuerDidTopicId}`
  );

  const verificationKey = await PrivateKey.generateED25519Async();

  // Add Verification Method and Service to DID Document
  await updateDID(
    {
      did: issuerDid.did,
      privateKey: issuerPrivateKey,
      updates: [
        {
          operation: 'add-verification-method',
          id: '#key-1',
          property: 'verificationMethod',
          publicKeyMultibase: KeysUtility.fromPublicKey(verificationKey.publicKey).toMultibase(),
        },
        {
          operation: 'add-service',
          id: '#service-1',
          type: 'ExampleService',
          serviceEndpoint: 'https://example.service.com/',
        },
      ],
      waitForDIDVisibility: true,
    },
    { client }
  );

  console.log('Created DID Service and Verification Method for issuer DID document');

  console.log('Resolving issuer DID document...');

  const issuerDidDocument = await resolveDID(issuerDid.did);

  console.log('Resolved issuer DID document:');
  console.log(JSON.stringify(issuerDidDocument, null, 2));

  // Create Hedera AnonCreds registry instance
  const anoncredsRegistry = new HederaAnoncredsRegistry({
    networks: [{ network, operatorId, operatorKey }],
    cache: { maxSize: 20 },
  });

  // AnonCreds schema write/read flow

  const schema: AnonCredsSchema = {
    issuerId: issuerDid.did,
    name: 'Demo AnonCreds schema',
    attrNames: ['name', 'age'],
    version: '1.0',
  };

  console.log('Registering AnonCreds schema...');

  const schemaRegistrationResult = await anoncredsRegistry.registerSchema({
    schema,
    networkName: network,
    issuerKeyDer: issuerPrivateKey.toStringDer()
  });
  assert.equal(schemaRegistrationResult.schemaState.state, 'finished');

  const schemaId = schemaRegistrationResult.schemaState.schemaId;
  assert.ok(schemaId);

  const { topicId: schemaTopicId } = parseAnonCredsIdentifier(schemaId);

  console.log(
    `AnonCreds schema has been registered, see HCS topic details: https://hashscan.io/testnet/topic/${schemaTopicId}`
  );

  console.log('Resolving schema object...');

  const schemaResolutionResult = await anoncredsRegistry.getSchema(schemaId);
  assert.ok(schemaResolutionResult.schema);

  console.log('Resolved schema object:');
  console.log(JSON.stringify(schemaResolutionResult.schema, null, 2));

  // AnonCreds credential definition write/read flow

  const credDef: AnonCredsCredentialDefinition = {
    issuerId: issuerDid.did,
    schemaId,
    type: 'CL',
    tag: 'demo-cred-def-1.0',
    value: demoCredDefValue,
  };

  const credDefRegistrationResult = await anoncredsRegistry.registerCredentialDefinition({
    credentialDefinition: credDef,
    networkName: network,
    issuerKeyDer: issuerPrivateKey.toStringDer()
  });
  assert.equal(credDefRegistrationResult.credentialDefinitionState.state, 'finished');

  const credDefId = credDefRegistrationResult.credentialDefinitionState.credentialDefinitionId;
  assert.ok(credDefId);

  const { topicId: credDefTopicId } = parseAnonCredsIdentifier(credDefId);

  console.log(
    `AnonCreds credential definition has been registered, see HCS topic details: https://hashscan.io/testnet/topic/${credDefTopicId}`
  );

  console.log('Resolving credential definition object...');

  const credDefResolutionResult = await anoncredsRegistry.getCredentialDefinition(credDefId);
  assert.ok(credDefResolutionResult.credentialDefinition);

  console.log('Resolved credential definition object:');
  console.log(JSON.stringify(credDefResolutionResult.credentialDefinition, null, 2));

  // AnonCreds revocation registry definition write/read flow

  const revRegDef: AnonCredsRevocationRegistryDefinition = {
    issuerId: issuerDid.did,
    credDefId,
    revocDefType: 'CL_ACCUM',
    tag: 'demo-rev-reg-1.0',
    value: demoRevRegDefValue,
  };

  console.log('Registering AnonCreds revocation registry...');

  const revRegDefRegistrationResult = await anoncredsRegistry.registerRevocationRegistryDefinition({
    revocationRegistryDefinition: revRegDef,
    issuerKeyDer: issuerPrivateKey.toStringDer()
  });
  assert.equal(revRegDefRegistrationResult.revocationRegistryDefinitionState.state, 'finished');

  const revRegDefId = revRegDefRegistrationResult.revocationRegistryDefinitionState.revocationRegistryDefinitionId;
  assert.ok(revRegDefId);

  const { topicId: revRegDefTopicId } = parseAnonCredsIdentifier(revRegDefId);

  console.log(
    `AnonCreds revocation registry definition has been registered, see HCS topic details: https://hashscan.io/testnet/topic/${revRegDefTopicId}`
  );

  const revRegEntriesTopicId = revRegDefRegistrationResult.revocationRegistryDefinitionMetadata
    .entriesTopicId as string;
  assert.ok(revRegEntriesTopicId);

  console.log(
    `Revocation registry entries HCS topic details: https://hashscan.io/testnet/topic/${revRegEntriesTopicId}`
  );

  console.log('Resolving revocation registry definition object...');

  const revRegDefResolutionResult = await anoncredsRegistry.getRevocationRegistryDefinition(revRegDefId);
  assert.ok(revRegDefResolutionResult.revocationRegistryDefinition);

  console.log('Resolved revocation registry definition object:');
  console.log(JSON.stringify(revRegDefResolutionResult.revocationRegistryDefinition, null, 2));

  // Revocation list write/read flow

  const revList: AnonCredsRevocationStatusListWithoutTimestamp = {
    issuerId: issuerDid.did,
    revRegDefId,
    revocationList: [0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
    currentAccumulator: demoRevListAccum,
  };

  console.log('Registering AnonCreds revocation list...');

  const revListRegistrationResult = await anoncredsRegistry.registerRevocationStatusList({
    revocationStatusList: revList,
    networkName: network,
  });
  assert.equal(revListRegistrationResult.revocationStatusListState.state, 'finished');

  const revListTimestamp = Date.now();

  console.log(
    `Revocation list has been registered, initial revocation entry can be found in HCS topic: https://hashscan.io/testnet/topic/${revRegEntriesTopicId}`
  );

  console.log('Updating revocation list state...');

  const updatedRevList: AnonCredsRevocationStatusListWithoutTimestamp = {
    issuerId: issuerDid.did,
    revRegDefId,
    revocationList: [1, 0, 0, 0, 0, 0, 0, 0, 0, 1],
    currentAccumulator: demoRevListAccum,
  };

  const revListUpdateResult = await anoncredsRegistry.registerRevocationStatusList({
    revocationStatusList: updatedRevList,
    networkName: network,
  });
  assert.equal(revListUpdateResult.revocationStatusListState.state, 'finished');

  console.log('Resolving revocation list states...');

  const updatedRevListResolutionResult = await anoncredsRegistry.getRevocationStatusList(revRegDefId, Date.now());
  assert.ok(updatedRevListResolutionResult.revocationStatusList);

  console.log('Current revocation list state:');
  console.log(JSON.stringify(updatedRevListResolutionResult.revocationStatusList, null, 2));

  const revListResolutionResult = await anoncredsRegistry.getRevocationStatusList(revRegDefId, revListTimestamp);
  assert.ok(revListResolutionResult.revocationStatusList);

  console.log('Initial revocation list state:');
  console.log(JSON.stringify(revListResolutionResult.revocationStatusList, null, 2));
}

main();
