/** Precompute the existing artwork as one shared, theme-neutral SVG asset. */
import fs from 'node:fs/promises';
import ts from 'typescript';
const source = await fs.readFile('src/lib/particle-field.ts', 'utf8');
const compiled = ts.transpileModule(source, {compilerOptions: {module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020}}).outputText;
const {createParticlePreview} = await import('data:text/javascript;base64,' + Buffer.from(compiled).toString('base64'));
const paths = createParticlePreview();
const svg = '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 1000"><defs>' + paths.map((d, index) => '<path id="particles-' + index + '" d="' + d + '"/>').join('') + '</defs></svg>\n';
await fs.mkdir('public/media', {recursive: true});
await fs.writeFile('public/media/particle-fallback.svg', svg);
console.log('Shared particle fallback: ' + Buffer.byteLength(svg) + ' bytes; original geometry preserved.');
