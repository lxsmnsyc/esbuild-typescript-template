# esbuild-typescript-template
 Typescript + ESBuild for TS Packages template

## Configuring

### esbuild.config.js

- `tsconfig`: Required. path to the `tsconfig.json`.
- `entry`: Required. entry point from the `src` directory.
- `define`: An object of key-value pair which is used to replace. Useful for environment variable definitions.
- `jsxFactory`: string to use for parsing JSX syntax. Defaults to `React.createElement`.
- `jsxFragment`: string to use for parsing JSX fragment syntax.
- `target`: Target ES version.