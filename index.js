const log = e => {
    document.getElementById('logs').innerHTML += `${e}<br/>`;
}

const alice = new Device('Alice');
const bob = new Device('Bob');

let bobLookup = null;
let aliceLookup = null;

main();

async function main() {
    log('* Testing main methods:');

    log('<br/>----- EThree.initialize -----');
    await initializeUsers();
    log('<br/>----- EThree.register -----');
    await registerUsers();
    log('<br/>----- EThree.findUsers -----');
    await findUsers();
    log('<br/>----- EThree.encrypt & EThree.decrypt -----');
    await encryptAndDecrypt();

    log('<br/>* Testing private key backup methods:');

    log('<br/>----- EThree.backupPrivateKey -----');
    await backupPrivateKeys();
    log('<br/>----- EThree.changePassword -----');
    await changePasswords();
    log('<br/>----- EThree.restorePrivateKey -----');
    await restorePrivateKeys();
    log('<br/>----- EThree.resetPrivateKeyBackup -----');
    await resetPrivateKeyBackups();

    log('<br/>* Testing additional methods:');

    log('<br/>----- EThree.rotatePrivateKey -----');
    await rotatePrivateKeys();
    log('<br/>----- EThree.cleanup -----');
    await cleanup();
    log('<br/>----- EThree.unregister -----');
    await unregisterUsers();
}

async function initializeUsers() {
    await alice.initialize();
    await bob.initialize();
}

async function registerUsers() {
    await alice.register(); 
    await bob.register();
}

async function findUsers() {
    bobLookup = await alice.findUsers([bob.identity]);
    aliceLookup = await bob.findUsers([alice.identity]);
}

async function encryptAndDecrypt() {
    let aliceEncryptedText = await alice.encrypt(`Hello ${bob.identity}! How are you?`, bobLookup);
    await bob.decrypt(aliceEncryptedText, aliceLookup[alice.identity]);

    let bobEncryptedText = await bob.encrypt(`Hello ${alice.identity}! How are you?`, aliceLookup);
    await alice.decrypt(bobEncryptedText, bobLookup[bob.identity]);
}

async function backupPrivateKeys() {
    await alice.backupPrivateKey(`${alice.identity}_pkeypassword`);
    await bob.backupPrivateKey(`${bob.identity}_pkeypassword`);
}

async function changePasswords() {
    await alice.changePassword(`${alice.identity}_pkeypassword`,`${alice.identity}_pkeypassword_new`);
    await bob.changePassword(`${bob.identity}_pkeypassword`, `${bob.identity}_pkeypassword_new`);
}

async function restorePrivateKeys() {
    await alice.restorePrivateKey(`${alice.identity}_pkeypassword_new`);
    await bob.restorePrivateKey(`${bob.identity}_pkeypassword_new`);
}

async function resetPrivateKeyBackups() {
    await alice.resetPrivateKeyBackup();
    await bob.resetPrivateKeyBackup();
}

async function rotatePrivateKeys() {
    await alice.rotatePrivateKey();
    await bob.rotatePrivateKey();
}

async function cleanup() {
    await alice.cleanup();
    await bob.cleanup();
}

async function unregisterUsers() {
    await alice.unregister();
    await bob.unregister();
}