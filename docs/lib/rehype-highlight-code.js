// Inspired by https://github.com/j0lv3r4/mdx-prism

import rangeParser from 'parse-numeric-range';
import { visit } from 'unist-util-visit';
import { toString } from 'hast-util-to-string';
import { refractor } from 'refractor/lib/all';
import highlightLine from './rehype-highlight-line';
import highlightWord from './rehype-highlight-word';
import clarityLang from './clarity-lang';

refractor.register(clarityLang);

export default function (options = {}) {
  return tree => {
    visit(tree, 'element', visitor);
  };

  function visitor(node, index, parent) {
    if (
      !parent ||
      parent.tagName !== 'pre' ||
      node.tagName !== 'code' ||
      !node.properties.className
    ) {
      return;
    }

    const [_, lang] = node.properties.className[0].split('-');
    const codeString = toString(node);
    try {
      let result = refractor.highlight(codeString, lang);
      const linesToHighlight = rangeParser(node.properties.line || '0');
      result = highlightLine(result, linesToHighlight);
      result = highlightWord(result);

      parent.properties.className = `language-${lang}`;
      node.children = result;
    } catch (e) {
      console.log(e);
    }
  }
}
