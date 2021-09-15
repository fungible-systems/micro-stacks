import fetch from 'cross-fetch';
// Polyfill for encoding which isn't present globally in jsdom
import { TextEncoder, TextDecoder } from 'util';
global.fetch = fetch;
global.TextEncoder = TextEncoder;
global.TextDecoder = TextDecoder;
global.setImmediate = setTimeout;
