'use strict';

const toString = require('mdast-util-to-string');
const visit = require('unist-util-visit');
const slugify = require('@sindresorhus/slugify');
const slugs = require('github-slugger')();

function slug() {
  return transformer;
}

// Patch slugs on heading nodes.
function transformer(ast) {
  slugs.reset();
  visit(ast, 'heading', visitor);

  function visitor(node) {
    var data = node.data || (node.data = {});
    var props = data.hProperties || (data.hProperties = {});
    var id = props.id;

    const _slug = id ? slugify(id) : slugify(toString(node));

    id = slugs.slug(_slug, true);

    data.id = id;
    props.id = id;
  }
}

module.exports = slug;
