import type { GaiaHubConfig } from './types';

/**
 * @ignore
 */
export const ERROR_CODES = {
  MISSING_PARAMETER: 'missing_parameter',
  REMOTE_SERVICE_ERROR: 'remote_service_error',
  INVALID_STATE: 'invalid_state',
  NO_SESSION_DATA: 'no_session_data',
  DOES_NOT_EXIST: 'does_not_exist',
  FAILED_DECRYPTION_ERROR: 'failed_decryption_error',
  INVALID_DID_ERROR: 'invalid_did_error',
  NOT_ENOUGH_FUNDS_ERROR: 'not_enough_error',
  INVALID_AMOUNT_ERROR: 'invalid_amount_error',
  LOGIN_FAILED_ERROR: 'login_failed',
  SIGNATURE_VERIFICATION_ERROR: 'signature_verification_failure',
  CONFLICT_ERROR: 'conflict_error',
  NOT_ENOUGH_PROOF_ERROR: 'not_enough_proof_error',
  BAD_PATH_ERROR: 'bad_path_error',
  VALIDATION_ERROR: 'validation_error',
  PAYLOAD_TOO_LARGE_ERROR: 'payload_too_large_error',
  PRECONDITION_FAILED_ERROR: 'precondition_failed_error',
  UNKNOWN: 'unknown',
};

Object.freeze(ERROR_CODES);

/**
 * @ignore
 */
type ErrorData = {
  code: string;
  parameter?: string;
  message: string;
};

/**
 * @ignore
 */
export class BlockstackError extends Error {
  message: string;

  code: string;

  parameter?: string;

  constructor(error: ErrorData) {
    super();
    let message = error.message;
    let bugDetails = `Error Code: ${error.code}`;
    let stack = this.stack;
    if (!stack) {
      try {
        throw new Error();
      } catch (e) {
        stack = (e as any).stack;
      }
    } else {
      bugDetails += `Stack Trace:\n${stack}`;
    }
    message += `\nIf you believe this exception is caused by a bug in blockstack.js,
      please file a bug report: https://github.com/blockstack/blockstack.js/issues\n\n${bugDetails}`;
    this.message = message;
    this.code = error.code;
    this.parameter = error.parameter ? error.parameter : undefined;
  }

  toString() {
    return `${super.toString()}
    code: ${this.code} param: ${this.parameter ? this.parameter : 'n/a'}`;
  }
}

/**
 * @ignore
 */
export class InvalidParameterError extends BlockstackError {
  constructor(parameter: string, message = '') {
    super({ code: ERROR_CODES.MISSING_PARAMETER, message, parameter });
    this.name = 'MissingParametersError';
  }
}

/**
 * @ignore
 */
export class MissingParameterError extends BlockstackError {
  constructor(parameter: string, message = '') {
    super({ code: ERROR_CODES.MISSING_PARAMETER, message, parameter });
    this.name = 'MissingParametersError';
  }
}

/**
 * @ignore
 */
export class RemoteServiceError extends BlockstackError {
  response: Response;

  constructor(response: Response, message = '') {
    super({ code: ERROR_CODES.REMOTE_SERVICE_ERROR, message });
    this.response = response;
  }
}

/**
 * @ignore
 */
export class InvalidDIDError extends BlockstackError {
  constructor(message = '') {
    super({ code: ERROR_CODES.INVALID_DID_ERROR, message });
    this.name = 'InvalidDIDError';
  }
}

/**
 * @ignore
 */
export class NotEnoughFundsError extends BlockstackError {
  leftToFund: number;

  constructor(leftToFund: number) {
    const message = `Not enough UTXOs to fund. Left to fund: ${leftToFund}`;
    super({ code: ERROR_CODES.NOT_ENOUGH_FUNDS_ERROR, message });
    this.leftToFund = leftToFund;
    this.name = 'NotEnoughFundsError';
    this.message = message;
  }
}

/**
 * @ignore
 */
export class InvalidAmountError extends BlockstackError {
  fees: number;

  specifiedAmount: number;

  constructor(fees: number, specifiedAmount: number) {
    const message =
      `Not enough coin to fund fees transaction fees. Fees would be ${fees},` +
      ` specified spend is  ${specifiedAmount}`;
    super({ code: ERROR_CODES.INVALID_AMOUNT_ERROR, message });
    this.specifiedAmount = specifiedAmount;
    this.fees = fees;
    this.name = 'InvalidAmountError';
    this.message = message;
  }
}

/**
 * @ignore
 */
export class LoginFailedError extends BlockstackError {
  constructor(reason: string) {
    const message = `Failed to login: ${reason}`;
    super({ code: ERROR_CODES.LOGIN_FAILED_ERROR, message });
    this.message = message;
    this.name = 'LoginFailedError';
  }
}

/**
 * @ignore
 */
export class SignatureVerificationError extends BlockstackError {
  constructor(reason: string) {
    const message = `Failed to verify signature: ${reason}`;
    super({ code: ERROR_CODES.SIGNATURE_VERIFICATION_ERROR, message });
    this.message = message;
    this.name = 'SignatureVerificationError';
  }
}

/**
 * @ignore
 */
export class FailedDecryptionError extends BlockstackError {
  constructor(message = 'Unable to decrypt cipher object.') {
    super({ code: ERROR_CODES.FAILED_DECRYPTION_ERROR, message });
    this.message = message;
    this.name = 'FailedDecryptionError';
  }
}

/**
 * @ignore
 */
export class InvalidStateError extends BlockstackError {
  constructor(message: string) {
    super({ code: ERROR_CODES.INVALID_STATE, message });
    this.message = message;
    this.name = 'InvalidStateError';
  }
}

/**
 * @ignore
 */
export class NoSessionDataError extends BlockstackError {
  constructor(message: string) {
    super({ code: ERROR_CODES.INVALID_STATE, message });
    this.message = message;
    this.name = 'NoSessionDataError';
  }
}

/**
 * @ignore
 */
export interface GaiaHubErrorResponse {
  status: number;
  statusText: string;
  body?: string | any;
}

export interface HubErrorDetails {
  message?: string;
  statusCode: number;
  statusText: string;

  [prop: string]: any;
}

/**
 * @ignore
 */
export class GaiaHubError extends BlockstackError {
  hubError?: HubErrorDetails;

  constructor(error: ErrorData, response: GaiaHubErrorResponse) {
    super(error);
    if (response) {
      this.hubError = {
        statusCode: response.status,
        statusText: response.statusText,
      };
      if (typeof response.body === 'string') {
        this.hubError.message = response.body;
      } else if (typeof response.body === 'object') {
        Object.assign(this.hubError, response.body);
      }
    }
  }
}

/**
 * @ignore
 */
export class DoesNotExist extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.DOES_NOT_EXIST }, response);
    this.name = 'DoesNotExist';
  }
}

/**
 * @ignore
 */
export class ConflictError extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.CONFLICT_ERROR }, response);
    this.name = 'ConflictError';
  }
}

/**
 * @ignore
 */
export class NotEnoughProofError extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.NOT_ENOUGH_PROOF_ERROR }, response);
    this.name = 'NotEnoughProofError';
  }
}

/**
 * @ignore
 */
export class BadPathError extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.BAD_PATH_ERROR }, response);
    this.name = 'BadPathError';
  }
}

/**
 * @ignore
 */
export class ValidationError extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.VALIDATION_ERROR }, response);
    this.name = 'ValidationError';
  }
}

/**
 * @ignore
 */
export class PayloadTooLargeError extends GaiaHubError {
  /** Can be `null` when an oversized payload is detected client-side. */
  // eslint-disable-next-line @typescript-eslint/ban-ts-comment
  // @ts-ignore TODO: fix
  hubError?: HubErrorDetails;

  maxUploadByteSize: number;

  constructor(message: string, response: GaiaHubErrorResponse | null, maxUploadByteSize: number) {
    super({ message, code: ERROR_CODES.PAYLOAD_TOO_LARGE_ERROR }, response!);
    this.name = 'PayloadTooLargeError';
    this.maxUploadByteSize = maxUploadByteSize;
  }
}

/**
 * @ignore
 */
export class PreconditionFailedError extends GaiaHubError {
  constructor(message: string, response: GaiaHubErrorResponse) {
    super({ message, code: ERROR_CODES.PRECONDITION_FAILED_ERROR }, response);
    this.name = 'PreconditionFailedError';
  }
}

async function getGaiaErrorResponse(response: Response): Promise<GaiaHubErrorResponse> {
  let responseMsg = '';
  let responseJson: any | undefined;
  try {
    responseMsg = await response.text();
    try {
      responseJson = JSON.parse(responseMsg);
    } catch (error) {
      // Use text instead
    }
  } catch (error) {
    console.debug(`Error getting bad http response text: ${error}`);
  }
  const status = response.status;
  const statusText = response.statusText;
  const body = responseJson || responseMsg;
  return { status, statusText, body };
}

/**
 * Converts megabytes to bytes. Returns 0 if the input is not a finite number.
 * @ignore
 */
export function megabytesToBytes(megabytes: number): number {
  if (!Number.isFinite(megabytes)) {
    return 0;
  }
  return Math.floor(megabytes * 1024 * 1024);
}

export async function getBlockstackErrorFromResponse(
  response: Response,
  errorMsg: string,
  hubConfig: GaiaHubConfig | null
): Promise<Error> {
  if (response.ok) {
    throw new Error('Cannot get a Stacks from a valid response.');
  }
  const gaiaResponse = await getGaiaErrorResponse(response);
  if (gaiaResponse.status === 401) {
    throw new ValidationError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 402) {
    throw new NotEnoughProofError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 403) {
    throw new BadPathError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 404) {
    throw new DoesNotExist(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 409) {
    throw new ConflictError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 412) {
    throw new PreconditionFailedError(errorMsg, gaiaResponse);
  } else if (gaiaResponse.status === 413) {
    const maxBytes =
      hubConfig && hubConfig.max_file_upload_size_megabytes
        ? megabytesToBytes(hubConfig.max_file_upload_size_megabytes)
        : 0;
    throw new PayloadTooLargeError(errorMsg, gaiaResponse, maxBytes);
  } else {
    throw new Error(errorMsg);
  }
}

/**
 * Determines if a gaia error response is possible to recover from
 * by refreshing the gaiaHubConfig, and retrying the request.
 */
export function isRecoverableGaiaError(error: GaiaHubError): boolean {
  if (!error || !error.hubError || !error.hubError.statusCode) {
    return false;
  }
  const statusCode = error.hubError.statusCode;
  // 401 Unauthorized: possible expired, but renewable auth token.
  if (statusCode === 401) {
    return true;
  }
  // 409 Conflict: possible concurrent writes to a file.
  if (statusCode === 409) {
    return true;
  }
  // 500s: possible server-side transient error
  if (statusCode >= 500 && statusCode <= 599) {
    return true;
  }
  return false;
}
