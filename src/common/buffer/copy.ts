export function copy(
  currentBuff: Uint8Array,
  target: Uint8Array,
  targetStart: number,
  start?: number,
  end?: number
) {
  if (!start) start = 0;
  if (!end && end !== 0) end = currentBuff.length;
  if (targetStart >= target.length) targetStart = target.length;
  if (!targetStart) targetStart = 0;
  if (end > 0 && end < start) end = start;

  // Copy 0 bytes; we're done
  if (end === start) return 0;
  if (target.length === 0 || currentBuff.length === 0) return 0;

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds');
  }
  if (start < 0 || start >= currentBuff.length) throw new RangeError('Index out of range');
  if (end < 0) throw new RangeError('sourceEnd out of bounds');

  // Are we oob?
  if (end > currentBuff.length) end = currentBuff.length;
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start;
  }

  const len = end - start;

  if (currentBuff === target && typeof Uint8Array.prototype.copyWithin === 'function') {
    // Use built-in when available, missing from IE11
    currentBuff.copyWithin(targetStart, start, end);
  } else {
    Uint8Array.prototype.set.call(target, currentBuff.subarray(start, end), targetStart);
  }

  return len;
}
