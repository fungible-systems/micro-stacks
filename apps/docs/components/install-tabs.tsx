import { Fragment } from 'react';
// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Tabs, Tab } from 'nextra-theme-docs/tabs';

import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useHasMounted } from '../common/use-has-mounted';
import { SetAtom } from 'jotai/core/atom';
import React from 'react';

const tabState = atomWithStorage('install-tabs', 0);
const useTabs = (): [number, SetAtom<number, any>] => {
  const hasMounted = useHasMounted();
  const [_tab, setTab] = useAtom(tabState);
  const tab = hasMounted ? _tab : 0;
  return [tab, setTab];
};

const CodeWrapper = ({ children }) => (
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
        {children}
      </span>
    </code>
  </pre>
);
export const InstallTabs = ({ children, hideTabs = false, isCreate = false }) => {
  const [tab, setTab] = useTabs();
  const inner = (
    <CodeWrapper>
      {!isCreate ? (
        <Fragment>
          {tab === 0 && <>pnpm i {children}</>}
          {tab === 1 && <>yarn add {children}</>}
          {tab === 2 && <>npm install {children}</>}
        </Fragment>
      ) : (
        <Fragment>
          {tab === 0 && <>pnpm create {children}</>}
          {tab === 1 && <>yarn create {children}</>}
          {tab === 2 && <>npm create {children}</>}
        </Fragment>
      )}
    </CodeWrapper>
  );
  return (
    <Fragment>
      {hideTabs ? (
        inner
      ) : (
        <Tabs
          selectedIndex={tab}
          defaultIndex={0}
          onChange={setTab}
          items={[{ label: <>pnpm</> }, { label: <>yarn</> }, { label: <>npm</> }]}
        >
          {inner}
        </Tabs>
      )}
    </Fragment>
  );
};
