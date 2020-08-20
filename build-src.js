const { build } = require('esbuild');
const config = require('./esbuild.config');

// DEV build
console.time('Development Build');
build({
  entryPoints: [
    './src/index.ts',
  ],
  outfile: './dist/index.development.js',
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
  () => {
    console.timeEnd('Development Build');
  },
  (err) => {
    console.error(err);
    process.exit(1);
  },
);

// Prod build
console.time('Production Build');
build({
  entryPoints: [
    './src/index.ts',
  ],
  outfile: './dist/index.production.min.js',
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
  (err) => {
    console.error(err);
    process.exit(1);
  },
);

// ESM build
console.time('ESM Build');
build({
  entryPoints: [
    './src/index.ts',
  ],
  outdir: './dist',
  outExtension: {
    '.js': '.esm.js',
  },
  bundle: true,
  minify: false,
  format: 'esm',
  sourcemap: false,
  splitting: true,
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
  (err) => {
    console.error(err);
    process.exit(1);
  },
);
