import type { Plugin } from 'esbuild';
import { cosmiconfig } from 'cosmiconfig';
import { readFile } from 'fs/promises';
import { dirname, resolve } from 'path';
import { compile, compileClient, type Options } from 'pug';

/** The name of the Esbuild plugin. */
export const PLUGIN_NAME = 'pug-plugin';
/**
 * Defines the options for the Pug plugin.
 * @property {string} [root] The root directory for resolving relative paths in Pug templates.
 * @property {string} [loader] The loader to use for Pug templates, either 'js' or 'text'.
 */
export type PugOptions = Options & { root?: string; loader?: 'js' | 'text' };

/**
 * Defines an Esbuild plugin that compiles Pug templates.
 * The plugin reads Pug templates from files matching the `.pug` or `.jade` extension, and compiles
 * them using the `pug` library.
 * The plugin supports loading Pug configuration from a `.pugrc` file or other supported
 * configuration files.
 * @param pugOptions Optional configuration options for the Pug compiler.
 * @param pugOptions.root The root directory for resolving relative paths in Pug templates.
 * @param pugOptions.loader The loader to use for Pug templates, either 'js' or 'text'.
 * @returns An Esbuild plugin that compiles Pug templates.
 */
export const pugPlugin = (pugOptions: PugOptions = { }): Plugin => ({
  name: PLUGIN_NAME,
  setup(build) {
    build.onLoad({ filter: /\.(pug|jade)$/ }, async (args) => {
      const template = await readFile(args.path, 'utf8');
      // read pug config
      const explorer = cosmiconfig('pug');
      const result = await explorer.search();
      if (result && result.config && !result.isEmpty) {
        pugOptions = Object.assign({ }, result.config, pugOptions);
        const configDirPath = dirname(result.filepath);
        if (configDirPath) {
          if (pugOptions.root) {
            pugOptions.root = resolve(configDirPath, pugOptions.root);
          }
          if (pugOptions.basedir) {
            pugOptions.basedir = resolve(configDirPath, pugOptions.basedir);
          }
        }
      }

      pugOptions.basedir ??= dirname(args.path);
      pugOptions.loader ??= 'text';
      pugOptions.filename = args.path;

      let contents: string;
      if (pugOptions.loader === 'js') {
        const compiled = compileClient(template, pugOptions);
        contents = `${compiled}\n\nexport default template;`;
      } else {
        contents = compile(template, pugOptions)();
      }

      return { pluginName: PLUGIN_NAME, contents, loader: pugOptions.loader };
    });
  },
});

export default pugPlugin;
