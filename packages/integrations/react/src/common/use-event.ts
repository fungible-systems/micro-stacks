import * as React from 'react';
import { getGlobalObject } from 'micro-stacks/common';
import type { DependencyList, EffectCallback } from 'react';

/** ------------------------------------------------------------------------------------------------------------------
 *   useLayoutEffect
 *  ------------------------------------------------------------------------------------------------------------------
 */

const useLayoutEffect = (effect: EffectCallback, deps?: DependencyList) =>
  Boolean(getGlobalObject('document')) ? React.useLayoutEffect(effect, deps) : undefined;

/** ------------------------------------------------------------------------------------------------------------------
 *   useEvent
 *  ------------------------------------------------------------------------------------------------------------------
 */

export const useEvent = (onEvent: any) => {
  const handleEventRef = React.useRef(onEvent);

  useLayoutEffect(() => {
    handleEventRef.current = onEvent;
  }, []);

  return React.useCallback((...args) => handleEventRef.current(...args), []);
};
