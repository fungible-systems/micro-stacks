import React from 'react';
import { getMDXComponent } from 'mdx-bundler/client';
import { getAllFrontmatter, getMdxBySlug } from '@common/mdx';
import { components } from '@components/mdx-components';
import { Box } from '@nelson-ui/react';

type Doc = {
  frontmatter: any;
  code: any;
};

export default function Doc({ code }: Doc) {
  const Component = React.useMemo(() => getMDXComponent(code), [code]);

  return (
    <Box
      borderRadius={'$extra-large'}
      background={'$background'}
      maxWidth="100%"
      px={'$extra-loose'}
    >
      <Component components={components} />
    </Box>
  );
}

export async function getStaticPaths() {
  const frontmatters = getAllFrontmatter('docs');

  return {
    paths: frontmatters.map(({ path }) => ({ params: { path: path.split('/') } })),
    fallback: false,
  };
}

export async function getStaticProps(context) {
  const { frontmatter, code } = await getMdxBySlug('docs', context.params.path.join('/'));

  return {
    props: {
      frontmatter,
      code,
    },
  };
}
