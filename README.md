<h1 align="center">esbuild-pug</h1>

<p align="center">
  <img src="https://raw.githubusercontent.com/lekhmanrus/esbuild-pug/main/assets/esbuild-pug.svg"
       alt="esbuild-pug logo" width="275px" height="275px" />
  <br />
  <em>
    <a href="https://esbuild.github.io/" target="_blank">esbuild</a> plugin to work with <a href="https://pugjs.org/" target="_blank">pug</a> (jade) files.
  </em>
  <br />
</p>


[![Build](https://github.com/lekhmanrus/esbuild-pug/actions/workflows/build.yaml/badge.svg)](https://github.com/lekhmanrus/esbuild-pug/actions/workflows/build.yaml)
[![Publish](https://github.com/lekhmanrus/esbuild-pug/actions/workflows/publish.yaml/badge.svg)](https://github.com/lekhmanrus/esbuild-pug/actions/workflows/publish.yaml)
[![codecov](https://codecov.io/gh/lekhmanrus/esbuild-pug/branch/main/graph/badge.svg?token=N9T5Q1CXLU)](https://codecov.io/gh/lekhmanrus/esbuild-pug)
[![npm version](https://img.shields.io/npm/v/esbuild-pug.svg)](https://www.npmjs.com/package/esbuild-pug)
[![npm](https://img.shields.io/npm/dm/esbuild-pug.svg)](https://www.npmjs.com/package/esbuild-pug)


<hr />



## Features

- Compiles `.pug` and `.jade` files
- Supports various configuration file formats
- Integrates with esbuild seamlessly



## Installation

```sh
npm install --save-dev esbuild-pug
```



### Usage

```ts
import { build } from 'esbuild';
import { pugPlugin } from 'esbuild-pug';

build({
  entryPoints: [ 'app.js' ],
  bundle: true,
  outfile: 'out.js',
  plugins: [ pugPlugin() ],
})
  .catch(() => process.exit(1));
```



## Configuration

You can configure the plugin by passing options:

```ts
pugPlugin({
  basedir: './src/',
  // other pug options
})
```


### Options

You can configure your project to pass the additional options.


The plugin accepts all standard Pug options, plus:

* `root`: Set the root directory for resolving includes and extends.
* `loader`: Choose between `text` (default) or `js` output.

You can see the [supported options here](https://pugjs.org/api/reference.html).

### Configuration File Formats
esbuild-pug supports configuration files in several formats:

* **JavaScript** - use `.pugrc.js` or `pug.config.js` and export an object containing your configuration.
* **YAML** - use `.pugrc`, .`pugrc.yaml` or `.pugrc.yml` to define the configuration structure.
* **JSON** - use `.pugrc.json` to define the configuration structure.
* **package.json** - create an `pugConfig` property in your `package.json` file and define your configuration there.

If there are multiple configuration files in the same directory, esbuild-pug will only use one. The priority order is as follows:

1. `package.json`
2. `.pugrc`
3. `.pugrc.json`
4. `.pugrc.yaml`
5. `.pugrc.yml`
6. `.pugrc.js`
7. `.pugrc.cjs`
8. `pug.config.js`
9. `pug.config.cjs`

### Using Configuration Files

Here's an example configuration file that sets Pug `basedir` option (again, [see whole list of supported options here](#options)):
* `.pugrc.json` (JSON)
  ```json
  {
    "basedir": "./src/"
  }
  ```

* `.pugrc` (YAML)
  ```yaml
  basedir: ./src/
  ```

* `pug.config.js` (JavaScript)
  ```js
  module.exports = {
    basedir: './src/'
  };
  ```

**P.S.**: Either of that should work. No need to create all of them. [See Configuration File Formats](#configuration-file-formats).



## Build

Run `npm run build` to build the project. The build artifacts will be stored in the `dist/` directory.



## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.
