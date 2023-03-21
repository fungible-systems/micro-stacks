import { getTokenFileUrl } from './index';

const ZONEFILE_CONTENT = {
  $origin: 'sigle.btc.',
  $ttl: 3600,
  uri: [
    {
      name: '@',
      target: '',
      priority: 10,
      weight: 1,
    },
    {
      name: '_http._tcp',
      target: 'https://gaia.blockstack.org/hub/15FF6jnJ1vV4fvo8LFPY1AK6dSbxMP6hkE/profile.json',
      priority: 10,
      weight: 1,
    },
  ],
};

describe('getTokenFileUrl tests', () => {
  it('should get token file url', async () => {
    expect(getTokenFileUrl(ZONEFILE_CONTENT)).toBe(ZONEFILE_CONTENT.uri[1].target);
  });
});
