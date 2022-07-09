// import {
//   GaiaHubConfig,
//   getFile,
//   GetFileOptions,
//   putFile,
//   PutFileOptions,
// } from 'micro-stacks/storage';
// // import fetchMock from 'jest-fetch-mock';
// import * as hub from './gaia/hub';
// import * as jsdom from 'jsdom';
// import { bytesToHex, bytesToUtf8, utf8ToBytes } from 'micro-stacks/common';
// import { getPublicKey } from 'micro-stacks/crypto';
// import { encryptContent } from 'micro-stacks/crypto';
//
// // describe(putFile.name, () => {
// //   const path = 'file.json';
// //   const gaiaHubConfig: GaiaHubConfig = {
// //     address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U',
// //     server: 'https://hub.blockstack.org',
// //     url_prefix: 'https://gaia.testblockstack.org/hub/',
// //     token: '',
// //     max_file_upload_size_megabytes: 25,
// //   };
// //
// //   const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';
// //
// //   const fullReadUrl =
// //     'https://gaia.testblockstack.org/hub/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U/file.json';
// //
// //   beforeAll(() => {
// //     fetchMock.enableMocks();
// //   });
// //   beforeEach(() => {
// //     fetchMock.resetMocks();
// //     jest.resetModules();
// //   });
// //
// //   test('putFile unencrypted, using Blob content', async () => {
// //     const dom = new jsdom.JSDOM('', {}).window;
// //     const globalAPIs: { [key: string]: any } = {
// //       File: dom.File,
// //       Blob: dom.Blob,
// //       FileReader: (dom as any).FileReader as FileReader,
// //     };
// //     for (const globalAPI of Object.keys(globalAPIs)) {
// //       (global as any)[globalAPI] = globalAPIs[globalAPI];
// //     }
// //     try {
// //       const fileContent = new dom.File(['file content test'], 'filenametest.txt', {
// //         type: 'text/example',
// //       });
// //
// //       const options = { encrypt: false, gaiaHubConfig };
// //
// //       const fullReadUrl =
// //         'https://gaia.testblockstack.org/hub/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U/file.json';
// //
// //       const uploadToGaiaHub = ((hub as any).uploadToGaiaHub = jest.fn().mockResolvedValue({
// //         publicURL: fullReadUrl,
// //       }));
// //
// //       const publicURL = await putFile(path, fileContent, options);
// //       expect(publicURL).toEqual(fullReadUrl);
// //       expect(uploadToGaiaHub.mock.calls[0][0].contentType).toEqual('text/example');
// //     } finally {
// //       for (const globalAPI of Object.keys(globalAPIs)) {
// //         delete (global as any)[globalAPI];
// //       }
// //     }
// //   });
// //
// //   test('putFile encrypted, using Blob content, encrypted', async () => {
// //     const dom = new jsdom.JSDOM('', {}).window;
// //     const globalAPIs: { [key: string]: any } = {
// //       File: dom.File,
// //       Blob: dom.Blob,
// //       FileReader: (dom as any).FileReader as FileReader,
// //     };
// //     for (const globalAPI of Object.keys(globalAPIs)) {
// //       (global as any)[globalAPI] = globalAPIs[globalAPI];
// //     }
// //     try {
// //       const contentDataString = 'file content test';
// //       const fileContent = new dom.File([contentDataString], 'filenametest.txt', {
// //         type: 'text/example',
// //       });
// //
// //       const uploadToGaiaHub = ((hub as any).uploadToGaiaHub = jest.fn().mockResolvedValue({
// //         publicURL: fullReadUrl,
// //       }));
// //
// //       (hub as any).getFullReadUrl = jest.fn().mockResolvedValue(fullReadUrl);
// //
// //       const encryptOptions: PutFileOptions = { encrypt: true, gaiaHubConfig, privateKey };
// //       const decryptOptions: GetFileOptions = { decrypt: true, gaiaHubConfig, privateKey };
// //       // put and encrypt the file
// //       const publicURL = await putFile(path, fileContent, encryptOptions);
// //       expect(publicURL).toEqual(fullReadUrl);
// //       const encryptedContent = uploadToGaiaHub.mock.calls[0][0].contents;
// //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
// //       fetchMock.once(encryptedContent);
// //       const readContent = await getFile(path, decryptOptions);
// //       const readContentStr = bytesToUtf8(readContent as Uint8Array);
// //       expect(readContentStr).toEqual(contentDataString);
// //     } finally {
// //       for (const globalAPI of Object.keys(globalAPIs)) {
// //         delete (global as any)[globalAPI];
// //       }
// //     }
// //   });
// //
// //   test('putFile unencrypted, using TypedArray content, encrypted', async () => {
// //     try {
// //       const contentDataString = 'file content test1234567';
// //       const fileContent = utf8ToBytes(contentDataString);
// //       const uploadToGaiaHub = ((hub as any).uploadToGaiaHub = jest.fn().mockResolvedValue({
// //         publicURL: fullReadUrl,
// //       }));
// //
// //       (hub as any).getFullReadUrl = jest.fn().mockResolvedValue(fullReadUrl);
// //
// //       const encryptOptions: PutFileOptions = {
// //         encrypt: false,
// //         contentType: 'text/plain; charset=utf-8',
// //         gaiaHubConfig,
// //         privateKey,
// //       };
// //       const decryptOptions: GetFileOptions = { decrypt: false, gaiaHubConfig };
// //       // put and encrypt the file
// //       const publicURL = await putFile(path, fileContent, encryptOptions);
// //       const postedContent = uploadToGaiaHub.mock.calls[0][0].contents;
// //       expect(publicURL).toEqual(fullReadUrl);
// //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
// //       fetchMock.once(postedContent, {
// //         headers: {
// //           'Content-Type': 'text/plain; charset=utf-8',
// //         },
// //       });
// //       const readContent = await getFile(path, decryptOptions);
// //       const readContentStr = readContent;
// //       expect(readContentStr).toEqual(contentDataString);
// //     } finally {
// //     }
// //   });
// //   test('putFile encrypted, using TypedArray content, encrypted', async () => {
// //     try {
// //       const contentDataString = 'file content test1234567';
// //       const fileContent = utf8ToBytes(contentDataString);
// //       const uploadToGaiaHub = ((hub as any).uploadToGaiaHub = jest.fn().mockResolvedValue({
// //         publicURL: fullReadUrl,
// //       }));
// //
// //       (hub as any).getFullReadUrl = jest.fn().mockResolvedValue(fullReadUrl);
// //
// //       const encryptOptions: PutFileOptions = {
// //         encrypt: true,
// //         contentType: 'text/plain; charset=utf-8',
// //         gaiaHubConfig,
// //         privateKey,
// //       };
// //       const decryptOptions: GetFileOptions = {
// //         decrypt: true,
// //         privateKey,
// //         gaiaHubConfig,
// //       };
// //       // put and encrypt the file
// //       const publicURL = await putFile(path, fileContent, encryptOptions);
// //       const postedContent = uploadToGaiaHub.mock.calls[0][0].contents;
// //       expect(publicURL).toEqual(fullReadUrl);
// //       // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
// //       fetchMock.once(postedContent, {
// //         headers: {
// //           'Content-Type': 'text/plain; charset=utf-8',
// //         },
// //       });
// //       const readContent = await getFile(path, decryptOptions);
// //       const readContentStr = bytesToUtf8(readContent as Uint8Array);
// //       expect(readContentStr).toEqual(contentDataString);
// //     } finally {
// //     }
// //   });
// //   test('putFile encrypt/no-sign using specifying public key & getFile decrypt', async () => {
// //     const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';
// //     const publicKey = bytesToHex(getPublicKey(privateKey, true));
// //
// //     const fileContent = JSON.stringify({ test: 'test' });
// //
// //     (hub as any).uploadToGaiaHub = jest.fn().mockResolvedValue({
// //       publicURL: fullReadUrl,
// //     });
// //
// //     (hub as any).getFullReadUrl = jest.fn().mockResolvedValue(fullReadUrl);
// //
// //     fetchMock.once(await encryptContent(fileContent, { publicKey }));
// //
// //     const encryptOptions: PutFileOptions = { encrypt: publicKey, gaiaHubConfig };
// //     const decryptOptions: GetFileOptions = { decrypt: privateKey, gaiaHubConfig };
// //     // put and encrypt the file
// //     await putFile(path, fileContent, encryptOptions)
// //       .then((publicURL: string) => {
// //         expect(publicURL).toEqual(fullReadUrl);
// //       })
// //       .then(() => {
// //         // read and decrypt the file
// //         return getFile(path, decryptOptions).then((readContent: any) => {
// //           expect(readContent).toEqual(fileContent);
// //         });
// //       });
// //   });
// // });
//
//

it('noop', () => {
  const v = 'noop';
  expect(v).toEqual('noop');
});
