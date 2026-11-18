// 把 public/ 打包成一个自包含的 HTML 片段，用于发布到 Claude Artifacts。
// 用法：node scripts/build-artifact.mjs  →  输出 dist/artifact.html
// Artifacts 会自动给页面套上 <!doctype><html><head><body> 外壳，所以这里只输出
// <title>、<meta>、<style> 和 body 里的内容，并把本地 CSS/JS 全部内联。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..');
const pub = join(root, 'public');
const html = readFileSync(join(pub, 'index.html'), 'utf8');
const read = (p) => readFileSync(join(pub, p), 'utf8');

const head = html.match(/<head>([\s\S]*?)<\/head>/)[1];
const body = html.match(/<body>([\s\S]*?)<\/body>/)[1];
const keep = [head.match(/<title>[\s\S]*?<\/title>/)[0], ...head.match(/<meta name="(claude:[^"]+|description)"[^>]*>/g)];
const css = [...head.matchAll(/<link rel="stylesheet" href="([^"]+)">/g)].map((m) => read(m[1])).join('\n');

const inlined = body.replace(/<script src="([^"]+)"><\/script>/g, (_, src) => `<script>\n${read(src).replace(/<\/script/gi, '<\\/script')}\n</script>`);

const out = `${keep.join('\n')}\n<style>\n${css}\n</style>\n${inlined.trim()}\n`;
mkdirSync(join(root, 'dist'), { recursive: true });
writeFileSync(join(root, 'dist', 'artifact.html'), out);
console.log(`dist/artifact.html  ${(out.length / 1024).toFixed(1)} KB`);
