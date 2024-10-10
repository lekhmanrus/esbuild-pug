import { cosmiconfig } from 'cosmiconfig';
import type { PluginBuild } from 'esbuild';
import { vol } from 'memfs';
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from 'vitest';

vi.mock('cosmiconfig', () => {
  return {
    cosmiconfig: vi.fn()
  };
});
vi.mock('fs');
vi.mock('fs/promises');
import { pugPlugin, PLUGIN_NAME } from './index.js';

describe.concurrent('pugPlugin()', () => {
  beforeEach(() => {
    vol.reset();
  });

  it('returns an esbuild plugin', () => {
    expect(pugPlugin()).toMatchObject({
      name: PLUGIN_NAME
    });
  });

  it('handles empty options', async () => {
    const plugin = pugPlugin();
    expect(plugin.setup).toBeDefined();
    expect(typeof plugin.setup).toBe('function');
  });

  it('processes Pug files correctly', async () => {
    const plugin = pugPlugin();
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild;
    plugin.setup(mockBuild);

    expect(mockBuild.onLoad).toHaveBeenCalledWith({ filter: /\.(pug|jade)$/ }, expect.any(Function));
  });
});

describe('pugPlugin() onLoad()', () => {
  let explorerMock: { search: any; };

  beforeEach(() => {
    vol.reset();
    explorerMock = {
      search: vi.fn(),
    };
    (cosmiconfig as Mock).mockReturnValue(explorerMock);
  });

  afterEach(() => {
    vi.clearAllMocks()
  })

  it('throws an error for invalid Pug syntax', async () => {
    const path = './invalid.pug';
    vol.fromJSON({
      [path]: 'div(class=invalid syntax'
    });
    const plugin = pugPlugin();
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];

    await expect(onLoadCallback({ path })).rejects.toThrow();
  });

  it('returns correct contents for valid Pug file', async () => {
    const path = './valid.pug';
    vol.fromJSON({
      [path]: 'p Hello, World!'
    });
    const plugin = pugPlugin();
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];
    const result = await onLoadCallback({ path });

    expect(result).toHaveProperty('contents');
    expect(typeof result.contents).toBe('string');
    expect(result.contents).toContain('<p>Hello, World!</p>');
  });

  it('formats HTML output when "pretty" option is true', async () => {
    const path = './pretty.pug';
    vol.fromJSON({
      [path]: 'div\n  p Hello, World!'
    });
    const plugin = pugPlugin({ pretty: true });
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];
    const result = await onLoadCallback({ path });

    expect(result).toHaveProperty('contents');
    expect(result.contents).toBe(`
<div>
  <p>Hello, World!</p>
</div>`);
  });

  it('allows access to "self" properties when "self" option is true', async () => {
    const path = './self.pug';
    vol.fromJSON({
      [path]: 'p= self.message'
    });
    const plugin = pugPlugin({ self: true });
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];
    const result = await onLoadCallback({ path });

    expect(result).toHaveProperty('contents');
    expect(result.contents).toBe(`<p></p>`);
  });

  it('exports compiled template as JavaScript when "loader" option is set to "js"', async () => {
    const path = './template.pug';
    vol.fromJSON({
      [path]: 'p JavaScript Loader Test'
    });
    const plugin = pugPlugin({ loader: 'js' });
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];
    const result = await onLoadCallback({ path });

    expect(result).toHaveProperty('contents');
    expect(result.contents).toContain('export default template;');
    expect(result.contents).toContain('function template(locals) {');
  });

  it('exports compiled template as JavaScript when "loader" option is set to "js" via .pugrc.json config', async () => {
    const path = './template.pug';
    vol.fromJSON({
      [path]: 'p JavaScript Loader Test'
    });
    const mockConfigResult = {
      config: { loader: 'js' },
      filepath: './',
      isEmpty: false
    };
    explorerMock.search.mockResolvedValue(mockConfigResult);
    const plugin = pugPlugin();
    const mockBuild = {
      onLoad: vi.fn(),
      initialOptions: { },
      resolve: vi.fn(),
      onStart: vi.fn(),
      onEnd: vi.fn(),
      esbuild: { },
      onResolve: vi.fn(),
    } as unknown as PluginBuild & { onLoad: ReturnType<typeof vi.fn> };
    plugin.setup(mockBuild);

    const onLoadCallback = mockBuild.onLoad.mock.calls[0][1];
    const result = await onLoadCallback({ path });

    expect(result).toHaveProperty('contents');
    expect(result.contents).toContain('export default template;');
    expect(result.contents).toContain('function template(locals) {');
  });
});
