import React from 'react';
import { Stack, Text } from '@nelson-ui/react';
import Link from 'next/link';
import { routes } from '@common/routes';
import { Header } from '@components/header';

export const PageWrapper: React.FC<{ isHome?: boolean }> = ({ isHome, children, ...rest }) => {
  return (
    <Stack
      color={'$text'}
      spacing="0"
      style={{ minHeight: '100vh' }}
      flexGrow={1}
      isInline
      background={'$background-subdued'}
    >
      <Stack
        maxHeight="calc(100vh - 64px)"
        borderRadius={'$medium'}
        flexShrink={0}
        p="$extra-loose"
        style={{ minWidth: '250px' }}
        background={'$background'}
        spacing="$extra-loose"
        position="fixed"
        height={'100vh'}
        top={'$extra-loose'}
        left={'$extra-loose'}
      >
        {routes.map(section => {
          return (
            <Stack spacing="$tight">
              <Text
                py={'extra-tight'}
                opacity={0.5}
                css={{ fontFamily: `'Neue Montreal'`, fontSize: '$3' }}
              >
                {section.label}
              </Text>
              {section.pages.map(page => {
                return (
                  <Link href={`/${page.slug}`} passHref>
                    <Text
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
        px="extra-loose"
        as="main"
        p="$extra-loose"
        spacing="$extra-loose"
        flexDirection="column"
        flexGrow={1}
        maxWidth={'calc(100% - 282px)'}
        ml={'282px'}
        justifyContent={'flex-start'}
      >
        <Header />
        {children}
      </Stack>
    </Stack>
  );
};
