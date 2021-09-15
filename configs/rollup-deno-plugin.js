const getPath = filename => `./${filename}.d.ts`;
const injectGlobalShimForDenoBuild = (filename, code) => {
  return (
    `/// <reference path="${getPath(filename.split('.')[0])}" />
` + code
  );
};

const denoPlugin = () => {
  return {
    name: 'deno',
    // Breaks sourcemap, but whatever
    renderChunk(code, details) {
      const filename = details.fileName;
      return injectGlobalShimForDenoBuild(filename, code);
    },
  };
};

export default denoPlugin;
