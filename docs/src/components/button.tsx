import React from 'react';
import { Box, BoxProps, Centered } from '@nelson-ui/react';
import { keyframes } from '@nelson-ui/core';

const styles: Record<'default' | 'secondary', BoxProps['css']> = {
  default: {
    border: '0',
    position: 'relative',
    zIndex: 99,
    py: '$tight',
    px: '$base',
    borderRadius: '$medium',
    backgroundColor: '$surface-contrast',
    fontSize: '$1',
    color: '$text-onContrast',
    textDecoration: 'none',
  },
  secondary: {
    background: '$background-subdued',
    borderRadius: '$medium',
    fontSize: '$1',
    border: '1px solid $border',
    py: '$tight',
    px: '$base',
    textDecoration: 'none',
  },
};

const rotate = keyframes({
  to: { transform: 'rotate(360deg)' },
});

const Spinner = ({ size = 14, ...props }) => (
  <Box
    _before={{
      content: '',
      boxSizing: 'border-box',
      position: 'absolute',
      top: '0',
      left: '0',
      width: `${size}px`,
      height: `${size}px`,
      borderRadius: '50%',
      border: '1px solid transparent',
      borderTopColor: 'currentColor',
      animation: `${rotate} 1s ease-in-out infinite`,
    }}
    css={{
      position: 'relative',
      size,
    }}
    {...props}
  />
);
export const Button = ({
  variant = 'default',
  isDisabled,
  children,
  isLoading,
  ...props
}: BoxProps & { variant?: keyof typeof styles; isDisabled?: boolean; isLoading?: boolean }) => {
  const style = styles[variant];
  return (
    <Box
      {...style}
      cursor={isDisabled ? 'not-allowed' : 'pointer'}
      opacity={isDisabled ? 0.45 : 'unset'}
      as="button"
      position="relative"
      {...props}
    >
      <Centered
        left={0}
        top={0}
        zIndex={99}
        position={'absolute'}
        size="100%"
        opacity={isLoading ? 1 : 0}
        transition="0.2s all ease-in-out"
      >
        <Spinner />
      </Centered>
      <Box as="span" opacity={isLoading ? 0 : 1} transition="0.2s all ease-in-out">
        {children}
      </Box>
    </Box>
  );
};
