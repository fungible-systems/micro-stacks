import {
  eciesGetJsonStringLength,
  encryptContent,
  getAesCbcOutputLength,
  getBase64OutputLength,
  getRandomBytes,
} from 'micro-stacks/crypto';
import { aes256CbcEncrypt } from 'micro-stacks/crypto-aes';
import { bytesToBase64 } from 'micro-stacks/common';

describe('size tests', function () {
  test('aes256Cbc output size calculation', async () => {
    const testLengths = [0, 1, 2, 3, 4, 8, 100, 500, 1000];
    for (let i = 0; i < 10; i++) {
      testLengths.push(Math.floor(Math.random() * Math.floor(1030)));
    }
    const iv = getRandomBytes(16);
    const key = Buffer.from(
      'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229',
      'hex'
    );
    for (const len of testLengths) {
      const data = getRandomBytes(len);
      const encryptedData = await aes256CbcEncrypt(iv, key, data);
      const calculatedLength = getAesCbcOutputLength(len);
      expect(calculatedLength).toEqual(encryptedData.length);
    }
  });

  test('base64 output size calculation', () => {
    const testLengths = [0, 1, 2, 3, 4, 8, 100, 500, 1000];
    for (let i = 0; i < 10; i++) {
      testLengths.push(Math.floor(Math.random() * Math.floor(1030)));
    }
    for (const len of testLengths) {
      const data = getRandomBytes(len);
      const encodedLength = bytesToBase64(data);
      const calculatedLength = getBase64OutputLength(len);
      expect(calculatedLength).toEqual(encodedLength.length);
    }
  });

  test('playload size detection', async () => {
    const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';

    // const gaiaHubConfig: GaiaHubConfig = {
    //   address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U',
    //   server: 'https://hub.blockstack.org',
    //   token: '',
    //   url_prefix: 'gaia.testblockstack2.org/hub/',
    //   // 500 bytes
    //   max_file_upload_size_megabytes: 0.0005,
    // };

    const data = Buffer.alloc(100);

    const encryptedData1 = await encryptContent(data, {
      wasString: false,
      cipherTextEncoding: 'hex',
      privateKey,
    });
    const detectedSize1 = eciesGetJsonStringLength({
      contentLength: data.byteLength,
      wasString: false,
      cipherTextEncoding: 'hex',
      sign: false,
    });
    expect(detectedSize1).toEqual(encryptedData1.length);

    const encryptedData2 = await encryptContent(data, {
      wasString: true,
      cipherTextEncoding: 'hex',
      privateKey,
    });
    const detectedSize2 = eciesGetJsonStringLength({
      contentLength: data.byteLength,
      wasString: true,
      cipherTextEncoding: 'hex',
      sign: false,
    });
    expect(detectedSize2).toEqual(encryptedData2.length);

    const encryptedData3 = await encryptContent(data, {
      wasString: true,
      cipherTextEncoding: 'hex',
      privateKey,
      sign: true,
    });
    const detectedSize3 = eciesGetJsonStringLength({
      contentLength: data.byteLength,
      wasString: true,
      cipherTextEncoding: 'hex',
      sign: true,
    });
    expect(detectedSize3).toEqual(729);

    // size can vary due to ECDSA signature DER encoding
    // range: 585 + (144 max)
    expect(encryptedData3.length).toBeGreaterThanOrEqual(585);
    expect(encryptedData3.length).toBeLessThanOrEqual(729);

    const encryptedData4 = await encryptContent(data, {
      wasString: true,
      cipherTextEncoding: 'base64',
      privateKey,
    });
    const detectedSize4 = eciesGetJsonStringLength({
      contentLength: data.byteLength,
      wasString: true,
      cipherTextEncoding: 'base64',
      sign: false,
    });
    expect(detectedSize4).toEqual(encryptedData4.length);
  });
});
