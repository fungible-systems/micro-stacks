// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import { Tabs } from 'nextra-theme-docs/tabs';
import { atomWithStorage } from 'jotai/utils';
import { useAtom } from 'jotai';
import { useHasMounted } from '../common/use-has-mounted';
import { SetAtom } from 'jotai/core/atom';

const tabState = atomWithStorage('integrations', 0);

const items = [
  { label: 'React' },
  { label: 'Svelte', disabled: true },
  { label: 'Vue', disabled: true },
  { label: 'Vanilla' },
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
      className={'bg-white dark:bg-dark'}
      style={{
        zIndex: 99,
        position: 'sticky',
        top: '64px',
        maxHeight: '68px',
        overflow: 'hidden',
      }}
    >
      <Tabs
        suppressHydrationWarning={true}
        selectedIndex={tab}
        defaultIndex={0}
        onChange={setTab}
        items={items}
      />
    </div>
  );
};

const ReactContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 0) return children;
  return null;
};

const VanillaContent = ({ children }) => {
  const [tab, setTab] = useTabs();
  if (tab === 3) return children;
  return null;
};

const Action = ({ type, children }) => {
  const [tab, setTab] = useTabs();
  const tabInt = () => {
    switch (type) {
      case 'react':
        return 0;
      case 'vanilla':
        return 3;
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

export { TabsRow as Tabs, ReactContent as React, VanillaContent as Vanilla, Action };
