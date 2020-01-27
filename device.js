const EThree = E3kit.EThree;

class Device {
    constructor(identity) {
        this.identity = identity;

        // setting this to true can cause a momentary hang in the browser
        // because encryption and decryption will be ran 100x each.
        this.benchmarking = false;
    }

    log(e) {
        log(`[${this.identity}] ${e}`);
    }

    async initialize() {
        //# start of snippet: e3kit_authenticate
        const response = await fetch('http://localhost:3000/authenticate', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                identity: this.identity
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

        let eThree = null;

        try { 
            //# start of snippet: e3kit_initialize
            eThree = await EThree.initialize(getVirgilToken);
            //# end of snippet: e3kit_initialize
            this.log(`Initialized`);
        } catch(err) {
            this.log(`Failed initializing: ${err}`);
        }

        this.eThree = eThree;
    }

    getEThree() {
        if (!this.eThree) {
            throw new Error(`eThree not initialized for ${this.identity}`);
        }

        return this.eThree;
    }

    async register() {    
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_register
            await eThree.register();
            //# end of snippet: e3kit_register
            this.log(`Registered`);
        } catch(err) { 
            this.log(`Failed registering: ${err}`); 
            if (err.name === 'IdentityAlreadyExistsError') {
                await eThree.cleanup();
                await eThree.rotatePrivateKey();
                this.log(`Rotated private key instead`)
            }
        }
    }

    async findUsers(identities) {
        const eThree = this.getEThree();
        let findUsersResult = null;

        try {
            //# start of snippet: e3kit_find_users
            findUsersResult = await eThree.findUsers(identities)
            //# end of snippet: e3kit_find_users
            this.log(`Looked up ${identities}'s public key`);
        } catch(err) {
            this.log(`Failed looking up ${identities}'s public key: ${err}`);
        }

        return findUsersResult;
    }

    async encrypt(text, recipientPublicKey) {
        const eThree = this.getEThree();

        let encryptedText = null;
        let repetitions = this.benchmarking ? 100 : 1;

        const then = new Date;
        try {
            for (let i = 0; i < repetitions; i++) {
                //# start of snippet: e3kit_sign_and_encrypt
                encryptedText = await eThree.encrypt(text, recipientPublicKey);
                //# end of snippet: e3kit_sign_and_encrypt
            }
            let time = ((new Date) - then)/repetitions;
            this.log(`Encrypted and signed: '${encryptedText}'. Took: ${time}ms`);
        } catch(err) {
            this.log(`Failed encrypting and signing: ${err}`);
        }

        return encryptedText;
    }

    async decrypt(text, senderPublicKey) {
        const eThree = this.getEThree();

        let decryptedText = null;
        let repetitions = this.benchmarking ? 100 : 1;

        const then = new Date;
        try {
            for (let i = 0; i < repetitions; i++) {
                //# start of snippet: e3kit_decrypt_and_verify
                decryptedText = await eThree.decrypt(text, senderPublicKey);
                //# end of snippet: e3kit_decrypt_and_verify
            }
            let time = ((new Date) - then)/repetitions;
            this.log(`Decrypted and verified: '${decryptedText}'. Took: ${time}ms`);
        } catch(err) {
            this.log(`Failed decrypting and verifying: ${err}`);
        }

        return decryptedText;
    }

    async backupPrivateKey(password) {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_backup_private_key
            await eThree.backupPrivateKey(password);
            //# end of snippet: e3kit_backup_private_key
            this.log(`Backed up private key`);
        } catch(err) {
            this.log(`Failed backing up private key: ${err}`);
            if (err.name === 'CloudEntryExistsError') {
                await eThree.resetPrivateKeyBackup();
                this.log(`Reset private key backup. Trying again...`);
                await this.backupPrivateKey(password);
            }
        }
    }

    async changePassword(oldPassword, newPassword) {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_change_password
            await eThree.changePassword(oldPassword, newPassword);
            //# end of snippet: e3kit_change_password
            this.log(`Changed password`);
        } catch(err) {
            this.log(`Failed changing password: ${err}`);
        }
    }

    async restorePrivateKey(password) {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_restore_private_key
            await eThree.restorePrivateKey(password);
            //# end of snippet: e3kit_restore_private_key
            this.log(`Restored private key`);
        } catch(err) {
            this.log(`Failed restoring private key: ${err}`);
            if (err.name === 'PrivateKeyAlreadyExistsError') {
                await eThree.cleanup();
                this.log(`Cleaned up. Trying again...`);
                await this.restorePrivateKey(password);
            }
        }
    }

    async resetPrivateKeyBackup() {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_reset_private_key
            await eThree.resetPrivateKeyBackup();
            //# end of snippet: e3kit_reset_private_key
            this.log(`Reset private key backup`);
        } catch(err) {
            this.log(`Failed resetting private key backup: ${err}`);
        }
    }

    async hasLocalPrivateKey() {
        const eThree = this.getEThree();

        //# start of snippet: e3kit_has_local_private_key
        let hasLocalPrivateKey = await eThree.hasLocalPrivateKey();
        //# end of snippet: e3kit_has_local_private_key

        return hasLocalPrivateKey;
    }

    async rotatePrivateKey() {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_rotate_private_key
            await eThree.rotatePrivateKey();
            //# end of snippet: e3kit_rotate_private_key
            this.log(`Rotated private key`);
        } catch(err) {
            this.log(`Failed rotating private key: ${err}`);

            if (err.name === 'PrivateKeyAlreadyExistsError') {
                await eThree.cleanup();
                this.log(`Cleaned up. Trying again...`);
                await this.rotatePrivateKey();
            }
        }
    }

    async cleanup() {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_cleanup
            await eThree.cleanup();
            //# end of snippet: e3kit_cleanup
            this.log(`Cleaned up`);
        } catch(err) {
            this.log(`Failed cleaning up: ${err}`);
        }
    }

    async unregister() {
        const eThree = this.getEThree();

        try {
            //# start of snippet: e3kit_unregister
            await eThree.unregister();
            //# end of snippet: e3kit_unregister
            this.log(`Unregistered`);
        } catch(err) {
            this.log(`Failed unregistering: ${err}`);
        }
    }
}
