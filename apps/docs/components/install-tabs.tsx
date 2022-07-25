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
export const InstallTabs = ({ children, hideTabs = false, isCreate = false }) => {
  const [tab, setTab] = useTabs();
  return (
    <Fragment>
      {hideTabs ? null : (
        <Tabs
          selectedIndex={tab}
          defaultIndex={0}
          onChange={setTab}
          items={[{ label: <>pnpm</> }, { label: <>yarn</> }, { label: <>npm</> }]}
        >
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
                {!isCreate ? (
                  <React.Fragment>
                    <Tab>{'pnpm i ' + children}</Tab>
                    <Tab>{'yarn add ' + children}</Tab>
                    <Tab>{'npm install ' + children}</Tab>
                  </React.Fragment>
                ) : (
                  <React.Fragment>
                    <Tab>{`pnpm create ` + children}</Tab>
                    <Tab>{'yarn create ' + children}</Tab>
                    <Tab>{'npm create ' + children}</Tab>
                  </React.Fragment>
                )}
              </span>
            </code>
          </pre>
        </Tabs>
      )}
    </Fragment>
  );
};
