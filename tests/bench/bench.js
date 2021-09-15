const { HDKeychain } = require('../../dist/bip32.js');
const bip32 = require('bip32');
const bench = require('micro-bmark');

const { run, mark } = bench; // or bench.mark

run(async () => {
  await mark('micro-stacks/bip32 fromBase58', async () => {
    await HDKeychain.fromBase58(
      'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7'
    );
  });
  await mark('bip32 fromBase58', () => {
    bip32.fromBase58(
      'xprv9uHRZZhk6KAJC1avXpDAp4MDc3sQKNxDiPvvkX8Br5ngLNv1TxvUxt4cV1rGL5hj6KCesnDYUhd7oWgT11eZG7XnxHrnYeSvkzY7d2bhkJ7'
    );
  });
  await mark('micro-stacks/bip32 fromSeed', async () => {
    await HDKeychain.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'));
  });
  await mark('bip32 fromSeed', () => {
    bip32.fromSeed(Buffer.from('000102030405060708090a0b0c0d0e0f', 'hex'));
  });

  // Log current RAM
  bench.logMem();

  // Get current time in nanoseconds
  bench.getTime();
});
