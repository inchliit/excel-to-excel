// node tests/check-bundle.mjs : js/deck.bundle.js must equal a fresh build of the source files, and parse.
import fs from 'node:fs';
import { execFileSync } from 'node:child_process';

const root = new URL('../', import.meta.url);
const fresh = execFileSync('python3', [new URL('tools/bundle.py', root).pathname, '--print'], { encoding: 'utf8' });
const path = new URL('js/deck.bundle.js', root);
const current = fs.existsSync(path) ? fs.readFileSync(path, 'utf8') : '';
const fail = [];
if (current !== fresh) fail.push('js/deck.bundle.js is stale: run python3 tools/bundle.py');
try { new Function(fresh); } catch (e) { fail.push('bundle does not parse: ' + e.message); }
const html = fs.readFileSync(new URL('index.html', root), 'utf8');
if (!/src="js\/deck\.bundle\.js"/.test(html)) fail.push('index.html must load js/deck.bundle.js');
if (/src="js\/(lib|tricks|anim|slides)\//.test(html)) fail.push('index.html still loads individual js files');
if (fail.length) { console.error('check-bundle: FAIL\n- ' + fail.join('\n- ')); process.exit(1); }
console.log('check-bundle: PASS (' + fresh.length + ' chars)');
