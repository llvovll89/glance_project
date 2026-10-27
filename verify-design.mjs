import { createServer } from 'vite';
import { renderToString } from 'react-dom/server';
import { createElement } from 'react';
import { readFileSync, existsSync } from 'node:fs';
import assert from 'node:assert/strict';
const server = await createServer({server:{middlewareMode:true,hmr:false},appType:'custom'});
try {
  const {default:App} = await server.ssrLoadModule('/src/App.tsx');
  const {guides} = await server.ssrLoadModule('/src/content.ts');
  const html=renderToString(createElement(App));
  assert.ok(html.includes('id="main"'));
  assert.ok(html.includes('id="search"'));
  assert.ok(html.includes('aria-label='));
  assert.equal((html.match(/class="symptom-option[ "]/g)||[]).length,guides.length);
  assert.equal((html.match(/class="step-index"/g)||[]).length,4);
  const iconPaths=[...html.matchAll(/\/icons\/([A-Za-z]+)\.svg/g)].map(x=>x[1]);
  for(const icon of iconPaths) assert.ok(existsSync('public/icons/'+icon+'.svg'),icon);
  for (const size of [640,1024,1536]) assert.ok(existsSync('public/assets/computer-studio-'+size+'.webp'));
  assert.ok(existsSync('public/assets/computer-studio.png'));
  assert.ok(existsSync('public/fonts/PretendardVariable.woff2'));
  console.log('Server render and all initial image/icon/font references: PASS');
} finally {await server.close();}
function lum(hex){const rgb=hex.match(/[a-f\d]{2}/gi).map(x=>parseInt(x,16)/255).map(x=>x<=.04045?x/12.92:((x+.055)/1.055)**2.4);return rgb[0]*.2126+rgb[1]*.7152+rgb[2]*.0722;}
const pairs=[['light primary button','3455cc','fcfcfe'],['light body','202639','f7f8fc'],['light secondary text','596276','fdfdff'],['dark primary button','a5b7ff','17203c'],['dark body','edf0f8','151923'],['dark secondary text','b3bcce','1d2330']];
for(const [name,a,b] of pairs){const l=[lum(a),lum(b)].sort((a,b)=>b-a);const ratio=(l[0]+.05)/(l[1]+.05);assert.ok(ratio>=4.5,name);console.log(name+': '+ratio.toFixed(2)+':1 PASS');}
const css=readFileSync('src/styles.css','utf8');
assert.ok(css.includes('prefers-reduced-motion:reduce'));
assert.ok(css.includes('@media(max-width:767px)'));
assert.ok(!/[\u2013\u2014]/.test(readFileSync('src/App.tsx','utf8')));
console.log('Reduced motion, mobile rules and visible-copy punctuation: PASS');
