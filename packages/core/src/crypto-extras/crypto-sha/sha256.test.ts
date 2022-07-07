import { utf8ToBytes, bytesToHex } from 'micro-stacks/common';
import { hashSha256 } from './sha256';

// https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA256.pdf
// https://csrc.nist.gov/CSRC/media/Projects/Cryptographic-Standards-and-Guidelines/documents/examples/SHA2_Additional.pdf
const TEST_CASES: [string, Uint8Array][] = [
  ['ba7816bf8f01cfea414140de5dae2223b00361a396177a9cb410ff61f20015ad', utf8ToBytes('abc')],
  [
    'cf5b16a778af8380036ce59e7b0492370b249b11e8f07a51afac45037afee9d1',
    utf8ToBytes(
      'abcdefghbcdefghicdefghijdefghijkefghijklfghijklmghijklmnhijklmnoijklmnopjklmnopqklmnopqrlmnopqrsmnopqrstnopqrstu'
    ),
  ],
  ['68325720aabd7c82f30f554b313d0570c95accbb7dc4b5aae11204c08ffe732b', Uint8Array.from([0xbd])],
  [
    '7abc22c0ae5af26ce93dbb94433a0e0b2e119d014f8e7f65bd56c61ccccd9504',
    Uint8Array.from([0xc9, 0x8c, 0x8e, 0x55]),
  ],
  ['02779466cdec163811d078815c633f21901413081449002f24aa3e80f0b88ef7', new Uint8Array(55)],
  ['d4817aa5497628e7c77e6b606107042bbba3130888c5f47a375e6179be789fbb', new Uint8Array(56)],
  ['65a16cb7861335d5ace3c60718b5052e44660726da4cd13bb745381b235a1785', new Uint8Array(57)],
  ['f5a5fd42d16a20302798ef6ed309979b43003d2320d9f0e8ea9831a92759fb4b', new Uint8Array(64)],
  ['541b3e9daa09b20bf85fa273e5cbd3e80185aa4ec298e765db87742b70138a53', new Uint8Array(1000)],
  [
    'c2e686823489ced2017f6059b8b239318b6364f6dcd835d0a519105a1eadd6e4',
    new Uint8Array(1000).fill(0x41),
  ],
  [
    'f4d62ddec0f3dd90ea1380fa16a5ff8dc4c54b21740650f24afc4120903552b0',
    new Uint8Array(1005).fill(0x55),
  ],
  ['d29751f2649b32ff572b5e0a9f541ea660a50f94ff0beedfb0b692b924cc8025', new Uint8Array(1000000)],
];

test('SHA-256', () => {
  for (let i = 0; i < TEST_CASES.length; i++) {
    const result = hashSha256(TEST_CASES[i][1]);
    const hex = bytesToHex(result);
    expect(hex).toEqual(TEST_CASES[i][0]);
  }
});
