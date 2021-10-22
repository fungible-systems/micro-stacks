import React from 'react';
import { Box, SpaceBetween, Stack, Text } from '@nelson-ui/react';
import Link from 'next/link';
import { routes } from '@common/routes';
import { Header } from '@components/header';

export const PageWrapper: React.FC<{ isHome?: boolean }> = ({ isHome, children, ...rest }) => {
  return (
    <Stack
      background={'$background'}
      color={'$text'}
      spacing="0"
      style={{ minHeight: '100vh' }}
      flexGrow={1}
      isInline
    >
      <Stack
        flexShrink={0}
        style={{ minWidth: '250px' }}
        spacing="$extra-loose"
        position="fixed"
        height={'100vh'}
        top={'0'}
        left={'0'}
        borderRight={'1px solid $border-subdued'}
        py={'$loose'}
      >
        <SpaceBetween px="$loose">
          <Stack isInline alignItems={'center'}>
            <Text>micro-stacks</Text>
            <Text opacity={0.5} fontSize={'$0'}>
              BETA
            </Text>
          </Stack>
        </SpaceBetween>
        {routes.map(section => {
          return (
            <Stack spacing="$base-tight">
              <Text
                px={'$loose'}
                opacity={0.5}
                css={{ fontFamily: `'Neue Montreal'`, fontSize: '$2' }}
              >
                {section.label}
              </Text>
              {section.pages.map(page => {
                return (
                  <Link href={`/${page.slug}`} passHref>
                    <Text
                      px={'$loose'}
                      css={{ fontFamily: `'Neue Montreal'`, fontSize: '$2' }}
                      as={'a'}
                      color={'$text'}
                      textDecoration={'none'}
                      _hover={{
                        opacity: 0.5,
                      }}
                    >
                      {page.title}
                    </Text>
                  </Link>
                );
              })}
            </Stack>
          );
        })}
      </Stack>

      <Stack
        minHeight={'100vh'}
        spacing="$extra-loose"
        flexDirection="column"
        flexGrow={1}
        maxWidth={'calc(100% - 250px)'}
        ml="250px"
        justifyContent={'flex-start'}
        width="100%"
      >
        <Stack
          width="100%"
          flexGrow={1}
          spacing={'0'}
          mx={'auto'}
          maxWidth={'1200px'}
          position={'relative'}
        >
          <Header />
          <Box width="100%" flexGrow={1} as="main">
            {children}
          </Box>
          <Box
            px={'$extra-loose'}
            mt={'64px'}
            width={'100%'}
            borderTop={'1px solid $border-subdued'}
            py={'64px'}
          >
            <Text>A Fungible Systems project</Text>
          </Box>
        </Stack>
      </Stack>
    </Stack>
  );
};
