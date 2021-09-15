import { DEFAULT_ZONEFILE_LOOKUP_URL } from './common/constants';
import { resolveZoneFileToProfile } from './get-file/zone-file-to-profile';
import type { ProfileLookupOptions } from './common/types';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Look up a user profile by BNS name
 *
 * @returns {Promise} that resolves to a profile object
 */
export async function lookupProfile(
  options: ProfileLookupOptions
): Promise<Record<string, any> | null> {
  const { username, zoneFileLookupURL = DEFAULT_ZONEFILE_LOOKUP_URL } = options;
  if (!username) return Promise.reject();
  const url = `${zoneFileLookupURL.replace(/\/$/, '')}/${options.username}`;
  const res = await fetchPrivate(url);
  const payload = await res.json();
  if (payload.hasOwnProperty('zonefile') && payload.hasOwnProperty('address')) {
    return (await resolveZoneFileToProfile(payload.zonefile, payload.address)) as Record<
      string,
      any
    > | null;
  } else {
    throw new Error(
      'Invalid zonefile lookup response: did not contain `address`' + ' or `zonefile` field'
    );
  }
}
