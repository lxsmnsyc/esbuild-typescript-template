const { build } = require('esbuild');
const fs = require('fs-extra');
const { performance } = require('perf_hooks');
const chokidar = require('chokidar');
const ts = require('typescript');
const config = require('./esbuild.config');
const pkg = require('./package.json');

function getPackageName(name) {
  return name
    .toLowerCase()
    .replace(/(^@.*\/)|((^[^a-zA-Z]+)|[^\w.-])|([^a-zA-Z0-9]+$)/g, '');
}

const baseDir = `./dist`;
const baseName = getPackageName(pkg.name);
const baseOut = `${baseDir}/${baseName}`;

function getBenchmark(label, baseTime) {
  const measure = (performance.now() - baseTime).toFixed(2);
  console.log(`${label}: ${measure}ms`);
}

function compileDeclarations() {
  // Create a Program with an in-memory emit
  const host = ts.createCompilerHost({
    outDir: 'dist',
    declaration: true,
    emitDeclarationOnly: true,
  });

  host.writeFile = (fileName, data) => {
    fs.outputFileSync(`./${fileName}`, data);
  };
  
  // Prepare and emit the d.ts files
  const program = ts.createProgram(
    [config.entry],
    {
      outDir: 'dist',
      declaration: true,
      emitDeclarationOnly: true,
    },
    host,
  );
  program.emit();
}

async function buildAll() {
  await fs.remove('./dist');
  
  const totalTime = performance.now();

  const compileTime = performance.now();
  compileDeclarations();
  getBenchmark('Type declarations', compileTime);

  const baseTime = performance.now();

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
      // 
      platform: 'node',
      // define environment variables
      define: config.define,
      // 
      target: config.target,
      //
      tsconfig: config.tsconfig,
      //
      jsxFactory: config.jsxFactory,
      //
      jsxFragment: config.jsxFragment,
    }).then(
      () => {
        getBenchmark('Development Build', baseTime);
      },
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
      // 
      platform: 'node',
      // define environment variables
      define: config.define,
      // 
      target: config.target,
      //
      tsconfig: config.tsconfig,
      //
      jsxFactory: config.jsxFactory,
      //
      jsxFragment: config.jsxFragment,
    }).then(
      () => {
        getBenchmark('Production Build', baseTime);
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
      //
      jsxFactory: config.jsxFactory,
      //
      jsxFragment: config.jsxFragment,
    }).then(
      () => {
        getBenchmark('ESM Build', baseTime);
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
  getBenchmark('Total Build', totalTime);
}

if (process.argv.includes('--watch') || process.argv.includes('-w')) {
  chokidar.watch('./src').on('all', () => {
    buildAll().catch(
      (err) => {
        console.error(err);
        process.exit(1);
      },
    );
  });  
} else {
  buildAll().catch(
    (err) => {
      console.error(err);
      process.exit(1);
    },
  );
}