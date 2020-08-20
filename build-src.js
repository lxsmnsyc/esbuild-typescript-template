const { build } = require('esbuild');
const fs = require('fs-extra');
const config = require('./esbuild.config');
const pkg = require('./package.json');

console.time('ESBuild');

function getPackageName(name) {
  return name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
}

const baseDir = `./dist`;
const baseName = getPackageName(pkg.name);
const baseOut = `${baseDir}/${baseName}`;

async function buildAll() {
  await fs.remove('./dist');

  console.time('Development Build');
  console.time('Production Build');
  console.time('ESM Build');
  await Promise.all([
    // DEV build
    build({
      entryPoints: [
        config.entry,
      ],
      outfile: `${baseOut}.development.js`,
      bundle: true,
      // Never minify dev builds
      minify: false,
      // Generate source maps for dev builds
      sourcemap: true,
      // define environment variables
      define: config.define,
      // 
      target: config.target,
      // 
      platform: config.platform,
      //
      tsconfig: config.tsconfig,
    }).then(
      () => console.timeEnd('Development Build'),
    ),
    // PROD build
    build({
      entryPoints: [
        config.entry,
      ],
      outfile: `${baseOut}.production.min.js`,
      bundle: true,
      minify: true,
      sourcemap: true,
      // define environment variables
      define: config.define,
      // 
      target: config.target,
      // 
      platform: config.platform,
      //
      tsconfig: config.tsconfig,
    }).then(
      () => {
        console.timeEnd('Production Build');
      },
    ),
    // ESM build
    build({
      entryPoints: [
        config.entry,
      ],
      outfile: `${baseOut}.esm.js`,
      bundle: true,
      minify: false,
      format: 'esm',
      sourcemap: false,
      // define environment variables
      define: config.define,
      // 
      target: config.target,
      //
      tsconfig: config.tsconfig,
    }).then(
      () => {
        console.timeEnd('ESM Build');
      },
    ),
  ]);

  const baseLine = `module.exports = require('./${baseName}`;
  const contents = `
  'use strict'
  if (process.env.NODE_ENV === 'production') {
    ${baseLine}.production.min.js')
  } else {
    ${baseLine}.development.js')
  }
  `;

  await fs.outputFile('./dist/index.js', contents);
  console.timeEnd('ESBuild');
}

buildAll().catch(
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
