import {
  GaiaHubConfig,
  generateGaiaHubConfig,
  makeScopedGaiaAuthToken,
} from 'micro-stacks/storage';
import { TokenVerifier } from 'micro-stacks/crypto';
import { getPublicKey } from 'micro-stacks/crypto';

const gaiaHubConfig: GaiaHubConfig = {
  address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U',
  server: 'https://hub.blockstack.org',
  token: '',
  url_prefix: 'https://gaia.blockstack.org/hub/',
  max_file_upload_size_megabytes: 20,
};

const privateKey = 'a5c61c6ca7b3e7e55edee68566aeab22e4da26baa285c7bd10e8d2218aa3b229';

describe(generateGaiaHubConfig.name, function () {
  it('can generate a basic config', async () => {
    const config = await generateGaiaHubConfig({
      gaiaHubUrl: gaiaHubConfig.server,
      privateKey,
    });
    expect(config.address).toEqual(gaiaHubConfig.address);
    expect(config.server).toEqual(gaiaHubConfig.server);
    expect(config.url_prefix).toEqual(gaiaHubConfig.url_prefix);
  });
});

describe(makeScopedGaiaAuthToken.name, () => {
  it('works', async () => {
    const config = await generateGaiaHubConfig({
      gaiaHubUrl: gaiaHubConfig.server,
      privateKey,
    });
    const publicKey = getPublicKey(privateKey);
    const verifier = new TokenVerifier('ES256k', publicKey);
    const isValid = await verifier.verify(config.token.split('v1:')[1]);
    expect(isValid).toEqual(true);
  });
});
