import Link from 'next/link';
import React from 'react';
import { Box, Circle, Flex, Grid, Stack, Text } from '@nelson-ui/react';
import { Button } from '@components/button';

const grid = [
  {
    title: 'Minimal dependencies',
    subtitle: 'Only two dependencies for all Stacks related functionality.',
  },
  {
    title: 'Modular',
    subtitle: "Take what you need, shake off what you don't.",
  },
  {
    title: 'Wallet authentication',
    subtitle: 'Made specifically to work out of the box with Stacks based wallets.',
  },
  {
    title: 'Modern syntax',
    subtitle: 'ES module by default, works with Vite, Snowpack, etc.',
  },
  {
    title: 'Fully-typed APIs',
    subtitle: 'All methods are fully typed with developer experience in mind.',
  },
  {
    title: 'Framework integrations',
    subtitle: 'Opinionated, zero-config integrations for react, vue, and svelte.',
  },
];

const guides = [
  {
    title: <>Adding Stacks Authentication to a React&nbsp;app</>,
    tags: ['react', 'authentication', 'wallet'],
  },
  {
    title: 'Signing Transactions from an app',
    tags: ['react', 'transactions', 'wallet'],
  },
  {
    title: 'Working with post-conditions',
    tags: ['transactions'],
  },
  {
    title: 'Fetching from and storing data on Gaia',
    tags: ['react', 'storage', 'gaia'],
  },
  {
    title: 'Fetching data from the Stacks API',
    tags: ['react', 'blockchain', 'api'],
  },
];

const DataGrid = props => {
  return (
    <Box
      background={'$background-subdued'}
      borderRadius={'$extra-large'}
      gap="$extra-loose"
      mx="auto"
      maxWidth={'calc(100% - 64px)'}
      p="64px"
      width="100%"
      display="grid"
      style={{ gridTemplateColumns: 'repeat(3,1fr)' }}
      {...props}
    >
      {grid.map((item, key) => (
        <Stack isInline spacing="$base-loose" key={key} alignItems="flex-start">
          <Stack spacing="$tight">
            <Text css={{ fontFamily: `'Neue Montreal'`, fontSize: '$2' }}>{item.title}</Text>
            <Text
              color={'$text-subdued'}
              css={{
                fontFamily: `'Neue Montreal'`,
                fontSize: '$2',
                lineHeight: '$7',
                fontWeight: 300,
              }}
            >
              {item.subtitle}
            </Text>
          </Stack>
        </Stack>
      ))}
    </Box>
  );
};

const PageTitleArea = () => {
  return (
    <Stack
      alignItems="center"
      justifyContent={'center'}
      background={'$background'}
      borderRadius="$medium"
      pb="64px"
      minHeight="480px"
      spacing="$loose"
    >
      <Text fontFamily={`'Neue Montreal'`} fontSize={'$8'}>
        micro-stacks
      </Text>
      <Text css={{ fontFamily: `'Neue Montreal'`, fontSize: '$3' }}>
        Tiny libraries for building the next generation of Stacks apps.
      </Text>
      <InstallExample />
      <PageTopActions />
    </Stack>
  );
};

const PageTopActions = () => {
  return (
    <Stack alignItems="center" isInline>
      <Link href="/getting-started" passHref>
        <Button as="a">Get started</Button>
      </Link>
      <Button variant={'secondary'} as="a">
        GitHub
      </Button>
    </Stack>
  );
};

const InstallExample = () => {
  return (
    <Box
      px="$loose"
      py={'$base'}
      background={'$surface-subdued'}
      color={'$text-subdued'}
      border={'1px solid $border-subdued'}
      borderRadius="$large"
    >
      <Box as="code">yarn add micro-stacks</Box>
    </Box>
  );
};

const PageTop = () => {
  return (
    <Stack spacing="extra-loose">
      <PageTitleArea />
    </Stack>
  );
};
const Guides = () => {
  return (
    <Stack>
      <Box fontSize={'$5'}>Guides</Box>
      <Grid gridTemplateColumns={'repeat(3, 1fr)'} gap={'$extra-loose'}>
        {guides.map((item, index) => (
          <Stack
            justifyContent={'space-between'}
            spacing={'$extra-loose'}
            minHeight={'350px'}
            borderRadius={'$extra-large'}
            background={'$background'}
            p="$extra-loose"
          >
            <Box color={'$text-subdued'} fontSize={'$4'}>
              {(index + 1).toString().padStart(2, '0')}
            </Box>
            <Box fontSize={'$4'}>{item.title} →</Box>
            <Stack color={'$text-subdued'} isInline fontSize={'$0'}>
              {item.tags.map(tag => (
                <Box textTransform={'uppercase'}>{tag}</Box>
              ))}
            </Stack>
          </Stack>
        ))}
      </Grid>
    </Stack>
  );
};
const Home = () => {
  return (
    <Stack maxHeight={'calc(100% - 100px)'}>
      <PageTop />
      <Stack spacing="0" transform="translateY(-100px)">
        <DataGrid />
        <Guides />
      </Stack>
    </Stack>
  );
};

export default Home;
