import { deserializeStacksMessage, serializeStacksMessage, StacksMessage } from '../index';
import { BufferReader } from 'micro-stacks/common';
import { StacksMessageType } from 'micro-stacks/clarity';

export function serializeDeserialize(value: StacksMessage, type: StacksMessageType): StacksMessage {
  const serialized = serializeStacksMessage(value);
  const bufferReader = new BufferReader(serialized);
  return deserializeStacksMessage(bufferReader, type);
}
