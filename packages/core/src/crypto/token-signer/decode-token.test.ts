import { decodeToken as _decodeToken } from 'jsontokens';
import { decodeToken } from './decode-token';
import base64url from './base64url';
import { TokenInterface } from 'micro-stacks/crypto';

const sampleDecodedToken = {
  header: { typ: 'JWT', alg: 'ES256K' },
  payload: {
    issuedAt: '1440713414.85',
    challenge: '7cd9ed5e-bb0e-49ea-a323-f28bde3a0549',
    issuer: {
      publicKey: '03fdd57adec3d438ea237fe46b33ee1e016eda6b585c3e27ea66686c2ea5358479',
      chainPath: 'bd62885ec3f0e3838043115f4ce25eedd22cc86711803fb0c19601eeef185e39',
      publicKeychain:
        'xpub661MyMwAqRbcFQVrQr4Q4kPjaP4JjWaf39fBVKjPdK6oGBayE46GAmKzo5UDPQdLSM9DufZiP8eauy56XNuHicBySvZp7J5wsyQVpi2axzZ',
      blockchainid: 'ryan',
    },
  },
  signature:
    'oO7ROPKq3T3X0azAXzHsf6ub6CYy5nUUFDoy8MS22B3TlYisqsBrRtzWIQcSYiFXLytrXwAdt6vjehj3OFioDQ',
};

const TOKEN =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJjb250cmFjdEFkZHJlc3MiOiJTUDAwMDAwMDAwMDAwMDAwMDAwMDAwMlE2VkY3OCIsImNvbnRyYWN0TmFtZSI6ImJucyIsImZ1bmN0aW9uTmFtZSI6Im5hbWUtcHJlb3JkZXIiLCJuZXR3b3JrIjp7InZlcnNpb24iOjAsImNoYWluSWQiOjEsImJuc0xvb2t1cFVybCI6Imh0dHBzOi8vc3RhY2tzLW5vZGUtYXBpLm1haW5uZXQuc3RhY2tzLmNvIiwiYnJvYWRjYXN0RW5kcG9pbnQiOiIvdjIvdHJhbnNhY3Rpb25zIiwidHJhbnNmZXJGZWVFc3RpbWF0ZUVuZHBvaW50IjoiL3YyL2ZlZXMvdHJhbnNmZXIiLCJhY2NvdW50RW5kcG9pbnQiOiIvdjIvYWNjb3VudHMiLCJjb250cmFjdEFiaUVuZHBvaW50IjoiL3YyL2NvbnRyYWN0cy9pbnRlcmZhY2UiLCJyZWFkT25seUZ1bmN0aW9uQ2FsbEVuZHBvaW50IjoiL3YyL2NvbnRyYWN0cy9jYWxsLXJlYWQiLCJjb3JlQXBpVXJsIjoiaHR0cHM6Ly9zdGFja3Mtbm9kZS1hcGkubWFpbm5ldC5zdGFja3MuY28ifSwicG9zdENvbmRpdGlvbk1vZGUiOjEsInBvc3RDb25kaXRpb25zIjpbIjAxMDIxNjdhNmEyNDg3ZjlkYzU0MzJhZTA0NTFlOTZlNWFkY2YyOWRmMDE2OGIxNjdhNmEyNDg3ZjlkYzU0MzJhZTA0NTFlOTZlNWFkY2YyOWRmMDE2OGIwNTc0Njg2OTZlNjcwNTc0Njg2OTZlNjcwMTAwMDAwMDAwMDAwNjljYTgiXSwiZnVuY3Rpb25BcmdzIjpbIjAyMDAwMDAwMTQ2NmM1ZjliOWU5MDc2MjU2MzZhOTM5YmFmNTU4YzRkZGVmMjJjYmRhIiwiMDEwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDAwMDA2OWNhOCJdLCJ0eFR5cGUiOiJjb250cmFjdF9jYWxsIiwicHVibGljS2V5IjoiMDI3Y2I5N2FmYTlhOThiNDI1YmJhOGIwODYxNWNkNzU4MzVjZmFlY2U0YjUxZTlmM2I0NDIzZGRiYjMyNGE1NjUzIn0.EkuojJqF2PzZfpSmULpjLMgq3Nm7fME0_jMYVNvd8XbApNMKn9xqIcj8_cyujVXlEvZmIRzpIQIVP48B6CDohw';
const sampleToken =
  'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJpc3N1ZWRBdCI6IjE0NDA3MTM0MTQuODUiLCJjaGFsbGVuZ2UiOiI3Y2Q5ZWQ1ZS1iYjBlLTQ5ZWEtYTMyMy1mMjhiZGUzYTA1NDkiLCJpc3N1ZXIiOnsicHVibGljS2V5IjoiMDNmZGQ1N2FkZWMzZDQzOGVhMjM3ZmU0NmIzM2VlMWUwMTZlZGE2YjU4NWMzZTI3ZWE2NjY4NmMyZWE1MzU4NDc5IiwiY2hhaW5QYXRoIjoiYmQ2Mjg4NWVjM2YwZTM4MzgwNDMxMTVmNGNlMjVlZWRkMjJjYzg2NzExODAzZmIwYzE5NjAxZWVlZjE4NWUzOSIsInB1YmxpY0tleWNoYWluIjoieHB1YjY2MU15TXdBcVJiY0ZRVnJRcjRRNGtQamFQNEpqV2FmMzlmQlZLalBkSzZvR0JheUU0NkdBbUt6bzVVRFBRZExTTTlEdWZaaVA4ZWF1eTU2WE51SGljQnlTdlpwN0o1d3N5UVZwaTJheHpaIiwiYmxvY2tjaGFpbmlkIjoicnlhbiJ9fQ.DUf6Rnw6FBKv4Q3y95RX7rR6HG_L1Va96ThcIYTycOf1j_bf9WleLsOyiZ-35Qfw7FgDnW7Utvz4sNjdWOSnhQ';

describe('Decode tokens', () => {
  it('decodes tokens the same way jsontokens does', () => {
    const new_one = decodeToken(TOKEN);
    const old_one = _decodeToken(TOKEN);
    expect(old_one.payload).toEqual(new_one?.payload);
  });
  it('errors if object is passed', () => {
    expect(() => {
      decodeToken({} as unknown as TokenInterface);
    }).toThrow('Expected token payload to be a base64 or json string');
  });

  test('decodeToken', () => {
    const decodedToken = decodeToken(sampleToken);
    expect(decodeToken).toBeTruthy();
    expect(JSON.stringify((decodedToken as any).payload)).toBe(
      JSON.stringify(sampleDecodedToken.payload)
    );
  });

  test('decodeToken with base64 encoded payload', () => {
    const tokenParts = sampleToken.split('.');
    const header = tokenParts[0];
    const payload = tokenParts[1];
    const signature = tokenParts[2];
    const decodedToken = decodeToken({
      header: [header],
      payload,
      signature,
    });
    expect(decodeToken).toBeTruthy();
    expect(JSON.stringify((decodedToken as any).payload)).toBe(
      JSON.stringify(sampleDecodedToken.payload)
    );
  });
});
