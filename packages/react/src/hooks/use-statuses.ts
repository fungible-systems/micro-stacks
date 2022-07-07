import { getStatus, watchStatus } from '@micro-stacks/client';
import { clientStateHookFactory } from '../common/utils';

/** ------------------------------------------------------------------------------------------------------------------
 *   State value
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useStatuses = clientStateHookFactory(getStatus, watchStatus);
