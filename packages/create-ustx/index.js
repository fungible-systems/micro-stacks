#!/usr/bin/env node

// @ts-check
import fs from 'node:fs';
import path from 'node:path';
import minimist from 'minimist';
import prompts from 'prompts';
import degit from 'degit';

import { blue, cyan, green, magenta, red, reset } from 'kolorist';

// Avoids auto conversion to number of the project name by defining that the args
// non associated with an option ( _ ) needs to be parsed as a string. See #4606
const argv = minimist(process.argv.slice(2), { string: ['_'] });
const cwd = process.cwd();

const FRAMEWORKS = [
  {
    name: 'react',
    color: cyan,
    variants: [
      {
        name: 'react',
        display: 'JavaScript',
        color: cyan,
      },
      {
        name: 'react-ts',
        display: 'TypeScript',
        color: cyan,
      },
      {
        name: 'nextjs',
        display: 'TypeScript',
        color: cyan,
      },
      {
        name: 'remix',
        display: 'TypeScript',
        color: cyan,
      },
    ],
  },
  {
    name: 'preact',
    color: blue,
    variants: [
      {
        name: 'preact',
        display: 'JavaScript',
        color: blue,
      },
      {
        name: 'preact-ts',
        display: 'TypeScript',
        color: blue,
      },
    ],
  },
  {
    name: 'vue',
    color: green,
    variants: [
      {
        name: 'vue',
        display: 'JavaScript',
        color: green,
      },
      {
        name: 'vue-ts',
        display: 'TypeScript',
        color: green,
      },
      // {
      //   name: 'nuxt',
      //   display: 'TypeScript',
      //   color: green,
      // },
    ],
  },
  {
    name: 'solidjs',
    color: magenta,
    variants: [
      {
        name: 'solidjs',
        display: 'JavaScript',
        color: magenta,
      },
      {
        name: 'solidjs-ts',
        display: 'TypeScript',
        color: magenta,
      },
    ],
  },
  {
    name: 'svelte',
    color: red,
    variants: [
      {
        name: 'svelte',
        display: 'JavaScript',
        color: red,
      },
      {
        name: 'svelte-ts',
        display: 'TypeScript',
        color: red,
      },
      {
        name: 'sveltekit',
        display: 'TypeScript',
        color: red,
      },
    ],
  },
];

const TEMPLATES = FRAMEWORKS.map(
  f => (f.variants && f.variants.map(v => v.name)) || [f.name]
).reduce((a, b) => a.concat(b), []);

const renameFiles = {
  _gitignore: '.gitignore',
};

async function init() {
  let targetDir = formatTargetDir(argv._[0]);
  let template = argv.template || argv.t;

  const defaultTargetDir = 'micro-stacks-project';
  const getProjectName = () => (targetDir === '.' ? path.basename(path.resolve()) : targetDir);

  let result = {};

  try {
    result = await prompts(
      [
        {
          type: targetDir ? null : 'text',
          name: 'projectName',
          message: reset('Project name:'),
          initial: defaultTargetDir,
          onState: state => {
            targetDir = formatTargetDir(state.value) || defaultTargetDir;
          },
        },
        {
          type: () => (!fs.existsSync(targetDir) || isEmpty(targetDir) ? null : 'confirm'),
          name: 'overwrite',
          message: () =>
            (targetDir === '.' ? 'Current directory' : `Target directory "${targetDir}"`) +
            ` is not empty. Remove existing files and continue?`,
        },
        {
          type: (_, { overwrite } = {}) => {
            if (overwrite === false) {
              throw new Error(red('✖') + ' Operation cancelled');
            }
            return null;
          },
          name: 'overwriteChecker',
        },
        {
          type: () => (isValidPackageName(getProjectName()) ? null : 'text'),
          name: 'packageName',
          message: reset('Package name:'),
          initial: () => toValidPackageName(getProjectName()),
          validate: dir => isValidPackageName(dir) || 'Invalid package.json name',
        },
        {
          type: template && TEMPLATES.includes(template) ? null : 'select',
          name: 'framework',
          message:
            typeof template === 'string' && !TEMPLATES.includes(template)
              ? reset(`"${template}" isn't a valid template. Please choose from below: `)
              : reset('Select a framework:'),
          initial: 0,
          choices: FRAMEWORKS.map(framework => {
            const frameworkColor = framework.color;
            return {
              title: frameworkColor(framework.name),
              value: framework,
            };
          }),
        },
        {
          type: framework => (framework && framework.variants ? 'select' : null),
          name: 'variant',
          message: reset('Select a variant:'),
          // eslint-disable-next-line @typescript-eslint/ban-ts-comment
          // @ts-ignore
          choices: framework =>
            framework.variants.map(variant => {
              const variantColor = variant.color;
              return {
                title: variantColor(
                  variant.display ? `${variant.name} (${variant.display})` : variant.name
                ),
                value: variant.name,
              };
            }),
        },
      ],
      {
        onCancel: () => {
          throw new Error(red('✖') + ' Operation cancelled');
        },
      }
    );
  } catch (cancelled) {
    console.log(cancelled.message);
    return;
  }

  // user choice associated with prompts
  const { framework, overwrite, packageName, variant } = result;

  const root = path.join(cwd, targetDir);

  if (overwrite) {
    emptyDir(root);
  } else if (!fs.existsSync(root)) {
    fs.mkdirSync(root, { recursive: true });
  }

  // determine template
  template = variant || framework || template;

  console.log(`\nScaffolding project in ${root}...`);

  // clone from examples repo
  const example_repo_path = `fungible-systems/micro-stacks-examples/examples/with-${template}`;
  const emitter = degit(example_repo_path);
  await emitter.clone(root);

  // update the package.json name
  const pkg = JSON.parse(fs.readFileSync(path.join(root, `package.json`), 'utf-8'));

  pkg.name = packageName || getProjectName();

  fs.writeFileSync(path.join(root, 'package.json'), JSON.stringify(pkg, null, 2));

  const pkgInfo = pkgFromUserAgent(process.env.npm_config_user_agent);

  const pkgManager = pkgInfo ? pkgInfo.name : 'npm';

  console.log(`\nDone. Now run:\n`);
  if (root !== cwd) {
    console.log(`  cd ${path.relative(cwd, root)}`);
  }
  switch (pkgManager) {
    case 'yarn':
      console.log('  yarn');
      console.log('  yarn dev');
      break;
    default:
      console.log(`  ${pkgManager} install`);
      console.log(`  ${pkgManager} run dev`);
      break;
  }
  console.log();
}

/**
 * @param {string | undefined} targetDir
 */
function formatTargetDir(targetDir) {
  return targetDir?.trim().replace(/\/+$/g, '');
}

function copy(src, dest) {
  const stat = fs.statSync(src);
  if (stat.isDirectory()) {
    copyDir(src, dest);
  } else {
    fs.copyFileSync(src, dest);
  }
}

/**
 * @param {string} projectName
 */
function isValidPackageName(projectName) {
  return /^(?:@[a-z0-9-*~][a-z0-9-*._~]*\/)?[a-z0-9-~][a-z0-9-._~]*$/.test(projectName);
}

/**
 * @param {string} projectName
 */
function toValidPackageName(projectName) {
  return projectName
    .trim()
    .toLowerCase()
    .replace(/\s+/g, '-')
    .replace(/^[._]/, '')
    .replace(/[^a-z0-9-~]+/g, '-');
}

/**
 * @param {string} srcDir
 * @param {string} destDir
 */
function copyDir(srcDir, destDir) {
  fs.mkdirSync(destDir, { recursive: true });
  for (const file of fs.readdirSync(srcDir)) {
    const srcFile = path.resolve(srcDir, file);
    const destFile = path.resolve(destDir, file);
    copy(srcFile, destFile);
  }
}

/**
 * @param {string} path
 */
function isEmpty(path) {
  const files = fs.readdirSync(path);
  return files.length === 0 || (files.length === 1 && files[0] === '.git');
}

/**
 * @param {string} dir
 */
function emptyDir(dir) {
  if (!fs.existsSync(dir)) {
    return;
  }
  for (const file of fs.readdirSync(dir)) {
    fs.rmSync(path.resolve(dir, file), { recursive: true, force: true });
  }
}

/**
 * @param {string | undefined} userAgent process.env.npm_config_user_agent
 * @returns object | undefined
 */
function pkgFromUserAgent(userAgent) {
  if (!userAgent) return undefined;
  const pkgSpec = userAgent.split(' ')[0];
  const pkgSpecArr = pkgSpec.split('/');
  return {
    name: pkgSpecArr[0],
    version: pkgSpecArr[1],
  };
}

init().catch(e => {
  console.error(e);
});
