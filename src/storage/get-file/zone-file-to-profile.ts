import { parseZoneFile, ZoneFileObject } from 'micro-stacks/zone-file';
import { getTokenFileUrl } from '../common';
import { getPersonFromLegacyFormat } from '../profile/schemas';
import { extractProfile } from '../profile/tokens';
import { fetchPrivate } from 'micro-stacks/common';

/**
 * Resolves a profile from a zonefile string
 * @param zoneFile - the string zonefile to parse
 * @param publicKeyOrAddress - the public key or address of the keypair that is thought to have signed the token
 */
export async function resolveZoneFileToProfile(zoneFile: string, publicKeyOrAddress: string) {
  let zoneFileJson: ZoneFileObject | null = parseZoneFile(zoneFile);
  if (!zoneFileJson.hasOwnProperty('$origin')) zoneFileJson = null;

  const hasKeys = zoneFileJson && Object.keys(zoneFileJson).length > 0;

  if (!hasKeys) return getPersonFromLegacyFormat(JSON.parse(zoneFile));

  const tokenFileUrl: string | null = getTokenFileUrl(zoneFileJson);

  if (tokenFileUrl) {
    try {
      const response = await fetchPrivate(tokenFileUrl);
      const tokenRecords = await response.json();
      return extractProfile(tokenRecords[0].token, publicKeyOrAddress);
    } catch (e) {
      console.error(
        `[micro-stacks] resolveZoneFileToProfile: error fetching token file ${tokenFileUrl}: ${e}`
      );
      throw e;
    }
  }
  console.debug('[micro-stacks] Token file url not found. Resolving to blank profile.');
  return {};
}
