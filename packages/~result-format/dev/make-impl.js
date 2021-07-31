import { join }                 from 'path';
import rollupPluginNodeBuiltins from 'rollup-plugin-node-builtins';
import rollupPluginNodeGlobals  from 'rollup-plugin-node-globals';
import { fileURLToPath }        from 'url';

const PACKAGE_UTILS_URL = '../../../dev/internal/package-utils.mjs';

export async function makeBrowserSpecRunner()
{
    const { bundleJS, compileTS } = await import(PACKAGE_UTILS_URL);
    const pkgURL = new URL('..', import.meta.url);
    const pkgPath = fileURLToPath(pkgURL);
    {
        const outDir = join(pkgPath, '.tmp-out');
        const rootDir = join(pkgPath, '.');
        const newOptions = { outDir, rootDir };
        await compileTS(pkgPath, '{src,test}/**/*.ts', newOptions);
    }
    {
        const inputPath = join(pkgPath, '.tmp-out/test/browser-spec-runner.js');
        const plugins = [rollupPluginNodeBuiltins(), rollupPluginNodeGlobals({ buffer: false })];
        const inputOptions = { input: inputPath, plugins };
        const outputPath = join(pkgPath, 'test/browser-spec-runner.js');
        const outputOptions = { esModule: false, file: outputPath, format: 'iife' };
        await bundleJS(inputOptions, outputOptions);
    }
}

export async function makeLib()
{
    const { makePackage } = await import(PACKAGE_UTILS_URL);
    const pkgURL = new URL('..', import.meta.url);
    await makePackage(pkgURL);
}