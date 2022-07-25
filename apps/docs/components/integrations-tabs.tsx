// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Tabs } from 'nextra-theme-docs/tabs';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useHasMounted } from '../common/use-has-mounted';
import { SetAtom } from 'jotai/core/atom';
import React, { PropsWithChildren } from 'react';

const tabState = atomWithStorage('integrations', 0);

const items = [
  { label: <>{'React'}</> },
  { label: <>{'Svelte'}</> },
  { label: <>{'Vue'}</> },
  { label: <>{'Solid'}</> },
  { label: <>{'Vanilla'}</> },
];

const useTabs = (): [number, SetAtom<number, any>] => {
  const hasMounted = useHasMounted();
  const [_tab, setTab] = useAtom(tabState);
  const tab = hasMounted ? _tab : 0;
  return [tab, setTab];
};
export const TabsRow = () => {
  const [tab, setTab] = useTabs();

  return (
    <div
      className={'install-tabs bg-white dark:bg-dark'}
      style={{
        zIndex: 99,
        position: 'sticky',
        top: '63px',
        maxHeight: '68px',
        overflow: 'hidden',
      }}
    >
      <Tabs
        selectedIndex={tab}
        defaultIndex={0}
        onChange={setTab}
        items={items}
      >
        {null}
      </Tabs>
    </div>
  );
};

const ReactContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 0) return children;
  return null;
};

const SvelteContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 1) return children;
  return null;
};
const VueContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 2) return children;
  return null;
};
const SolidContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 3) return children;
  return null;
};
const VanillaContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 4) return children;
  return null;
};

type Tabs = 'react' | 'svelte' | 'vue' | 'solid.js' | 'vanilla';

const Action: React.FC<PropsWithChildren<{ type: Tabs }>> = ({ type, children }) => {
  const [tab, setTab] = useTabs();
  const tabInt = () => {
    switch (type) {
      case 'react':
        return 0;
      case 'svelte':
        return 1;
      case 'vue':
        return 2;
      case 'solid.js':
        return 3;
      case 'vanilla':
        return 4;
    }
  };
  return (
    <span
      onClick={() => {
        setTab(tabInt());
      }}
    >
      {children}
    </span>
  );
};

export {
  TabsRow as Tabs,
  ReactContent as React,
  SvelteContent as Svelte,
  VueContent as Vue,
  SolidContent as Solid,
  VanillaContent as Vanilla,
  Action,
};
