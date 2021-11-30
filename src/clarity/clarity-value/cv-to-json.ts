import { cvToValue } from './cv-to-value';
import { ClarityType } from '../common/constants';
import { getCVTypeString } from './get-cv-type-string';
import { ClarityValue, ClarityValueNotResponse } from './types';
import { ResponseErrorCV, ResponseOkCV } from '../types/responseCV';

interface ResponseErr {
  type: string;
  value: any;
  success: false;
}

interface ResponseOk {
  type: string;
  value: any;
  success: true;
}

interface CvObject {
  type: string;
  value: any;
}

export function cvToJSON(val: ResponseOkCV): ResponseOk;
export function cvToJSON(val: ResponseErrorCV): ResponseErr;
export function cvToJSON(val: ClarityValueNotResponse): CvObject;
export function cvToJSON(val: ClarityValue): ResponseErr | ResponseOk | CvObject {
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
