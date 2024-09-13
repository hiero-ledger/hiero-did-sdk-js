---
hip: 0001
title: New hedera DID SDK
author: Pablo Buitrago <@ChangoBuitrago>, Jakub Stasiak <@js-hg>, Jakub Sydor <@Harasz>
working-group: Micha Roon <@drgorb>
type: Informational
category: Application
needs-council-approval: No
status: Draft
created: 2024-09-12
discussions-to:
updated: 2024-09-12
---

## Abstract

HIP-0001 specifies the commencement of a new Decentralised Identifier (DID) Software Development Kit (SDK) project, which will explain the necessary transition from the current model. The current system has two major shortcomings. Firstly, it does not support asynchronous signing processes. Second, its key management architecture is inflexibly restrictive, limiting access to locally provided private keys. These limitations impede versatility and efficiency, and a revised approach is needed to address these system-wide concerns. The introduction and implementation of an advanced, more comprehensive DID SDK project will provide solutions that enhance the usability, flexibility and security of the Hedera ecosystem. This proposal also encourages community input to ensure all-encompassing improvements.

## Motivation

(TBD)

## Rationale

- Not all cryptographic operations are asynchronous and in particular the sign operation
- Lack of support for different key management methods:
  - External Secret Mode
  - Client-managed Secret Mode
- Lack of support for multibase encoding
- Numerous bugs:
  - `Accept` option in resolver is not working
  - Retrying subscribe to Topic that don't exist in during resolving
  - Submitting messages with invalid signatures to Topic
  - Not checking whether a message on a Topic is associated with requested DID
- Missing DID URL Dereferencing
- Possibility to add only specific names of verification methods or services

## Specification

(TBD)

## Backwards Compatibility

Backward compatibility is not possible, due to the fact that new key management modes have been added and asynchronicity has been introduced into cryptographic operations. The project documentation will provide all necessary information on how to migrate to the new version of the SDK, including examples of SDK usage.

All previous functionalities of the SDK will be included in the new version, so the transition from one to the other will be feasible.

## Security Implications

If there are security concerns in relation to the HIP, those concerns should be explicitly addressed to make sure reviewers of the HIP are aware of them.

## Reference Implementation

All work on the SDK and its subsequent maintenance will be publicly available in a [GitHub repository](https://github.com/Swiss-Digital-Assets-Institute/hashgraph-did-sdk-js).

## Rejected Ideas

One idea was to put all the necessary features into the current DID-SDK codebase. However, the team estimated a high threshold for entry into the current SDK code, which would have significantly lengthened the work and at the same time could have created new bugs.

## References

- https://identity.foundation/did-registration/
- https://github.com/hashgraph/did-method/

## Copyright/license

This document is licensed under the Apache License, Version 2.0 -- see [LICENSE](../LICENSE) or (https://www.apache.org/licenses/LICENSE-2.0)
