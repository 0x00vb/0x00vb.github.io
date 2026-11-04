import path from 'node:path';
import {writeFile} from 'node:fs/promises';
import {parseArgs} from 'node:util';
import {fileURLToPath} from 'node:url';
import {root,topics,validDate} from './build.mjs';

export async function createPost({title,topic='systems',date,slug,directory=path.join(root,'content/posts'),today}) {
  today ||= new Intl.DateTimeFormat('en-CA',{timeZone:'America/Argentina/Buenos_Aires',year:'numeric',month:'2-digit',day:'2-digit'}).format(new Date());
  date ||= today;
  slug ||= title?.normalize('NFKD').replace(/[\u0300-\u036f]/g,'').toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,'');
  if(typeof title!=='string' || !title.trim())throw new Error('Provide a post title.');
  if(!slug || !/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(slug))throw new Error('Provide a filename slug containing lowercase words separated by hyphens.');
  if(!Object.hasOwn(topics,topic))throw new Error(`Topic must be one of: ${Object.keys(topics).join(', ')}`);
  if(!validDate(date) || !validDate(today))throw new Error('Dates must use YYYY-MM-DD.');
  const concepts={ai:['ml'],systems:['architecture'],security:['security'],design:['design-systems'],essays:['judgment']}[topic];
  const frontmatter=`---\ntitle: ${JSON.stringify(title.trim())}\ndescription: "Write one sentence about the question this post answers."\ntopic: ${topic}\nconcepts: ${JSON.stringify(concepts)}\ndate: ${date}\nwritten: ${today}\nstatus: draft\norder: 0\n---\n\nStart with the problem.\n`;
  const filename=path.join(directory,`${slug}.md`);
  await writeFile(filename,frontmatter,{flag:'wx'});
  return filename;
}

if(process.argv[1]===fileURLToPath(import.meta.url)) {
  const {values,positionals}=parseArgs({allowPositionals:true,options:{topic:{type:'string',default:'systems'},date:{type:'string'},slug:{type:'string'}}});
  const filename=await createPost({title:positionals.join(' '),...values});
  process.stdout.write(`Created ${filename}\nEdit the Markdown, then set status: published and add published: YYYY-MM-DD when ready.\n`);
}
