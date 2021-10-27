import { makeQueryKey } from 'jotai-query-toolkit';
import { NetworkWithLimitOffset, NetworkWithBlockHash, WithNetwork } from '../../types';

export enum MicroblocksClientKeys {
  Microblocks = 'blocks/Microblocks',
  Microblock = 'blocks/Microblock',
  MicroblocksUnanchoredTransactions = 'blocks/MicroblocksUnanchoredTransactions',
}

export const makeMicroblocksClientKeys = {
  microblocks: (params: NetworkWithLimitOffset) =>
    makeQueryKey(MicroblocksClientKeys.Microblocks, params),
  microblock: (params: NetworkWithBlockHash) =>
    makeQueryKey(MicroblocksClientKeys.Microblock, params),
  microblocksUnanchoredTransactions: (params: WithNetwork) =>
    makeQueryKey(MicroblocksClientKeys.MicroblocksUnanchoredTransactions, params),
};
