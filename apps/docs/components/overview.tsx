import * as Integrations from './integrations-tabs';
import { CSSProperties, PropsWithChildren } from 'react';
import { InstallTabs } from './install-tabs';
import * as DS from '@nelson-ui/react';
import { Box } from '@nelson-ui/react';

export const Grid = ({ columns, children }) => (
  <DS.Grid
    gap={'24px'}
    gridTemplateColumns={'1fr'}
    css={{
      '@bp3': {
        display: 'grid',
        gridTemplateColumns: typeof columns === 'string' ? columns : `repeat(${columns}, 1fr)`,
      },
    }}
  >
    {children}
  </DS.Grid>
);

const Card = ({ children, gap, backgroundColor = 'transparent' }) => {
  return (
    <Box
      style={{
        display: 'flex',
        flexDirection: 'column',
        gap,
        backgroundColor,
        borderWidth: 1,
        borderStyle: 'solid',
        borderRadius: '12px',
      }}
      className={'dark:border-neutral-800'}
    >
      {children}
    </Box>
  );
};

const CardTitle: React.FC<PropsWithChildren<{ style?: CSSProperties }>> = ({
  children,
  style = {},
}) => (
  <div
    style={{
      padding: '32px 32px 0px',
      fontSize: '1.5rem',
      fontWeight: 600,
      ...style,
    }}
  >
    {children}
  </div>
);

const CardContent: React.FC<PropsWithChildren<{ style?: CSSProperties }>> = ({
  children,
  style,
}) => (
  <div
    style={{
      display: 'flex',
      flexDirection: 'column',
      justifyContent: 'flex-start',
      alignItems: 'flex-start',
      padding: '0 32px 32px 32px',
      ...style,
    }}
  >
    {children}
  </div>
);
export const QuickStart = () => {
  return (
    <Card gap={'0'}>
      <CardTitle>⚡ Quick start</CardTitle>
      <Integrations.Tabs />
      <CardContent
        style={{
          padding: '0px 12px 32px 12px',
        }}
      >
        <InstallTabs hideTabs>
          <Integrations.React>
            <>@micro-stacks/react@beta</>
          </Integrations.React>
          <Integrations.Svelte>
            <>@micro-stacks/svelte@beta</>
          </Integrations.Svelte>
          <Integrations.Vue>
            <>@micro-stacks/vue@beta</>
          </Integrations.Vue>
          <Integrations.Solid>
            <>@micro-stacks/solidjs@beta</>
          </Integrations.Solid>
          <Integrations.Vanilla>
            <>@micro-stacks/client@beta</>
          </Integrations.Vanilla>
        </InstallTabs>
        <div>
          Read the <a href={'/docs/getting-started'}>getting started</a> guide
        </div>
      </CardContent>
    </Card>
  );
};

export const RemixGuide = () => {
  return (
    <Card
      backgroundColor={'#212121'}
      gap={'0'}
    >
      <CardTitle
        style={{
          color: 'white',
        }}
      >
        Create a server-side rendered Stacks app with Remix
      </CardTitle>
      <CardContent
        style={{
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'space-between',
          alignItems: 'flex-end',
        }}
      >
        <a href={'/guides/with-remix'}>Read guide</a>
        <img
          style={{
            display: 'block',
            maxWidth: '240px',
          }}
          src={'/remix-run.png'}
        />
      </CardContent>
    </Card>
  );
};

const CardCaption = ({ children }) => (
  <div className={'text-gray-600 dark:text-gray-400'}>{children}</div>
);

export const GetStarted = () => {
  return (
    <Card gap={'12px'}>
      <CardTitle>🚀 Get started</CardTitle>
      <CardContent
        style={{
          gap: '12px',
        }}
      >
        <CardCaption>Learn how to add micro-stacks to any JavaScript based project.</CardCaption>
        <a href={'/docs/getting-started'}>Build an app</a>
      </CardContent>
    </Card>
  );
};

export const Authentication = () => {
  return (
    <Card gap={'12px'}>
      <CardTitle>✨ Connect a Stacks wallet</CardTitle>
      <CardContent
        style={{
          gap: '12px',
        }}
      >
        <CardCaption>
          Learn how to add web3 authentication to any JavaScript application or service.
        </CardCaption>
        <a href={'/docs/authentication'}>Add authentication</a>
      </CardContent>
    </Card>
  );
};

export const TransactionSigning = () => {
  return (
    <Card gap={'12px'}>
      <CardTitle>💰 Sign transactions</CardTitle>
      <CardContent
        style={{
          gap: '12px',
        }}
      >
        <CardCaption>
          Learn about the different types of transactions and how to have your users sign them.
        </CardCaption>
        <a href={'/docs/transactions'}>Learn about transactions</a>
      </CardContent>
    </Card>
  );
};

export const MessageSigning = () => {
  return (
    <Card gap={'12px'}>
      <CardTitle>📝 Message signing</CardTitle>
      <CardContent
        style={{
          gap: '12px',
        }}
      >
        <CardCaption>
          Learn about message signatures and SIP-018 structured data signing.
        </CardCaption>
        <a href={'/docs/message-signing'}>Sign messages</a>
      </CardContent>
    </Card>
  );
};

export const PostConditions = () => {
  return (
    <Card gap={'12px'}>
      <CardTitle>🔒 Working with post conditions</CardTitle>
      <CardContent
        style={{
          gap: '12px',
        }}
      >
        <CardCaption>
          Learn how to construct post-conditions to protect your users from accidental asset-loss.
        </CardCaption>
        <a href={'/docs/transactions/working-with-post-conditions'}>Learn more</a>
      </CardContent>
    </Card>
  );
};
