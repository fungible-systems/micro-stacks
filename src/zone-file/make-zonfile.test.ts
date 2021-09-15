import { makeProfileZoneFile } from 'micro-stacks/zone-file';

describe(makeProfileZoneFile.name, function () {
  test('makeZoneFileForHostedProfile', () => {
    const fileUrl = 'https://mq9.s3.amazonaws.com/naval.id/profile.json';
    const incorrectFileUrl = 'mq9.s3.amazonaws.com/naval.id/profile.json';
    const zoneFile = makeProfileZoneFile('naval.id', fileUrl);
    expect(zoneFile).toBeTruthy();
    expect(zoneFile.includes(`"${fileUrl}"`)).toBeTruthy();
    expect(zoneFile.includes(`"${incorrectFileUrl}"`)).not.toBeTruthy();
  });

  test('makeZoneFileForHostedProfile', () => {
    const fileUrl = 'https://mq9.s3.amazonaws.com/naval.id/profile.json';
    const incorrectFileUrl = 'mq9.s3.amazonaws.com/naval.id/profile.json';
    const zoneFile = makeProfileZoneFile('naval.id', fileUrl);

    expect(zoneFile).toBeTruthy();
    expect(zoneFile.includes(`"${fileUrl}"`)).toBeTruthy();
    expect(zoneFile.includes(`"${incorrectFileUrl}"`)).not.toBeTruthy();
  });
});
