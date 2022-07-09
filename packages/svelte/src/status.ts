import { getStatus, watchStatus } from '@micro-stacks/client';
import { readableClientState } from './utils';

export const watchStatuses = readableClientState(getStatus, watchStatus);
