import { cvToValue } from './cv-to-value';
import { ClarityType } from '../common/constants';
import { getCVTypeString } from './get-cv-type-string';
import { ClarityValue } from './types';
import { ResponseErrorCV, ResponseOkCV } from '../types/responseCV';

export interface CvToJsonResponseErr {
  type: string;
  value: any;
  success: false;
}

export interface CvToJsonResponseOk {
  type: string;
  value: any;
  success: true;
}

export interface CvToJsonCvObject {
  type: string;
  value: any;
}

export function cvToJSON(val: ResponseOkCV): CvToJsonResponseOk;
export function cvToJSON(val: ResponseErrorCV): CvToJsonResponseErr;
export function cvToJSON(val: ClarityValue): CvToJsonCvObject;
export function cvToJSON(
  val: ClarityValue
): CvToJsonResponseErr | CvToJsonResponseOk | CvToJsonCvObject {
  const value = cvToValue(val, true);
  switch (val.type) {
    case ClarityType.ResponseErr:
      return { type: getCVTypeString(val), value, success: false };
    case ClarityType.ResponseOk:
      return { type: getCVTypeString(val), value, success: true };
    default:
      return { type: getCVTypeString(val), value };
  }
}
