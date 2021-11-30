import { BooleanCV } from '../types/booleanCV';
import { BufferCV } from '../types/bufferCV';
import { IntCV, UIntCV } from '../types/intCV';
import { ContractPrincipalCV, StandardPrincipalCV } from '../types/principalCV';
import { ResponseErrorCV, ResponseOkCV } from '../types/responseCV';
import { NoneCV, SomeCV } from '../types/optionalCV';
import { ListCV } from '../types/listCV';
import { TupleCV } from '../types/tupleCV';
import { StringAsciiCV, StringUtf8CV } from '../types/stringCV';

export type ClarityValueResponse = ResponseErrorCV | ResponseOkCV;

export type ClarityValueNotResponse =
  | BooleanCV
  | BufferCV
  | IntCV
  | UIntCV
  | StandardPrincipalCV
  | ContractPrincipalCV
  | ResponseErrorCV
  | ResponseOkCV
  | NoneCV
  | SomeCV
  | ListCV
  | TupleCV
  | StringAsciiCV
  | StringUtf8CV;

export type ClarityValue = ClarityValueNotResponse | ClarityValueResponse;
