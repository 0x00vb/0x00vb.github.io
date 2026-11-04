import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,readdir,rm,writeFile,mkdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {build,loadPosts} from '../scripts/build.mjs';

async function temporary(fn){const directory=await mkdtemp(path.join(tmpdir(),'valentino-blog-'));try{return await fn(directory);}finally{await rm(directory,{recursive:true,force:true});}}
async function fixtures(directory){
  const postsDirectory=path.join(directory,'posts');
  await mkdir(postsDirectory);
  await writeFile(path.join(postsDirectory,'gpu-draft.md'),'---\ntitle: GPU draft\ndescription: A diagram about memory.\ntopic: ai\nconcepts: [gpu, memory]\ndate: "2025-06-23"\nwritten: "2026-11-04"\nstatus: draft\norder: 0\n---\n## Count the bytes first\n\nA complete paragraph.\n\n![Memory path](../../diagrams/gpu-memory.svg)\n');
  await writeFile(path.join(postsDirectory,'published-note.md'),'---\ntitle: Published note\ndescription: An article readers can find.\ntopic: systems\nconcepts: [memory]\nwritten: "2026-11-03"\npublished: "2026-11-04"\nstatus: published\norder: 1\n---\nThis is the published article body.\n');
  return {postsDirectory,outDir:path.join(directory,'output')};
}

test('production publishes approved articles and excludes drafts from pages and feeds',()=>temporary(async directory=>{
  const options=await fixtures(directory);
  const result=await build({...options,preview:false,siteUrl:'https://writer.example',basePath:'/notes'});
  assert.equal(result.posts.length,1);
  assert.deepEqual(await readdir(path.join(options.outDir,'writing')),['published-note']);
  assert.deepEqual(await readdir(path.join(options.outDir,'source')),['published-note.md']);
  const article=await readFile(path.join(options.outDir,'writing/published-note/index.html'),'utf8');
  assert.ok(article.includes('This is the published article body.'));
  assert.ok(article.includes('<time datetime="2026-11-04"'));
  assert.ok(!article.includes('Published <time'));
  assert.ok(!article.match(/<div class="byline">([\s\S]*?)<\/div>/)[1].includes('Valentino'));
  assert.ok(article.includes('href="https://github.com/0x00vb"'));
  assert.ok(article.includes('href="https://www.linkedin.com/in/valentinobalatti/"'));
  assert.ok(article.includes('href="mailto:valentinobalatti4@gmail.com"'));
  assert.ok(!article.match(/<header class="site-header">([\s\S]*?)<\/header>/)[1].includes('wordmark'));
  const sitemap=await readFile(path.join(options.outDir,'sitemap.xml'),'utf8');
  assert.ok(sitemap.includes('https://writer.example/notes/writing/published-note/'));
  assert.ok(!sitemap.includes('gpu-draft'));
  assert.ok(!sitemap.includes('/connections/'));
  const feed=await readFile(path.join(options.outDir,'feed.xml'),'utf8');
  assert.ok(feed.includes('<item><title>Published note</title>'));
  assert.ok(!feed.includes('GPU draft'));
  assert.deepEqual(JSON.parse(await readFile(path.join(options.outDir,'articles.json'),'utf8')).map(p=>p.slug),['published-note']);
}));

test('preview includes drafts and published articles with readable HTML and repository-prefixed assets',()=>temporary(async directory=>{
  const options=await fixtures(directory);
  const {posts}=await build({...options,preview:true,basePath:'/notes',siteUrl:'https://writer.example'});
  assert.equal(posts.length,2);
  const home=await readFile(path.join(options.outDir,'index.html'),'utf8');
  assert.equal((home.match(/class="article-row archive-row"/g)||[]).length,2);
  assert.ok(home.includes('href="/notes/style.css"'));
  assert.ok(home.includes('class="knowledge-graph"'));
  assert.ok(!home.includes('/connections/'));
  assert.ok(!home.includes('strange attractor'));
  assert.ok(!home.includes('row-arrow'));
  assert.ok(home.includes('Draft preview'));
  assert.ok(home.includes('data-year="2026"'));
  assert.ok(home.includes('data-year="2025"'));
  assert.ok(home.indexOf('id="year-2026"')<home.indexOf('id="year-2025"'));
  assert.ok(home.includes('<time datetime="2025-06-23">2025-06-23</time>'));
  const article=await readFile(path.join(options.outDir,'writing/gpu-draft/index.html'),'utf8');
  assert.ok(article.includes('Count the bytes first'));
  assert.ok(article.includes('<time datetime="2025-06-23">23 June 2025</time>'));
  assert.ok(!article.includes('Drafted'));
  assert.ok(article.includes('href="/notes/source/gpu-draft.md"'));
  const image=article.match(/<img[^>]+src="([^"]+)"/)[1];
  assert.equal(new URL(image,'https://writer.example/notes/writing/gpu-draft/').pathname,'/notes/diagrams/gpu-memory.svg');
  assert.ok((await readFile(path.join(options.outDir,'diagrams/gpu-memory.svg'),'utf8')).includes('<svg'));
  assert.ok((await readFile(path.join(options.outDir,'fonts/mono.woff2'))).length>1000);
  assert.ok((await readFile(path.join(options.outDir,'fonts/LICENSE.txt'),'utf8')).includes('SIL OPEN FONT LICENSE'));
  const feed=await readFile(path.join(options.outDir,'feed.xml'),'utf8');
  assert.ok(feed.includes('Published note'));
  assert.ok(!feed.includes('GPU draft'));
}));

test('metadata rejects a published article without a date and invalid calendar dates',()=>temporary(async directory=>{
  const source='---\ntitle: Example\ndescription: A useful sentence.\ntopic: ai\nconcepts: [gpu]\nwritten: "2026-11-04"\nstatus: published\norder: 0\n---\nBody.';
  await writeFile(path.join(directory,'example.md'),source);
  await assert.rejects(loadPosts(directory),/Invalid article metadata/);
  await writeFile(path.join(directory,'example.md'),source.replace('status: published','status: draft').replace('2026-11-04','2026-02-31'));
  await assert.rejects(loadPosts(directory),/Invalid article metadata/);
}));

test('invalid deployment paths fail before touching output',()=>temporary(async directory=>{
  await writeFile(path.join(directory,'keep.txt'),'keep');
  await assert.rejects(build({outDir:directory,basePath:'relative-path'}),/BASE_PATH/);
  assert.equal(await readFile(path.join(directory,'keep.txt'),'utf8'),'keep');
}));

test('aggregate analytics is opt-in and never included in local draft previews',()=>temporary(async directory=>{
  const options=await fixtures(directory);
  const endpoint='https://example-writer.goatcounter.com/count';
  await build({...options,preview:false,goatcounterUrl:endpoint});
  let home=await readFile(path.join(options.outDir,'index.html'),'utf8');
  assert.ok(home.includes('data-goatcounter="'+endpoint+'"'));
  assert.ok(home.includes('https://gc.zgo.at/count.js'));
  await build({...options,preview:true,goatcounterUrl:endpoint});
  home=await readFile(path.join(options.outDir,'index.html'),'utf8');
  assert.ok(!home.includes('count.js'));
  await build({...options,preview:false,goatcounterUrl:''});
  home=await readFile(path.join(options.outDir,'index.html'),'utf8');
  assert.ok(!home.includes('count.js'));
  await assert.rejects(build({...options,goatcounterUrl:'https://unrelated.example/count'}),/GOATCOUNTER_URL/);
}));
