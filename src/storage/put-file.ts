import {
  eciesGetJsonStringLength,
  signECDSA,
  encryptContent,
  getPublicKey,
} from 'micro-stacks/crypto';

import { uploadToGaiaHub } from './gaia/hub';
import { SIGNATURE_FILE_SUFFIX } from './common/constants';
import { FileContentLoader } from './common/file-content-loader';
import { isRecoverableGaiaError, megabytesToBytes, PayloadTooLargeError } from './gaia/errors';

import type { GaiaHubConfig } from './gaia/types';
import type { PutFileOptions } from './common/types';
import { bytesToHex } from 'micro-stacks/common';

export async function putFile(
  path: string,
  content: string | Uint8Array | ArrayBufferView | Blob,
  options: PutFileOptions
): Promise<string> {
  let { privateKey } = options;
  const { encrypt, sign: shouldSign, gaiaHubConfig, cipherTextEncoding } = options;
  let { contentType = '' } = options;

  const maxUploadBytes = megabytesToBytes(gaiaHubConfig.max_file_upload_size_megabytes);
  const hasMaxUpload = maxUploadBytes > 0;

  const contentLoader = new FileContentLoader(content, contentType);
  contentType = contentLoader.contentType;

  // When not encrypting the content length can be checked immediately.
  if (!encrypt && hasMaxUpload && contentLoader.contentByteLength > maxUploadBytes) {
    const sizeErrMsg = `The max file upload size for this hub is ${maxUploadBytes} bytes, the given content is ${contentLoader.contentByteLength} bytes`;
    const sizeErr = new PayloadTooLargeError(sizeErrMsg, null, maxUploadBytes);
    console.error(sizeErr);
    throw sizeErr;
  }

  // When encrypting, the content length must be calculated. Certain types like `Blob`s must
  // be loaded into memory.
  if (encrypt && hasMaxUpload && cipherTextEncoding) {
    const encryptedSize = eciesGetJsonStringLength({
      contentLength: contentLoader.contentByteLength,
      wasString: contentLoader.wasString,
      sign: !!shouldSign,
      cipherTextEncoding,
    });
    if (encryptedSize > maxUploadBytes) {
      const sizeErrMsg = `The max file upload size for this hub is ${maxUploadBytes} bytes, the given content is ${encryptedSize} bytes after encryption`;
      const sizeErr = new PayloadTooLargeError(sizeErrMsg, null, maxUploadBytes);
      console.error(sizeErr);
      throw sizeErr;
    }
  }

  let uploadFn: (hubConfig: GaiaHubConfig) => Promise<string>;

  // In the case of signing, but *not* encrypting, we perform two uploads.
  if (!encrypt && shouldSign) {
    const contents: string | Uint8Array = await contentLoader.load();

    if (typeof shouldSign === 'string') {
      privateKey = shouldSign;
    } else if (!privateKey) {
      throw Error('Need to pass private key');
    }

    const signatureResponse = await signECDSA({ contents, privateKey });

    uploadFn = async (hubConfig: GaiaHubConfig) => {
      const writeResponse = (
        await Promise.all([
          uploadToGaiaHub({
            filename: path,
            contents,
            hubConfig,
            contentType,
          }),
          uploadToGaiaHub({
            filename: `${path}${SIGNATURE_FILE_SUFFIX}`,
            contents: JSON.stringify(signatureResponse),
            hubConfig,
            contentType: 'application/json',
          }),
        ])
      )[0];
      return writeResponse.publicURL;
    };
  } else {
    // In all other cases, we only need one upload.
    let contentForUpload: string | Uint8Array | Blob;
    if (!encrypt && !shouldSign) {
      // If content does not need encrypted or signed, it can be passed directly
      // to the fetch request without loading into memory.
      contentForUpload = contentLoader.content;
    } else {
      // Use the `encrypt` key, otherwise the `sign` key, if neither are specified
      // then use the current user's app public key.
      let publicKey: string;
      if (typeof encrypt === 'string') {
        publicKey = encrypt;
      } else if (typeof shouldSign === 'string') {
        publicKey = bytesToHex(getPublicKey(shouldSign, true));
      } else if (privateKey) {
        publicKey = bytesToHex(getPublicKey(privateKey, true));
      } else {
        throw new Error('No private key passed');
      }
      const contentData = await contentLoader.load();
      const cipherObject = await encryptContent(contentData, {
        publicKey,
        wasString: contentLoader.wasString,
        cipherTextEncoding,
        privateKey,
      });

      contentForUpload = JSON.stringify(cipherObject);

      if (privateKey) {
        const { signature, publicKey: signaturePublicKey } = await signECDSA({
          contents: cipherObject,
          privateKey: privateKey!,
        });

        contentForUpload = JSON.stringify({
          signature,
          publicKey: signaturePublicKey,
          cipherText: cipherObject,
        });
      }
      contentType = 'application/json';
    }

    uploadFn = async (hubConfig: GaiaHubConfig) => {
      const writeResponse = await uploadToGaiaHub({
        filename: path,
        contents: contentForUpload,
        hubConfig,
        contentType,
      });
      return writeResponse.publicURL;
    };
  }

  try {
    return await uploadFn(gaiaHubConfig);
  } catch (error: any) {
    // If the upload fails on first attempt, it could be due to a recoverable
    // error which may succeed by refreshing the config and retrying.
    // eslint-disable-next-line @typescript-eslint/no-unsafe-argument
    if (isRecoverableGaiaError(error)) {
      console.error(error);
      console.error('Possible recoverable error during Gaia upload, retrying...');
      return await uploadFn(gaiaHubConfig);
    } else {
      throw error;
    }
  }
}
