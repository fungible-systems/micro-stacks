import React from 'react';
import { SpaceBetween, Box, Stack } from '@nelson-ui/react';
import { ThemeToggle } from '@components/theme-toggle';

export const Header = () => {
  return (
    <SpaceBetween
      borderRadius={'$extra-large'}
      background={'$background'}
      width="100%"
      padding="$extra-loose"
      right={0}
    >
      <Stack isInline>
        <Box color={'$text-dim'} fontSize={'$1'}>
          Search...
        </Box>
      </Stack>

      <Box>
        <ThemeToggle />
      </Box>
    </SpaceBetween>
  );
};
