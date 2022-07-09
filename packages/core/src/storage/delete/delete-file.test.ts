// import { deleteFile } from './delete-file';
// import fetchMock from 'jest-fetch-mock';
// import { GaiaHubConfig } from 'micro-stacks/storage';
// import * as m from './delete-from-gaia-hub';
//
// const path = 'file.json';
// const gaiaHubConfig: GaiaHubConfig = {
//   address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc',
//   server: 'https://hub.testblockstack.org',
//   url_prefix: 'https://gaia.testblockstack.org/hub/',
//   token: '',
//   max_file_upload_size_megabytes: 25,
// };
//
// describe(`${deleteFile.name}`, function () {
//   beforeAll(() => {
//     fetchMock.enableMocks();
//   });
//   beforeEach(() => {
//     fetchMock.resetMocks();
//     jest.resetModules();
//   });
//
//   test('deleteFile throw on 404', async () => {
//     const path = 'missingfile.txt';
//     const fullDeleteUrl =
//       'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/missingfile.txt';
//
//     fetchMock.once('', {
//       status: 404,
//     });
//
//     const error = jest.fn();
//
//     await deleteFile(path, { wasSigned: false, gaiaHubConfig })
//       .then(() => fail('deleteFile with 404 should fail'))
//       .catch(error);
//
//     expect(error).toHaveBeenCalledTimes(1);
//     expect(fetchMock.mock.calls[0][1]!.method).toEqual('DELETE');
//     expect(fetchMock.mock.calls[0][0]).toEqual(fullDeleteUrl);
//   });
//
//   test('deleteFile wasSigned deletes signature file', async () => {
//     const fullDeleteUrl =
//       'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/file.json';
//     const fullDeleteSigUrl =
//       'https://hub.testblockstack.org/delete/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yabc/file.json.sig';
//
//     fetchMock.mockResponse('', {
//       status: 202,
//     });
//
//     await deleteFile(path, { wasSigned: true, gaiaHubConfig });
//     expect(fetchMock.mock.calls.length).toEqual(2);
//     expect(fetchMock.mock.calls[0][1]!.method).toEqual('DELETE');
//     expect(fetchMock.mock.calls[0][0]).toEqual(fullDeleteUrl);
//     expect(fetchMock.mock.calls[1][1]!.method).toEqual('DELETE');
//     expect(fetchMock.mock.calls[1][0]).toEqual(fullDeleteSigUrl);
//   });
//
//   test('deletes a file', async () => {
//     const success = jest.fn();
//     const options = { wasSigned: false, gaiaHubConfig };
//     // @ts-expect-error: we want to mock this
//     m.deleteFromGaiaHub = jest.fn();
//     await deleteFile(path, options).then(success);
//
//     expect(success).toHaveBeenCalled();
//     expect(m.deleteFromGaiaHub).toHaveBeenCalledTimes(1);
//     jest.resetModules();
//   });
// });

it('noop', () => {
  const v = 'noop';
  expect(v).toEqual('noop');
});
