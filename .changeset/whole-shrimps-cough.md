---
'@hiero-did-sdk/anoncreds': patch
'@hiero-did-sdk/cache': patch
'@hiero-did-sdk/client': patch
'@hiero-did-sdk/core': patch
'@hiero-did-sdk/crypto': patch
'@hiero-did-sdk/hcs': patch
'@hiero-did-sdk/lifecycle': patch
'@hiero-did-sdk/messages': patch
'@hiero-did-sdk/publisher-internal': patch
'@hiero-did-sdk/registrar': patch
'@hiero-did-sdk/resolver': patch
'@hiero-did-sdk/signer-hashicorp-vault': patch
'@hiero-did-sdk/signer-internal': patch
'@hiero-did-sdk/verifier-hashicorp-vault': patch
'@hiero-did-sdk/verifier-internal': patch
'@hiero-did-sdk/zstd': patch
---

Fixed an issue where multiple actions to update and deactivate a document's DID could not be performed when using a Client instance
