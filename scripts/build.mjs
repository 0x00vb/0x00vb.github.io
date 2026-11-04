import { readdir, readFile, writeFile, mkdir, cp, rm } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import matter from 'gray-matter';
import { marked } from 'marked';
import {renderDiagram} from './diagrams.mjs';

export const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const topics = { ai: 'AI & ML', systems: 'Systems', security: 'Security', design: 'Design', essays: 'Essays' };
const escape = value => String(value).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const dateString = value => value instanceof Date ? value.toISOString().slice(0, 10) : value;
export const validDate = value => typeof value === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(value) && !Number.isNaN(Date.parse(value)) && new Date(value).toISOString().slice(0, 10) === value;
marked.use({ renderer: { html: ({text}) => escape(text) } });

export async function loadPosts(directory = path.join(root, 'content/posts')) {
  const files = (await readdir(directory)).filter(f => f.endsWith('.md'));
  const result = [];
  for (const file of files) {
    const raw = await readFile(path.join(directory, file), 'utf8');
    const {data, content} = matter(raw);
    const slug = file.slice(0, -3);
    const written = dateString(data.written);
    const date = dateString(data.date);
    const published = dateString(data.published);
    const valid = /^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug) && ['title', 'description'].every(key => typeof data[key] === 'string' && data[key].trim()) && Object.hasOwn(topics, data.topic) && ['draft', 'published'].includes(data.status) && validDate(written) && (date === undefined || validDate(date)) && Number.isInteger(data.order) && Array.isArray(data.concepts) && data.concepts.length && data.concepts.every(c => typeof c === 'string' && /^[a-z][a-z0-9-]*$/.test(c)) && (data.status !== 'published' || validDate(published));
    if (!valid) throw new Error(`Invalid article metadata: ${file}`);
    if (/[\u2014\u2013]/.test(content + data.title + data.description)) throw new Error(`Replace long dashes in ${file}`);
    const words = content.trim().split(/\s+/).length;
    result.push({...data, date, written, published, slug, content, raw, minutes: Math.max(1, Math.ceil(words / 220))});
  }
  return result.sort((a, b) => (b.date || b.published || b.written).localeCompare(a.date || a.published || a.written) || a.order - b.order || a.slug.localeCompare(b.slug));
}

export async function build({outDir = path.join(root, 'dist'), preview = process.env.PREVIEW_DRAFTS === '1', basePath = process.env.BASE_PATH || '', siteUrl = process.env.SITE_URL || '', postsDirectory = path.join(root, 'content/posts'), goatcounterUrl = process.env.GOATCOUNTER_URL || ''} = {}) {
  const base = basePath.replace(/\/$/, '');
  if (base && !/^\/[a-zA-Z0-9_/-]+$/.test(base)) throw new Error('BASE_PATH must be empty or a URL path beginning with /');
  if (siteUrl && !/^https?:\/\//.test(siteUrl)) throw new Error('SITE_URL must begin with http:// or https://');
  if(goatcounterUrl && !/^https:\/\/[a-z0-9](?:[a-z0-9-]*[a-z0-9])?\.goatcounter\.com\/count$/.test(goatcounterUrl)) throw new Error('GOATCOUNTER_URL must be https://YOUR-CODE.goatcounter.com/count');
  siteUrl = siteUrl.replace(/\/$/, '');
  const url = route => `${base}${route}`;
  const absolute = route => `${siteUrl}${url(route)}`;
  const all = await loadPosts(postsDirectory);
  const posts = all.filter(p => preview || p.status === 'published');
  const published = posts.filter(p => p.status === 'published');
  await rm(outDir, {recursive: true, force: true});
  await mkdir(outDir, {recursive: true});
  await cp(path.join(root, 'public'), outDir, {recursive: true});
  await mkdir(path.join(outDir, 'fonts'), {recursive: true});
  await cp(path.join(root, 'node_modules/geist/dist/fonts/geist-mono/GeistMono-Regular.woff2'), path.join(outDir, 'fonts/mono.woff2'));
  await cp(path.join(root, 'node_modules/geist/LICENSE.txt'), path.join(outDir, 'fonts/LICENSE.txt'));
  const write = async (name, data) => {const dest = path.join(outDir, name); await mkdir(path.dirname(dest), {recursive: true}); await writeFile(dest, data);};
  const themeIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.4" aria-hidden="true"><circle cx="12" cy="12" r="4"/><path d="M12 2v2m0 16v2M2 12h2m16 0h2M5 5l1.5 1.5m11 11L19 19M5 19l1.5-1.5m11-11L19 5"/></svg>';
  const nav = active => `<header class="site-header"><nav aria-label="Main navigation"><a href="${url('/#writing')}" ${active === 'writing' ? 'aria-current="page"' : ''}>Writing</a><a href="${url('/#about')}">About</a><button class="theme-toggle" aria-label="Switch to dark mode" title="Switch theme">${themeIcon}</button></nav></header>`;
  const footer = `<footer class="site-footer"><nav class="footer-links" aria-label="Contact links"><a href="https://github.com/0x00vb">GitHub</a><a href="https://www.linkedin.com/in/valentinobalatti/">LinkedIn</a><a href="mailto:valentinobalatti4@gmail.com">Email</a></nav><span class="footer-right">${siteUrl ? `<a href="${url('/feed.xml')}">RSS</a>` : ''}</span></footer>`;
  const shell = (title, description, body, active, route) => `<!doctype html><html lang="en"><head><meta charset="utf-8"><meta name="viewport" content="width=device-width, initial-scale=1"><title>${escape(title)}</title><meta name="description" content="${escape(description)}"><meta name="color-scheme" content="light dark">${preview ? '<meta name="robots" content="noindex,nofollow">' : ''}<meta name="theme-color" content="#f8f8fa"><meta property="og:title" content="${escape(title)}"><meta property="og:description" content="${escape(description)}"><meta property="og:type" content="${route.startsWith('/writing/') ? 'article' : 'website'}">${siteUrl ? `<link rel="canonical" href="${escape(absolute(route))}"><meta property="og:url" content="${escape(absolute(route))}"><link rel="alternate" type="application/rss+xml" title="Valentino's writing" href="${url('/feed.xml')}">` : ''}<link rel="icon" href="${url('/favicon.svg')}" type="image/svg+xml"><link rel="preload" href="${url('/fonts/mono.woff2')}" as="font" type="font/woff2" crossorigin><script src="${url('/theme.js')}"></script><link rel="stylesheet" href="${url('/style.css')}"><script type="module" src="${url('/app.js')}"></script>${!preview && goatcounterUrl ? `<script async src="https://gc.zgo.at/count.js" data-goatcounter="${escape(goatcounterUrl)}" data-goatcounter-settings="${escape(JSON.stringify({path:url(route)}))}"></script>` : ''}</head><body id="top"><a class="skip-link" href="#main">Skip to content</a><div class="page">${nav(active)}${body}${footer}</div></body></html>`;
  const draftNote = preview && posts.some(post=>post.status==='draft') ? '<p class="draft-note">Draft preview</p>' : '';
  const articleDate = post => post.date || post.published || post.written;
  const row = (p, compact = false) => `<article class="article-row${compact ? ' archive-row' : ''}" data-topic="${p.topic}" data-concepts="${p.concepts.join(' ')}" data-search="${escape([p.title,p.description,topics[p.topic],...p.concepts,p.content].join(' ').toLowerCase())}"><a href="${url(`/writing/${p.slug}/`)}"><div class="row-copy"><h3>${escape(p.title)}</h3>${compact ? '' : `<p>${escape(p.description)}</p>`}</div>${compact ? `<time datetime="${articleDate(p)}">${articleDate(p)}</time>` : `<span class="row-meta">${topics[p.topic]}<span class="read-time">${p.minutes} min</span></span>`}</a></article>`;
  const years = new Map();
  for (const post of posts) {
    const year = articleDate(post).slice(0,4);
    if (!years.has(year)) years.set(year,[]);
    years.get(year).push(post);
  }
  const archive = [...years].map(([year,articles]) => `<section class="archive-year" data-year="${year}" aria-labelledby="year-${year}"><h2 id="year-${year}">${year}</h2>${articles.map(post=>row(post,true)).join('')}</section>`).join('');
  const graphNodes = [{id:'gpu',label:'GPUs',x:145,y:100},{id:'memory',label:'Memory',x:380,y:55},{id:'inference',label:'Inference',x:590,y:115},{id:'performance',label:'Performance',x:90,y:255},{id:'architecture',label:'Systems',x:365,y:220},{id:'agents',label:'Agents',x:635,y:280},{id:'security',label:'Security',x:155,y:415},{id:'evaluation',label:'Evaluation',x:430,y:380},{id:'judgment',label:'Judgment',x:650,y:460},{id:'work',label:'Work',x:350,y:515}];
  const graphEdges=[];
  for(let i=0;i<graphNodes.length;i++) for(let j=i+1;j<graphNodes.length;j++) if(posts.some(p=>p.concepts.includes(graphNodes[i].id)&&p.concepts.includes(graphNodes[j].id))) graphEdges.push([graphNodes[i],graphNodes[j]]);
  const graph = `<div class="knowledge-graph" role="group" aria-label="Explore writing by connected idea"><svg viewBox="0 0 800 570" aria-hidden="true">${graphEdges.map(([a,b])=>`<line data-edge="${a.id} ${b.id}" x1="${a.x}" y1="${a.y}" x2="${b.x}" y2="${b.y}"/>`).join('')}</svg>${graphNodes.map(n=>`<button class="graph-node" data-concept="${n.id}" data-x="${n.x}" data-y="${n.y}" aria-pressed="false" aria-label="Filter writing by ${n.label}" style="left:${n.x/8}%;top:${n.y/5.7}%"><span class="node-dot" aria-hidden="true"></span><span>${n.label}</span></button>`).join('')}</div>`;
  const hero = `<section class="intro" aria-labelledby="intro-title"><div class="intro-copy"><h1 id="intro-title">Valentino<span class="name-period">.</span></h1><p class="intro-description">I build AI and software systems.<br>Sometimes I write about them.</p></div>${graph}</section>`;
  const filters = `<div class="archive-tools"><div class="filters" role="group" aria-label="Filter articles by topic"><button aria-pressed="true" data-filter="all">All</button>${Object.entries(topics).map(([key,label])=>`<button aria-pressed="false" data-filter="${key}">${label}</button>`).join('')}</div><label class="search-box"><svg aria-hidden="true" viewBox="0 0 20 20" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="8" cy="8" r="5"/><path d="m12 12 5 5"/></svg><input id="search" type="search" placeholder="Search" aria-label="Search articles" autocomplete="off"></label></div>`;
  const about = `<section class="about-inline" id="about"><details><summary>About</summary><div class="prose"><p>I'm a forward-deployed engineer interested in AI research, GPUs, and how software behaves in practice. My work spans web, mobile, desktop, and payments.</p><p>This is where I keep technical notes and the occasional personal essay. Security, systems, design, machine learning. Some questions don't fit neatly into one subject.</p></div></details></section>`;
  const home = `<main id="main">${hero}<section class="writing-section" id="writing" aria-label="Writing"><h2 class="sr-only">Writing</h2>${filters}<div id="article-list">${archive}</div><p id="no-results" ${posts.length ? 'hidden' : ''}>${posts.length ? 'No matches. Try another search or choose All.' : 'The first articles are being edited.'}</p><p class="sr-only" id="result-count" role="status" aria-live="polite"></p>${draftNote}</section>${about}</main>`;
  await write('index.html', shell('Valentino / Writing', 'Notes on AI, GPUs, software systems, design, and the occasional detour.', home, 'writing', '/'));
  for (const post of posts) {
    const related = posts.filter(p => p.slug !== post.slug).map(p=>({post:p,score:p.concepts.filter(c=>post.concepts.includes(c)).length})).filter(p=>p.score).sort((a,b)=>b.score-a.score).slice(0,3).map(p=>p.post);
    const html = marked.parse(post.content);
    const body = `<main id="main" class="reading"><a class="back-link" href="${url('/#writing')}">All writing</a><header class="article-header"><div class="row-meta"><span>${topics[post.topic]}</span><span>·</span><span>${post.minutes} min read</span>${post.status === 'draft' ? '<span class="draft-tag">Draft</span>' : ''}</div><h1>${escape(post.title)}</h1><p class="article-deck">${escape(post.description)}</p><div class="byline"><time datetime="${post.date || post.published || post.written}">${new Date(post.date || post.published || post.written).toLocaleDateString('en-GB',{day:'numeric',month:'long',year:'numeric',timeZone:'UTC'})}</time></div></header><article class="prose">${html}</article><div class="article-end"><a href="${url(`/source/${post.slug}.md`)}" download>Markdown</a></div>${related.length ? `<section class="related"><h2>Connected thoughts</h2>${related.map(post=>row(post)).join('')}</section>` : ''}</main>`;
    await write(`writing/${post.slug}/index.html`,shell(`${post.title} / Valentino`, post.description, body, 'writing', `/writing/${post.slug}/`));
    await write(`source/${post.slug}.md`, post.raw);
  }
  await write('404.html',shell('Page not found / Valentino','This page could not be found.',`<main id="main" class="not-found"><p class="eyebrow">404</p><h1>Wrong turn.</h1><p>The article may have moved, or the address may be wrong.</p><a class="quiet-link" href="${url('/')}">All writing</a></main>`,'','/404.html'));
  await write('articles.json',JSON.stringify(posts.map(({content,raw,...post})=>post)));
  await write('.nojekyll','');
  if(siteUrl) {
    await write('feed.xml',`<?xml version="1.0" encoding="UTF-8"?><rss version="2.0"><channel><title>Valentino / Writing</title><link>${escape(absolute('/'))}</link><description>Notes on AI, systems, design, and other things.</description>${published.map(p=>`<item><title>${escape(p.title)}</title><link>${escape(absolute(`/writing/${p.slug}/`))}</link><guid>${escape(absolute(`/writing/${p.slug}/`))}</guid><pubDate>${new Date(p.published).toUTCString()}</pubDate><description>${escape(p.description)}</description></item>`).join('')}</channel></rss>`);
    await write('sitemap.xml',`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${['/',...published.map(p=>`/writing/${p.slug}/`)].map(route=>`<url><loc>${escape(absolute(route))}</loc></url>`).join('')}</urlset>`);
  }
  const diagramDirectory=path.join(root,'content/diagrams');
  for(const name of (await readdir(diagramDirectory)).filter(name=>name.endsWith('.excalidraw')).sort()) {
    const source=await readFile(path.join(diagramDirectory,name),'utf8');
    const scene=JSON.parse(source);
    await write(`diagrams/${name.replace(/\.excalidraw$/,'.svg')}`,renderDiagram(scene));
    await write(`diagrams/${name}`,source);
  }
  console.log(`Built ${posts.length} articles (${published.length} published) into ${outDir}${base ? ` at ${base}` : ''}`);
  return {posts,published,outDir};
}
if(process.argv[1]===fileURLToPath(import.meta.url)) await build();
