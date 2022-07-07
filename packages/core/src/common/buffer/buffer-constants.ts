/**
 * Error strings
 */
export const ERRORS = {
  INVALID_ENCODING:
    'Invalid encoding provided. Please specify a valid encoding the internal Node.js Buffer supports.',
  INVALID_SMARTBUFFER_SIZE:
    'Invalid size provided. Size must be a valid integer greater than zero.',
  INVALID_SMARTBUFFER_BUFFER: 'Invalid Buffer provided in SmartBufferOptions.',
  INVALID_SMARTBUFFER_OBJECT:
    'Invalid SmartBufferOptions object supplied to SmartBuffer constructor or factory methods.',
  INVALID_OFFSET: 'An invalid offset value was provided.',
  INVALID_OFFSET_NON_NUMBER: 'An invalid offset value was provided. A numeric value is required.',
  INVALID_LENGTH: 'An invalid length value was provided.',
  INVALID_LENGTH_NON_NUMBER: 'An invalid length value was provived. A numeric value is required.',
  INVALID_TARGET_OFFSET: 'Target offset is beyond the bounds of the internal SmartBuffer data.',
  INVALID_TARGET_LENGTH:
    'Specified length value moves cursor beyong the bounds of the internal SmartBuffer data.',
  INVALID_READ_BEYOND_BOUNDS: 'Attempted to read beyond the bounds of the managed data.',
  INVALID_WRITE_BEYOND_BOUNDS: 'Attempted to write beyond the bounds of the managed data.',
} as const;
