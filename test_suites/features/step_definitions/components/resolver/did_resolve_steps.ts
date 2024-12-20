import { Given, When, Then } from '@cucumber/cucumber';
import { DIDWorld } from '../../../../support/context';
import { resolveDID } from '@swiss-digital-assets-institute/resolver';
import { Signer } from '@swiss-digital-assets-institute/signer-internal';


function delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms));
}

When('the `resolveDID` is called with the SDK Client', async function (this: DIDWorld) {
    try {
        await delay(5 * 1000);
        const defaultSigner = new Signer(this.sharedData['operatorPrivateKey'] as string);
        this.sharedData['didResolvedDocument'] =  await resolveDID(this.sharedData['did'] as string, "application/did+json", { verifier: defaultSigner })
        //console.log("Resolved Doc:", this.sharedData['didResolvedDocument']);

    } catch (error) {
        // eslint-disable-next-line @typescript-eslint/no-unsafe-member-access
        this.sharedData['error'] = error.message;
    }
});

