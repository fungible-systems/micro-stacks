import { cvToValue } from './cv-to-value';
import { ClarityType } from '../common/constants';
import { getCVTypeString } from './get-cv-type-string';
import { ClarityValue } from './types';

export async function cvToJSON(val: ClarityValue): Promise<any> {
  const value = await cvToValue(val, true);
  switch (val.type) {
    case ClarityType.ResponseErr:
      return { type: getCVTypeString(val), value, success: false };
    case ClarityType.ResponseOk:
      return { type: getCVTypeString(val), value, success: true };
    default:
      return { type: getCVTypeString(val), value };
  }
}
