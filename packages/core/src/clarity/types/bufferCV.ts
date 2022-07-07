import { ClarityType } from '../common/constants';
import { utf8ToBytes } from 'micro-stacks/common';

export interface BufferCV {
  readonly type: ClarityType.Buffer;
  readonly buffer: Uint8Array;
}

export const bufferCV = (buffer: Uint8Array): BufferCV => {
  if (buffer.length > 1000000) {
    throw new Error('Cannot construct clarity buffer that is greater than 1MB');
  }

  return { type: ClarityType.Buffer, buffer: Uint8Array.from(buffer) };
};

export const bufferCVFromString = (string: string): BufferCV => bufferCV(utf8ToBytes(string));
