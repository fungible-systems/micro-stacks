import { Fragment } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Tabs } from 'nextra-theme-docs/tabs';

import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useHasMounted } from '../common/use-has-mounted';
import { SetAtom } from 'jotai/core/atom';

const tabState = atomWithStorage('install-tabs', 0);
const useTabs = (): [number, SetAtom<number, any>] => {
  const hasMounted = useHasMounted();
  const [_tab, setTab] = useAtom(tabState);
  const tab = hasMounted ? _tab : 0;
  return [tab, setTab];
};
export const InstallTabs = ({ children, hideTabs = false, isCreate = false }) => {
  const [tab, setTab] = useTabs();
  return (
    <Fragment>
      {hideTabs ? null : (
        <Tabs
          suppressHydrationWarning={true}
          selectedIndex={tab}
          defaultIndex={0}
          onChange={setTab}
          items={[{ label: 'pnpm' }, { label: 'yarn' }, { label: 'npm' }]}
        />
      )}

      <pre
        style={{
          width: '100%',
        }}
      >
        <code>
          <span
            className={'line'}
            style={{
              display: 'flex',
              alignItems: 'center',
            }}
          >
            {isCreate
              ? tab === 0
                ? 'pnpm create '
                : tab === 1
                ? 'yarn create '
                : 'npm create '
              : tab === 0
              ? 'pnpm i '
              : tab === 1
              ? 'yarn add '
              : 'npm install '}
            {}
            {children}
          </span>
        </code>
      </pre>
    </Fragment>
  );
};
