import React from 'react';
import NextLink from 'next/link';
import { Box, Text } from '@nelson-ui/react';

export const components = {
  h1: props => (
    <Text
      my="none"
      as="h1"
      {...props}
      variant="Heading02"
      css={{ fontFamily: `'Neue Montreal'` }}
    />
  ),
  h2: ({ ...props }) => (
    <Text
      my="none"
      as="h2"
      {...props}
      variant="Heading03"
      css={{ fontFamily: `'Neue Montreal'` }}
    />
  ),
  h3: ({ ...props }) => (
    <Text
      my="none"
      as="h3"
      {...props}
      variant="Heading04"
      css={{ fontFamily: `'Neue Montreal'` }}
    />
  ),
  h4: props => (
    <Text
      my="none"
      as="h4"
      {...props}
      variant="Heading05"
      css={{ fontFamily: `'Neue Montreal'` }}
    />
  ),

  p: props => <Text my="none" as="p" color={'text'} variant={'Body01'} {...props} />,
  a: ({ href = '', ...props }) => {
    if (href.startsWith('http')) {
      return (
        <Text
          color="interactive"
          variant="Body01"
          as="a"
          {...props}
          href={href}
          target="_blank"
          rel="noopener"
        />
      );
    }
    return (
      <NextLink href={href} passHref>
        <Text variant="Body01" color="interactive" as="a" {...props} />
      </NextLink>
    );
  },

  ul: props => <Box {...props} as="ul" />,
  ol: props => <Box {...props} as="ol" />,
  li: props => (
    <li>
      <Text as="p" variant={'Body01'} {...props} />
    </li>
  ),
  strong: props => <Text {...props} />,
  img: ({ ...props }) => <Box as="img" {...props} />,
  pre: ({ children }) => <>{children}</>,
  code: ({ className, children, id, showLineNumbers = false, collapsed = false }) => {
    const isInlineCode = !className;

    if (isInlineCode) {
      return (
        <Box
          display="inline-block"
          borderRadius="small"
          fontSize={'0'}
          px="tight"
          borderStyle="solid"
          borderWidth={'1px'}
          borderColor={'border'}
          as="code"
          className={className}
        >
          {children}
        </Box>
      );
    }

    return (
      <Box
        fontSize={'1'}
        as="pre"
        className={className}
        id={id}
        data-line-numbers={showLineNumbers}
        borderRadius={'medium'}
      >
        <Box as="code" className={className}>
          {children}
        </Box>
      </Box>
    );
  },
  Image: ({ children, size, ...props }) => (
    <Box as="figure">
      <Box as="img" {...props} />
      <Text variant="Caption02" as="figcaption">
        {children}
      </Text>
    </Box>
  ),
  blockquote: props => <Box {...props} />,
};
