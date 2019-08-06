const log = e => {
    document.getElementById('logs').innerHTML += `${e}<br/>`;
}

const alice = new Device('Alice');
const bob = new Device('Bob');

let bobLookup = null;
let aliceLookup = null;

main();

async function main() {
    await initializeUsers();
    await registerUsers();
    await lookupPublicKeys();
    await encryptAndDecrypt();
}

async function initializeUsers() {
    log(`Initializing ${alice.identity}`);

    try      { await alice.initialize() }
    catch(e) { log(`Failed initializing ${alice.identity}: ${e}`); }

    log(`Initializing ${bob.identity}`);

    try      { await bob.initialize() }
    catch(e) { log(`Failed initializing ${bob.identity}: ${e}`); }
}

async function registerUsers() {
    log(`Registering ${alice.identity}`);

    try      { await alice.register(); }
    catch(e) { log(`Failed registering ${alice.identity}: ${e}`); }

    log(`Registering ${bob.identity}`);

    try      { await bob.register(); } 
    catch(e) { log(`Failed registering ${bob.identity}: ${e}`); }
}

async function registerUsers() {
    log(`Registering ${alice.identity}`);

    try      { await alice.register(); }
    catch(e) { log(`Failed registering ${alice.identity}: ${e}`); }

    log(`Registering ${bob.identity}`);

    try      { await bob.register(); }
    catch(e) { log(`Failed registering ${bob.identity}: ${e}`); }
}

async function lookupPublicKeys() {
    log(`Looking up ${bob.identity}'s public key`);

    try      { bobLookup = await alice.lookupPublicKeys([bob.identity]); }
    catch(e) { log(`Failed looking up ${bob.identity}'s public key: ${e}`); }

    log(`Looking up ${alice.identity}'s public key`);

    try      { aliceLookup = await bob.lookupPublicKeys([alice.identity]); }
    catch(e) { log(`Failed looking up ${alice.identity}'s public key: ${e}`); }
}

async function encryptAndDecrypt() {
    let aliceEncryptedText = null
    let bobEncryptedText = null

    try {
        aliceEncryptedText = await alice.encrypt(`Hello ${bob.identity}!`, bobLookup);
        log(`${alice.identity} encrypts and signs: '${aliceEncryptedText}'`);
    } catch(err) {
        log(`${alice.identity} failed encrypting and/or signing: '${err}'`)
    }

    try {
        let aliceDecryptedText = await bob.decrypt(aliceEncryptedText, aliceLookup[alice.identity]);
        log(`${bob.identity} decrypts and verifies ${alice.identity}'s signature: '${aliceDecryptedText}'`);
    } catch(err) {
        log(`${bob.identity} failed decrypting and/or verifying: '${err}'`)
    }

    try {
        bobEncryptedText = await bob.encrypt(`Hello ${alice.identity}!`, aliceLookup);
        log(`${bob.identity} encrypts and signs: '${bobEncryptedText}'`);
    } catch(err) {
        log(`${bob.identity} failed encrypting and/or signing: '${err}'`)
    }

    try {
        let bobDecryptedText = await alice.decrypt(bobEncryptedText, bobLookup[bob.identity]);
        log(`${alice.identity} decrypts and verifies ${bob.identity}'s signature: '${bobDecryptedText}'`);
    } catch(err) {
        log(`${alice.identity} failed decrypting and/or verifying: '${err}'`)
    }
}