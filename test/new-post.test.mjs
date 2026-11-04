import {test} from 'node:test';
import assert from 'node:assert/strict';
import {mkdtemp,readFile,rm,readdir} from 'node:fs/promises';
import {tmpdir} from 'node:os';
import path from 'node:path';
import {createPost} from '../scripts/new-post.mjs';
import {loadPosts} from '../scripts/build.mjs';

test('new posts are valid drafts and existing Markdown cannot be overwritten',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'blog-new-'));
  try {
    const filename=await createPost({title:'A small experiment',topic:'ai',date:'2025-06-23',today:'2026-11-04',directory});
    const original=await readFile(filename,'utf8');
    const posts=await loadPosts(directory);
    assert.equal(posts[0].status,'draft');
    assert.equal(posts[0].date,'2025-06-23');
    assert.equal(posts[0].written,'2026-11-04');
    await assert.rejects(createPost({title:'A small experiment',today:'2026-11-04',directory}),{code:'EEXIST'});
    assert.equal(await readFile(filename,'utf8'),original);
  } finally {await rm(directory,{recursive:true,force:true});}
});

test('invalid topic and date fail without writing a file',async()=>{
  const directory=await mkdtemp(path.join(tmpdir(),'blog-new-'));
  try {
    await assert.rejects(createPost({title:'Example',topic:'unknown',directory}),/Topic must/);
    await assert.rejects(createPost({title:'Example',date:'2026-02-31',directory}),/Dates must/);
    assert.deepEqual(await readdir(directory),[]);
  } finally {await rm(directory,{recursive:true,force:true});}
});
