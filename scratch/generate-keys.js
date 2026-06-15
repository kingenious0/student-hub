const webpush = require('web-push');
const keys = webpush.generateVAPIDKeys();
console.log('--- GENERATED VAPID KEYS ---');
console.log('NEXT_PUBLIC_VAPID_PUBLIC_KEY:');
console.log(keys.publicKey);
console.log('\nVAPID_PRIVATE_KEY:');
console.log(keys.privateKey);
console.log('-----------------------------');
