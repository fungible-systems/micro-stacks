import fs from 'fs';
import path from 'path';
import glob from 'glob';
import matter from 'gray-matter';
import readingTime from 'reading-time';
import { bundleMDX } from 'mdx-bundler';
import remarkSlug from 'remark-slug';
import rehypeHighlightCode from '../../lib/rehype-highlight-code';
import rehypeMetaAttribute from '../../lib/rehype-meta-attribute';

const ROOT_PATH = process.cwd();

export const DATA_PATH = path.join(ROOT_PATH, 'src/data');

// the front matter and content of all mdx files based on `docsPaths`
export const getAllFrontmatter = fromPath => {
  const PATH = path.join(DATA_PATH, fromPath);
  const mdxPaths = glob.sync(`${PATH}/**/*.mdx`);
  const mdPaths = glob.sync(`${PATH}/**/*.md`);

  const paths = [...mdPaths, ...mdxPaths];
  return paths.map(filePath => {
    const pathWithFolders = path
      .join(filePath)
      .replace(DATA_PATH, '')
      .replace('/docs/', '')
      .replace('.mdx', '')
      .replace('.md', '');
    const source = fs.readFileSync(path.join(filePath), 'utf8');

    const { data, content } = matter(source);

    return {
      ...(data as any),
      extension: filePath.includes('.mdx') ? 'mdx' : 'md',
      path: pathWithFolders,
      slug: path.basename(filePath).replace('.mdx', '').replace('.md', ''), // file name without extension
      wordCount: content.split(/\s+/g).length,
      readingTime: readingTime(content),
    } as any;
  });
};

export const getMdxBySlug = async (basePath, slug) => {
  let source;
  try {
    source = fs.readFileSync(path.join(DATA_PATH, basePath, `${slug}.mdx`), 'utf8');
  } catch (e) {
    source = fs.readFileSync(path.join(DATA_PATH, basePath, `${slug}.md`), 'utf8');
  }
  const { frontmatter, code } = await bundleMDX(source, {
    xdmOptions(input, options: any = {}) {
      options.remarkPlugins = [...(options?.remarkPlugins ?? []), remarkSlug];
      options.rehypePlugins = [
        ...(options.rehypePlugins ?? []),
        rehypeMetaAttribute,
        rehypeHighlightCode,
      ];

      return options;
    },
  });

  return {
    frontmatter: {
      ...(frontmatter as any),
      slug,
      wordCount: code.split(/\s+/g).length,
      readingTime: readingTime(code),
    } as any,
    code,
  };
};
