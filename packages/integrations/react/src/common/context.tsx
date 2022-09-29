import { createContext } from 'react';
import { getClient } from '@micro-stacks/client';

/** ------------------------------------------------------------------------------------------------------------------
 *   MicroStacksClientContext
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const MicroStacksClientContext = createContext<ReturnType<typeof getClient> | null>(null);
