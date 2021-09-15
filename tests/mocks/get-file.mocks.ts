import { GaiaHubConfig } from 'micro-stacks/storage';
import { rest } from 'msw';

const FILE_PATH = 'file.json';
const gaiaHubConfig: GaiaHubConfig = {
  address: '1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U',
  server: 'https://hub.blockstack.org',
  token: '',
  url_prefix: 'https://gaia.testblockstack.org/hub/',
  max_file_upload_size_megabytes: 25,
};

const NAME_RECORD = {
  status: 'registered',
  zonefile:
    '$ORIGIN yukan.id\n$TTL 3600\n_http._tcp URI 10 1 "https://gaia.blockstack.org/hub/16zVUoP7f15nfTiHw2UNiX8NT5SWYqwNv3/0/profile.json"\n',
  expire_block: 581432,
  blockchain: 'bitcoin',
  last_txid: 'f7fa811518566b1914a098c3bd61a810aee56390815bd608490b0860ac1b5b4d',
  address: 'SP10VG75GE4PE0VBA3KD3NVKSYEMM3YV9V17HJ32N',
  zonefile_hash: '98f42e11026d42d394b3424d4d7f0cccd6f376e2',
};
const FILE_CONTENT = { key: 'value' };

const PROFILE_CONTENT = [
  {
    token:
      'eyJ0eXAiOiJKV1QiLCJhbGciOiJFUzI1NksifQ.eyJqdGkiOiJjNDhmOTQ0OC1hMGZlLTRiOWUtOWQ2YS1mYzA5MzhjOGUyNzAiLCJpYXQiOiIyMDE4LTAxLTA4VDE4OjIyOjI0Ljc5NloiLCJleHAiOiIyMDE5LTAxLTA4VDE4OjIyOjI0Ljc5NloiLCJzdWJqZWN0Ijp7InB1YmxpY0tleSI6IjAyNDg3YTkxY2Q5NjZmYWVjZWUyYWVmM2ZkZTM3MjgwOWI0NmEzNmVlMTkyNDhjMDFmNzJiNjQ1ZjQ0Y2VmMmUyYyJ9LCJpc3N1ZXIiOnsicHVibGljS2V5IjoiMDI0ODdhOTFjZDk2NmZhZWNlZTJhZWYzZmRlMzcyODA5YjQ2YTM2ZWUxOTI0OGMwMWY3MmI2NDVmNDRjZWYyZTJjIn0sImNsYWltIjp7IkB0eXBlIjoiUGVyc29uIiwiQGNvbnRleHQiOiJodHRwOi8vc2NoZW1hLm9yZyIsImltYWdlIjpbeyJAdHlwZSI6IkltYWdlT2JqZWN0IiwibmFtZSI6ImF2YXRhciIsImNvbnRlbnRVcmwiOiJodHRwczovL3d3dy5kcm9wYm94LmNvbS9zL2oxaDBrdHMwbTdhYWRpcC9hdmF0YXItMD9kbD0xIn1dLCJnaXZlbk5hbWUiOiIiLCJmYW1pbHlOYW1lIjoiIiwiZGVzY3JpcHRpb24iOiIiLCJhY2NvdW50IjpbeyJAdHlwZSI6IkFjY291bnQiLCJwbGFjZWhvbGRlciI6ZmFsc2UsInNlcnZpY2UiOiJoYWNrZXJOZXdzIiwiaWRlbnRpZmllciI6Inl1a2FubCIsInByb29mVHlwZSI6Imh0dHAiLCJwcm9vZlVybCI6Imh0dHBzOi8vbmV3cy55Y29tYmluYXRvci5jb20vdXNlcj9pZD15dWthbmwifSx7IkB0eXBlIjoiQWNjb3VudCIsInBsYWNlaG9sZGVyIjpmYWxzZSwic2VydmljZSI6ImdpdGh1YiIsImlkZW50aWZpZXIiOiJ5a25sIiwicHJvb2ZUeXBlIjoiaHR0cCIsInByb29mVXJsIjoiaHR0cHM6Ly9naXN0LmdpdGh1Yi5jb20veWtubC8xZjcwMThiOThmNzE2ZjAxNWE2Y2Y0NGZkYTA4MDZkNyJ9LHsiQHR5cGUiOiJBY2NvdW50IiwicGxhY2Vob2xkZXIiOmZhbHNlLCJzZXJ2aWNlIjoidHdpdHRlciIsImlkZW50aWZpZXIiOiJ5dWthbmwiLCJwcm9vZlR5cGUiOiJodHRwIiwicHJvb2ZVcmwiOiJodHRwczovL3R3aXR0ZXIuY29tL3l1a2FuTC9zdGF0dXMvOTE2NzQwNzQ5MjM2MTAxMTIwIn1dLCJuYW1lIjoiS2VuIExpYW8iLCJhcHBzIjp7Imh0dHA6Ly9sb2NhbGhvc3Q6ODA4MCI6Imh0dHBzOi8vZ2FpYS5ibG9ja3N0YWNrLm9yZy9odWIvMUREVXFmS3RRZ1lOdDcyMnd1QjRaMmZQQzdhaU5HUWE1Ui8ifX19.UyQNZ02kBFHEovbwiGaS-VQd57w9kcwn1Nt3QbW3afEMArg1OndmeplB7lzjMuRCLAi-88lkpQLkFw7LwKZ31Q',
    decodedToken: {
      header: {
        typ: 'JWT',
        alg: 'ES256K',
      },
      payload: {
        jti: 'c48f9448-a0fe-4b9e-9d6a-fc0938c8e270',
        iat: '2018-01-08T18:22:24.796Z',
        exp: '2019-01-08T18:22:24.796Z',
        subject: {
          publicKey: '02487a91cd966faecee2aef3fde372809b46a36ee19248c01f72b645f44cef2e2c',
        },
        issuer: {
          publicKey: '02487a91cd966faecee2aef3fde372809b46a36ee19248c01f72b645f44cef2e2c',
        },
        claim: {
          '@type': 'Person',
          '@context': 'http://schema.org',
          image: [
            {
              '@type': 'ImageObject',
              name: 'avatar',
              contentUrl: 'https://www.dropbox.com/s/j1h0kts0m7aadip/avatar-0?dl=1',
            },
          ],
          givenName: '',
          familyName: '',
          description: '',
          account: [
            {
              '@type': 'Account',
              placeholder: false,
              service: 'hackerNews',
              identifier: 'yukanl',
              proofType: 'http',
              proofUrl: 'https://news.ycombinator.com/user?id=yukanl',
            },
            {
              '@type': 'Account',
              placeholder: false,
              service: 'github',
              identifier: 'yknl',
              proofType: 'http',
              proofUrl: 'https://gist.github.com/yknl/1f7018b98f716f015a6cf44fda0806d7',
            },
            {
              '@type': 'Account',
              placeholder: false,
              service: 'twitter',
              identifier: 'yukanl',
              proofType: 'http',
              proofUrl: 'https://twitter.com/yukanL/status/916740749236101120',
            },
          ],
          name: 'Ken Liao',
          apps: {
            'http://localhost:8080':
              'https://gaia.blockstack.org/hub/1DDUqfKtQgYNt722wuB4Z2fPC7aiNGQa5R/',
          },
        },
      },
      signature:
        'UyQNZ02kBFHEovbwiGaS-VQd57w9kcwn1Nt3QbW3afEMArg1OndmeplB7lzjMuRCLAi-88lkpQLkFw7LwKZ31Q',
    },
  },
];

export const GET_FILE_MOCKS = [
  rest.get('https://stacks-node-api.stacks.co/v1/names/yukan.id', (_req, res, ctx) => {
    return res(ctx.json(NAME_RECORD));
  }),
  rest.get('https://potato/v1/names/yukan.id', (_req, res, ctx) => {
    return res(ctx.json(NAME_RECORD));
  }),
  rest.get(
    'https://gaia.blockstack.org/hub/16zVUoP7f15nfTiHw2UNiX8NT5SWYqwNv3/profile.json',
    (_req, res, ctx) => {
      return res(ctx.json(PROFILE_CONTENT));
    }
  ),
  rest.get(
    'https://gaia.blockstack.org/hub/16zVUoP7f15nfTiHw2UNiX8NT5SWYqwNv3/0/profile.json',
    (_req, res, ctx) => {
      return res(ctx.json(PROFILE_CONTENT));
    }
  ),
  rest.get(
    'https://gaia.blockstack.org/hub/1DDUqfKtQgYNt722wuB4Z2fPC7aiNGQa5R/file.json',
    (_req, res, ctx) => {
      return res(ctx.json(FILE_CONTENT));
    }
  ),
  rest.get(
    'https://gaia.testblockstack.org/hub/1NZNxhoxobqwsNvTb16pdeiqvFvce3Yg8U/file.json',
    (_req, res, ctx) => {
      return res(ctx.json(FILE_CONTENT));
    }
  ),
];

export const GET_FILE_DATA = {
  FILE_PATH,
  gaiaHubConfig,
  NAME_RECORD,
  FILE_CONTENT,
  PROFILE_CONTENT,
};
