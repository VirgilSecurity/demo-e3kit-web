const EThree = E3kit.EThree;

class Device {
    constructor(identity) {
        this.identity = identity;
    }

    async initialize() {
        const identity = this.identity

        //# start of snippet: e3kit_authenticate
        const response = await fetch('http://localhost:3000/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identity: identity
            })
        });
            
        if (!response.ok) {
            throw new Error(`Error code: ${response.status} \nMessage: ${response.statusText}`);
        }
        
        const authToken = await response.json().then(data => data.authToken);
        //# end of snippet: e3kit_authenticate

        this.authToken = authToken

        //# start of snippet: e3kit_jwt_callback
        async function getVirgilToken() {
            const response = await fetch('http://localhost:3000/virgil-jwt', {
                headers: {
                    // We use bearer authorization, but you can use any other mechanism.
                    // The point is only, this endpoint should be protected.
                    Authorization: `Bearer ${authToken}`,
                }
            })
            if (!response.ok) {
                throw new Error(`Error code: ${response.status} \nMessage: ${response.statusText}`);
            }
    
            // If request was successful we return Promise which will resolve with token string.
            return response.json().then(data => data.virgilToken);
        }
        //# end of snippet: e3kit_jwt_callback

        //# start of snippet: e3kit_initialize
        const eThree = await EThree.initialize(getVirgilToken);
        //# end of snippet: e3kit_initialize

        this.eThree = eThree;
    }

    async register() {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        if (hasLocalPrivateKey()) {
            eThree.cleanup();
        }

        try {
            //# start of snippet: e3kit_register
            await eThree.register()
            //# end of snippet: e3kit_register
        } catch(err) {
            if (err.name === 'IdentityAlreadyExistsError') {
                //# start of snippet: e3kit_rotate_private_key
                await eThree.rotatePrivateKey()
                //# end of snippet: e3kit_rotate_private_key
                throw 'Identitity already registered. Rotated private key instead.'
            } else {
                throw err;
            }
        }
    }

    async lookupPublicKeys(identities) {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_lookup_public_keys
        const lookup = await eThree.lookupPublicKeys(identities)
        //# end of snippet: e3kit_lookup_public_keys

        return lookup;
    }

    async encrypt(text, lookupResult) {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_encrypt
        let encryptedText = await eThree.encrypt(text, lookupResult);
        //# end of snippet: e3kit_encrypt

        return encryptedText;
    }

    async decrypt(text, senderPublicKey) {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_decrypt
        let decryptedText = await eThree.decrypt(text, senderPublicKey);
        //# end of snippet: e3kit_decrypt

        return decryptedText;
    }

    async hasLocalPrivateKey() {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_has_local_private_key
        let hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
        //# end of snippet: e3kit_has_local_private_key

        return hasLocalPrivateKey;
    }

    async backupPrivateKey(password) {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_backup_private_key
        await eThree.backupPrivateKey(password);
        //# end of snippet: e3kit_backup_private_key
    }

    async restorePrivateKey(password) {
        const eThree = this.eThree;

        if (!eThree) {
            throw new Error(`eThree not initialized`);
        }

        //# start of snippet: e3kit_restore_private_key
        await eThree.restorePrivateKey(password);
        //# end of snippet: e3kit_restore_private_key
    }

}
