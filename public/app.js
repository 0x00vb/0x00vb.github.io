import {initGraph} from './graph.js';

const themeButton=document.querySelector('.theme-toggle');
const root=document.documentElement;
function updateThemeLabel(){
  const next=root.dataset.theme==='dark'?'light':'dark';
  themeButton.setAttribute('aria-label',`Switch to ${next} mode`);
  document.querySelector('meta[name="theme-color"]').content=root.dataset.theme==='dark'?'#19171f':'#fcfcfd';
}
updateThemeLabel();
themeButton.addEventListener('click',()=>{
  root.dataset.theme=root.dataset.theme==='dark'?'light':'dark';
  localStorage.setItem('valentino-theme',root.dataset.theme);
  updateThemeLabel();
  document.dispatchEvent(new Event('themechange'));
});
const about=document.querySelector('#about details');
if(about){
  const revealAbout=()=>{if(location.hash==='#about')about.open=true;};
  window.addEventListener('hashchange',revealAbout);
  revealAbout();
}
const search=document.querySelector('#search');
if(search){
  const rows=[...document.querySelectorAll('#article-list .article-row')];
  const filters=[...document.querySelectorAll('[data-filter]')];
  const nodes=[...document.querySelectorAll('[data-concept]')];
  const edges=[...document.querySelectorAll('[data-edge]')];
  const params=new URLSearchParams(location.search);
  let selected=filters.some(b=>b.dataset.filter===params.get('topic'))?params.get('topic'):'all';
  let concept=nodes.some(b=>b.dataset.concept===params.get('concept'))?params.get('concept'):'';
  search.value=params.get('q')||'';
  function highlight(value){
    const neighbors=new Set([value]);
    for(const edge of edges){
      const ids=edge.dataset.edge.split(' ');
      const active=ids.includes(value);
      edge.dataset.active=String(active);
      edge.dataset.dimmed=String(Boolean(value)&&!active);
      if(active)ids.forEach(id=>neighbors.add(id));
    }
    for(const node of nodes)node.dataset.dimmed=String(Boolean(value)&&!neighbors.has(node.dataset.concept));
    document.querySelector('.knowledge-graph').dispatchEvent(new Event('graphhighlight'));
  }
  function filter(){
    const query=search.value.trim().toLowerCase();
    const words=query.split(/\s+/).filter(Boolean);
    let count=0;
    for(const row of rows){
      const visible=(selected==='all'||row.dataset.topic===selected)&&(!concept||row.dataset.concepts.split(' ').includes(concept))&&words.every(word=>row.dataset.search.includes(word));
      row.hidden=!visible;
      if(visible)count++;
    }
    for(const year of document.querySelectorAll('[data-year]'))year.hidden=![...year.querySelectorAll('.article-row')].some(row=>!row.hidden);
    for(const button of filters)button.setAttribute('aria-pressed',String(button.dataset.filter===selected&&!concept));
    for(const node of nodes)node.setAttribute('aria-pressed',String(node.dataset.concept===concept));
    highlight(concept);
    document.querySelector('#no-results').hidden=count!==0;
    const label=nodes.find(node=>node.dataset.concept===concept)?.textContent||'';
    document.querySelector('#result-count').textContent=`${count} ${count===1?'article':'articles'}${label?` about ${label}`:''}`;
    const url=new URL(location.href);
    if(selected==='all')url.searchParams.delete('topic');else url.searchParams.set('topic',selected);
    if(query)url.searchParams.set('q',query);else url.searchParams.delete('q');
    if(concept)url.searchParams.set('concept',concept);else url.searchParams.delete('concept');
    history.replaceState(null,'',url);
  }
  filters.forEach(button=>button.addEventListener('click',()=>{selected=button.dataset.filter;concept='';filter();}));
  initGraph(document.querySelector('.knowledge-graph'), {
    select(value){concept=concept===value?'':value;selected='all';search.value='';filter();},
    highlight(value){highlight(value||concept);}
  });
  search.addEventListener('input',()=>{selected='all';concept='';filter();});
  document.addEventListener('keydown',event=>{
    if(event.key==='/'&&!event.metaKey&&!event.ctrlKey&&!event.altKey&&!['INPUT','TEXTAREA','SELECT'].includes(document.activeElement.tagName)&&!document.activeElement.isContentEditable){event.preventDefault();search.focus();}
    if(event.key==='Escape'&&document.activeElement===search){search.value='';selected='all';concept='';filter();search.blur();}
  });
  filter();
}
