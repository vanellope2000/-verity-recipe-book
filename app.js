const STORAGE_KEY = 'verityRecipeBook.v1';
const SAMPLE_RECIPES = [
  {id:crypto.randomUUID(),title:'Air Fryer Salmon',category:'Air Fryer',serves:2,prep:'5 mins',cook:'10 mins',ingredients:['2 salmon fillets','1 tsp olive oil','Salt and pepper','Lemon wedges'],method:['Brush the salmon lightly with oil and season.','Air fry at 190°C for about 8–10 minutes, depending on thickness.','Serve with lemon.'],notes:'Check a little early rather than overcooking.',favourite:true,image:'',created:Date.now()-4000},
  {id:crypto.randomUUID(),title:'Mum’s Apple Crumble',category:'Mum’s Recipes',serves:6,prep:'15 mins',cook:'35 mins',ingredients:['5 eating apples','100 g plain flour','75 g butter','60 g sugar'],method:['Peel and slice the apples into a baking dish.','Rub butter into flour, then stir in sugar.','Scatter over the apples and bake at 180°C until golden.'],notes:'Lovely with custard.',favourite:false,image:'',created:Date.now()-3000}
];

let state = loadState();
let ui = {view:'home', query:'', category:'All', detailId:null, tab:'ingredients'};

function loadState(){
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch(e){}
  return {recipes:SAMPLE_RECIPES, firstRun:true};
}
function saveState(){ localStorage.setItem(STORAGE_KEY, JSON.stringify(state)); }
function escapeHtml(str=''){ return String(str).replace(/[&<>'"]/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;","'":"&#39;",'"':'&quot;'}[m])); }
function showToast(msg){
  const t=document.createElement('div'); t.className='toast'; t.textContent=msg; document.body.appendChild(t); setTimeout(()=>t.remove(),2200);
}
function render(){
  const app=document.getElementById('app');
  app.innerHTML = topbar() + mainView() + bottomNav();
  bindGlobal();
}
function topbar(){
  return `<header class="topbar"><h1 class="brand">Verity's Recipe Book <span>♥</span></h1><div class="subtle">Good food · happy people · special memories</div></header>`;
}
function bottomNav(){
  const items=[['home','⌂','Home'],['recipes','📖','Recipes'],['favourites','♡','Favourites'],['more','•••','More']];
  return `<nav class="bottom-nav">${items.map(([v,i,l])=>`<button class="nav-btn ${ui.view===v?'active':''}" data-view="${v}"><span class="nav-icon">${i}</span>${l}</button>`).join('')}</nav>`;
}
function mainView(){
  if(ui.view==='detail') return detailView();
  if(ui.view==='recipes') return recipesView(false);
  if(ui.view==='favourites') return recipesView(true);
  if(ui.view==='more') return moreView();
  return homeView();
}
function homeView(){
  const recent=[...state.recipes].sort((a,b)=>b.created-a.created).slice(0,4);
  return `<main class="page">
    <div class="search">🔎 <input id="home-search" placeholder="Search recipes..." value="${escapeHtml(ui.query)}"></div>
    <div class="quick-grid">
      <button class="quick-card q1" data-view="recipes"><span class="emoji">📗</span><strong>My Recipes</strong></button>
      <button class="quick-card q2" data-action="add"><span class="emoji">＋</span><strong>Add Recipe</strong></button>
      <button class="quick-card q3" data-view="favourites"><span class="emoji">♥</span><strong>Favourites</strong></button>
      <button class="quick-card q4" data-action="categories"><span class="emoji">▦</span><strong>Categories</strong></button>
    </div>
    <div class="section-title"><h2>Recently added</h2><button class="link-btn" data-view="recipes">See all</button></div>
    ${recipeGrid(recent)}
    <div class="empty" style="margin-top:20px">“A recipe isn’t just food — it’s a memory on a plate.”</div>
  </main>`;
}
function recipesView(favourites){
  let items=state.recipes.filter(r=>!favourites || r.favourite);
  if(ui.query) items=items.filter(r=>searchText(r).includes(ui.query.toLowerCase()));
  if(ui.category!=='All') items=items.filter(r=>r.category===ui.category);
  const cats=['All',...new Set(state.recipes.map(r=>r.category).filter(Boolean))];
  return `<main class="page">
    <div class="search">🔎 <input id="recipe-search" placeholder="Search recipes..." value="${escapeHtml(ui.query)}"></div>
    ${!favourites?`<div class="pill-row" style="margin:14px 0">${cats.map(c=>`<button class="pill ${ui.category===c?'active':''}" data-category="${escapeHtml(c)}">${escapeHtml(c)}</button>`).join('')}</div>`:''}
    <div class="section-title"><h2>${favourites?'Favourites':'My Recipes'}</h2><button class="link-btn" data-action="add">+ Add</button></div>
    ${recipeGrid(items)}
  </main>`;
}
function recipeGrid(items){
  if(!items.length) return `<div class="empty">No recipes here yet. Add one from a screenshot, paste some text, or type it yourself.</div>`;
  return `<div class="recipe-grid">${items.map(r=>`<article class="recipe-card">
    <button data-open="${r.id}">${r.image?`<img src="${r.image}" alt="">`:`<div class="placeholder">🍲</div>`}<div class="card-body"><div class="card-title">${escapeHtml(r.title)}</div><div class="card-meta">${escapeHtml(r.category||'Uncategorised')}${r.cook?' · '+escapeHtml(r.cook):''}</div></div></button>
    <button class="fav-btn" data-fav="${r.id}" aria-label="Favourite">${r.favourite?'♥':'♡'}</button>
  </article>`).join('')}</div>`;
}
function searchText(r){ return [r.title,r.category,r.notes,...(r.ingredients||[]),...(r.method||[])].join(' ').toLowerCase(); }
function detailView(){
  const r=state.recipes.find(x=>x.id===ui.detailId); if(!r){ui.view='recipes';return recipesView(false)}
  const content=ui.tab==='ingredients'?`<ul class="ingredient-list">${(r.ingredients||[]).map(x=>`<li><input type="checkbox"> <span>${escapeHtml(x)}</span></li>`).join('')}</ul>`:
  ui.tab==='method'?`<ol class="method-list">${(r.method||[]).map(x=>`<li>${escapeHtml(x)}</li>`).join('')}</ol>`:
  `<div class="note-box">${escapeHtml(r.notes||'No notes yet.')}</div>`;
  return `<main class="page">
    <button class="link-btn" data-view="recipes">← Back to recipes</button>
    <div class="detail-hero">${r.image?`<img src="${r.image}" alt="">`:`<div class="placeholder">🍽️</div>`}</div>
    <div class="detail-title-row"><h1>${escapeHtml(r.title)}</h1><button class="icon-btn" data-fav="${r.id}">${r.favourite?'♥':'♡'}</button></div>
    <div class="meta-row">${r.serves?`<span class="meta-chip">👤 Serves ${escapeHtml(r.serves)}</span>`:''}${r.prep?`<span class="meta-chip">◷ Prep ${escapeHtml(r.prep)}</span>`:''}${r.cook?`<span class="meta-chip">⏱ Cook ${escapeHtml(r.cook)}</span>`:''}${r.category?`<span class="meta-chip">${escapeHtml(r.category)}</span>`:''}</div>
    <div class="tabs"><button class="tab ${ui.tab==='ingredients'?'active':''}" data-tab="ingredients">Ingredients</button><button class="tab ${ui.tab==='method'?'active':''}" data-tab="method">Method</button><button class="tab ${ui.tab==='notes'?'active':''}" data-tab="notes">Notes</button></div>
    ${content}
    <div style="display:grid;gap:9px;margin-top:18px"><button class="secondary" data-edit="${r.id}">Edit Recipe</button><button class="danger" data-delete="${r.id}">Delete Recipe</button></div>
  </main>`;
}
function moreView(){
  return `<main class="page"><div class="section-title"><h2>More</h2></div><div class="more-list">
    <button class="more-row" data-action="categories"><span>▦ Categories</span><span>›</span></button>
    <button class="more-row" data-action="export"><span>⬇️ Backup / Export Recipes</span><span>›</span></button>
    <button class="more-row" data-action="import"><span>⬆️ Restore from Backup</span><span>›</span></button>
    <button class="more-row" data-action="about"><span>ⓘ About</span><span>›</span></button>
  </div><div class="empty" style="margin-top:18px">Your recipes are stored on this device in your browser. Use Backup regularly.</div></main>`;
}
function bindGlobal(){
  document.querySelectorAll('[data-view]').forEach(b=>b.onclick=()=>{ui.view=b.dataset.view; if(ui.view!=='detail')ui.detailId=null; render();});
  document.querySelectorAll('[data-open]').forEach(b=>b.onclick=()=>{ui.view='detail';ui.detailId=b.dataset.open;ui.tab='ingredients';render();});
  document.querySelectorAll('[data-fav]').forEach(b=>b.onclick=e=>{e.stopPropagation();const r=state.recipes.find(x=>x.id===b.dataset.fav); if(r){r.favourite=!r.favourite;saveState();render();}});
  document.querySelectorAll('[data-category]').forEach(b=>b.onclick=()=>{ui.category=b.dataset.category;render();});
  document.querySelectorAll('[data-tab]').forEach(b=>b.onclick=()=>{ui.tab=b.dataset.tab;render();});
  document.querySelectorAll('[data-action]').forEach(b=>b.onclick=()=>handleAction(b.dataset.action));
  document.querySelectorAll('[data-edit]').forEach(b=>b.onclick=()=>openRecipeForm(state.recipes.find(r=>r.id===b.dataset.edit)));
  document.querySelectorAll('[data-delete]').forEach(b=>b.onclick=()=>{if(confirm('Delete this recipe?')){state.recipes=state.recipes.filter(r=>r.id!==b.dataset.delete);saveState();ui.view='recipes';render();showToast('Recipe deleted');}});
  const hs=document.getElementById('home-search'); if(hs) hs.oninput=e=>{ui.query=e.target.value; if(ui.query){ui.view='recipes';render();}};
  const rs=document.getElementById('recipe-search'); if(rs) rs.oninput=e=>{ui.query=e.target.value;render();};
}
function handleAction(action){
  if(action==='add') return openAddSheet();
  if(action==='categories') return openCategories();
  if(action==='export') return exportRecipes();
  if(action==='import') return importBackup();
  if(action==='about') return openSheet(`<div class="sheet-head"><h2>About</h2><button class="icon-btn" data-close>×</button></div><p>Verity's Recipe Book is a private, phone-friendly recipe organiser. It stores your recipes in this browser and can read recipe screenshots using on-device OCR.</p><p class="small">Screenshot recognition uses Tesseract.js loaded from the internet. No paid AI account is required.</p>`);
}
function openSheet(html){
  const wrap=document.createElement('div');wrap.className='sheet-backdrop';wrap.innerHTML=`<section class="sheet">${html}</section>`;document.body.appendChild(wrap);
  wrap.onclick=e=>{if(e.target===wrap || e.target.matches('[data-close]'))wrap.remove();};
  return wrap;
}
function openAddSheet(){
  const s=openSheet(`<div class="sheet-head"><h2>Add Recipe</h2><button class="icon-btn" data-close>×</button></div><div class="action-list">
    <button class="action" data-addmode="ocr"><span class="big">📷</span><span><strong>Import from Screenshot or Photo</strong><span class="small">Choose one or several screenshots and I'll read the text.</span></span></button>
    <button class="action" data-addmode="paste"><span class="big">📋</span><span><strong>Paste Recipe Text</strong><span class="small">Paste text from a website, message or ChatGPT.</span></span></button>
    <button class="action" data-addmode="manual"><span class="big">⌨️</span><span><strong>Type it Myself</strong><span class="small">Enter the recipe manually.</span></span></button>
  </div>`);
  s.querySelectorAll('[data-addmode]').forEach(b=>b.onclick=()=>{s.remove(); if(b.dataset.addmode==='ocr')openOCR(); else if(b.dataset.addmode==='paste')openPaste(); else openRecipeForm();});
}
function openPaste(){
  const s=openSheet(`<div class="sheet-head"><h2>Paste Recipe Text</h2><button class="icon-btn" data-close>×</button></div><div class="form"><label>Recipe text<textarea id="paste-text" placeholder="Paste the whole recipe here..."></textarea></label><button class="primary" id="parse-paste">Turn into Recipe</button></div>`);
  s.querySelector('#parse-paste').onclick=()=>{const txt=s.querySelector('#paste-text').value.trim(); if(!txt)return showToast('Paste some recipe text first'); s.remove(); openRecipeForm(parseRecipeText(txt));};
}
function openOCR(){
  const s=openSheet(`<div class="sheet-head"><h2>Import from Screenshot</h2><button class="icon-btn" data-close>×</button></div><div class="form">
    <div class="empty">Choose one or more screenshots. Longer recipes can be split over several images.</div>
    <input id="ocr-files" type="file" accept="image/*" multiple>
    <div id="ocr-previews" class="preview-strip"></div>
    <div id="ocr-status" class="ocr-status hidden">Reading image…<div class="progress"><div id="ocr-progress"></div></div></div>
    <button class="primary" id="run-ocr">Read Screenshot(s)</button>
    <div class="small">The text is processed in your browser. For the first scan, the OCR library may need an internet connection to load.</div>
  </div>`);
  const input=s.querySelector('#ocr-files'), previews=s.querySelector('#ocr-previews');
  input.onchange=()=>{previews.innerHTML='';[...input.files].forEach(f=>{const img=document.createElement('img');img.src=URL.createObjectURL(f);previews.appendChild(img);});};
  s.querySelector('#run-ocr').onclick=async()=>{
    const files=[...input.files]; if(!files.length)return showToast('Choose a screenshot first');
    if(!window.Tesseract) return showToast('OCR could not load. Check your internet connection.');
    const status=s.querySelector('#ocr-status'), bar=s.querySelector('#ocr-progress'); status.classList.remove('hidden');
    let all='';
    try{
      for(let i=0;i<files.length;i++){
        const result=await Tesseract.recognize(files[i],'eng',{logger:m=>{if(m.status==='recognizing text'){const overall=((i+(m.progress||0))/files.length)*100;bar.style.width=overall+'%';status.firstChild.textContent=`Reading screenshot ${i+1} of ${files.length}… `;}}});
        all += '\n'+result.data.text;
      }
      s.remove();
      const parsed=parseRecipeText(all);
      openRecipeForm(parsed, 'I’ve read your screenshot. Please check and correct anything before saving.');
    }catch(err){console.error(err);showToast('I could not read that image. Try a clearer screenshot.');}
  };
}
function parseRecipeText(text){
  const rawLines=text.split(/\r?\n/).map(x=>x.replace(/\s+/g,' ').trim()).filter(Boolean);
  const lines=rawLines.filter(x=>x.length>1);
  const lower=lines.map(x=>x.toLowerCase());
  const idxIng=lower.findIndex(x=>/^ingredients?\b/.test(x));
  const idxMeth=lower.findIndex(x=>/^(method|instructions?|directions?|preparation)\b/.test(x));
  const title=guessTitle(lines,idxIng,idxMeth);
  let ing=[]; let method=[];
  if(idxIng>=0){const end=idxMeth>idxIng?idxMeth:lines.length;ing=lines.slice(idxIng+1,end).filter(looksIngredient);}
  if(idxMeth>=0){method=lines.slice(idxMeth+1).map(cleanStep).filter(Boolean);}
  if(!ing.length){ing=lines.filter(looksIngredient).slice(0,30);}
  if(!method.length){method=lines.filter(x=>looksMethod(x) && !ing.includes(x) && x!==title).map(cleanStep).slice(0,30);}
  const servesLine=lines.find(x=>/serv(es|ings?)\s*[:\-]?\s*\d+/i.test(x));
  const prepLine=lines.find(x=>/prep( time)?\s*[:\-]?/i.test(x));
  const cookLine=lines.find(x=>/(cook(ing)? time|bake|roast|air fry)\s*[:\-]?/i.test(x));
  return {title:title||'Untitled Recipe',category:'',serves:extractNumber(servesLine)||'',prep:extractAfterColon(prepLine),cook:extractAfterColon(cookLine),ingredients:ing,method,notes:'',favourite:false,image:'',created:Date.now()};
}
function guessTitle(lines,idxIng,idxMeth){
  const limit=Math.min(...[idxIng,idxMeth,8].filter(x=>x>=0));
  const pool=lines.slice(0,limit||5).filter(x=>x.length<70&&!/serves|prep|cook|ingredients|method/i.test(x));
  return pool.sort((a,b)=>scoreTitle(b)-scoreTitle(a))[0]||lines[0]||'';
}
function scoreTitle(x){let s=0;if(x.length>3&&x.length<45)s+=4;if(!/\d/.test(x))s+=2;if(/recipe/i.test(x))s-=2;return s;}
function looksIngredient(x){return /(^|\s)(\d+([./]\d+)?|\d+\s?½|½|¼|¾)\s*(g|kg|ml|l|tsp|tbsp|tablespoons?|teaspoons?|cups?|oz|lb|cloves?|slices?|cans?|tins?|packets?|pinch|handful)?\b/i.test(x)||/\b(to taste|salt|pepper|oil|butter|flour|sugar|onion|garlic|eggs?|milk|cream|chicken|beef|pork|rice|pasta)\b/i.test(x)&&x.length<100;}
function looksMethod(x){return /^\d+[.)\s]/.test(x)||/\b(add|mix|stir|cook|bake|fry|heat|place|pour|serve|chop|slice|whisk|roast|air fry|season|combine|simmer|boil)\b/i.test(x);}
function cleanStep(x){return x.replace(/^\s*\d+[.)\-:\s]+/,'').trim();}
function extractNumber(x=''){const m=String(x).match(/\d+/);return m?m[0]:'';}
function extractAfterColon(x=''){if(!x)return'';const parts=x.split(/[:\-]/);return parts.length>1?parts.slice(1).join('-').trim():x.replace(/^(prep( time)?|cook(ing)? time)\s*/i,'').trim();}
function openRecipeForm(recipe=null, notice=''){
  const r=recipe?JSON.parse(JSON.stringify(recipe)):{id:'',title:'',category:'',serves:'',prep:'',cook:'',ingredients:[],method:[],notes:'',favourite:false,image:'',created:Date.now()};
  const cats=[...new Set(state.recipes.map(x=>x.category).filter(Boolean))];
  const s=openSheet(`<div class="sheet-head"><h2>${r.id?'Edit Recipe':'Check Your Recipe'}</h2><button class="icon-btn" data-close>×</button></div>${notice?`<div class="ocr-status" style="margin-bottom:12px">${escapeHtml(notice)}</div>`:''}<div class="form">
    <label>Recipe name<input id="f-title" value="${escapeHtml(r.title)}" placeholder="e.g. Chicken Curry"></label>
    <div class="two-col"><label>Serves<input id="f-serves" value="${escapeHtml(r.serves)}" inputmode="numeric"></label><label>Category<input id="f-category" list="cat-list" value="${escapeHtml(r.category)}" placeholder="e.g. Dinner"><datalist id="cat-list">${cats.map(c=>`<option value="${escapeHtml(c)}">`).join('')}</datalist></label></div>
    <div class="two-col"><label>Prep time<input id="f-prep" value="${escapeHtml(r.prep)}" placeholder="10 mins"></label><label>Cook time<input id="f-cook" value="${escapeHtml(r.cook)}" placeholder="30 mins"></label></div>
    <label>Ingredients<textarea id="f-ing" placeholder="One ingredient per line">${escapeHtml((r.ingredients||[]).join('\n'))}</textarea></label>
    <label>Method<textarea id="f-method" placeholder="One step per line">${escapeHtml((r.method||[]).join('\n'))}</textarea></label>
    <label>Notes<textarea id="f-notes" placeholder="Anything you want to remember...">${escapeHtml(r.notes)}</textarea></label>
    <label>Recipe photo (optional)<input id="f-image" type="file" accept="image/*"></label>
    <button class="primary" id="save-recipe">Save Recipe</button>
  </div>`);
  s.querySelector('#save-recipe').onclick=async()=>{
    const title=s.querySelector('#f-title').value.trim();if(!title)return showToast('Give the recipe a name');
    const file=s.querySelector('#f-image').files[0]; let image=r.image||''; if(file) image=await fileToDataURLResized(file,1200,.82);
    const out={...r,id:r.id||crypto.randomUUID(),title,serves:s.querySelector('#f-serves').value.trim(),category:s.querySelector('#f-category').value.trim()||'Uncategorised',prep:s.querySelector('#f-prep').value.trim(),cook:s.querySelector('#f-cook').value.trim(),ingredients:linesFrom(s.querySelector('#f-ing').value),method:linesFrom(s.querySelector('#f-method').value).map(cleanStep),notes:s.querySelector('#f-notes').value.trim(),image,created:r.created||Date.now()};
    const idx=state.recipes.findIndex(x=>x.id===out.id);if(idx>=0)state.recipes[idx]=out;else state.recipes.unshift(out);saveState();s.remove();ui.view='detail';ui.detailId=out.id;ui.tab='ingredients';render();showToast('Recipe saved');
  };
}
function linesFrom(text){return text.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);}
async function fileToDataURLResized(file,max=1200,quality=.82){
  const url=URL.createObjectURL(file);const img=new Image();await new Promise((res,rej)=>{img.onload=res;img.onerror=rej;img.src=url;});
  const scale=Math.min(1,max/Math.max(img.width,img.height));const c=document.createElement('canvas');c.width=Math.round(img.width*scale);c.height=Math.round(img.height*scale);c.getContext('2d').drawImage(img,0,0,c.width,c.height);URL.revokeObjectURL(url);return c.toDataURL('image/jpeg',quality);
}
function openCategories(){
  const counts={};state.recipes.forEach(r=>counts[r.category||'Uncategorised']=(counts[r.category||'Uncategorised']||0)+1);
  const s=openSheet(`<div class="sheet-head"><h2>Categories</h2><button class="icon-btn" data-close>×</button></div><div class="category-list">${Object.entries(counts).sort((a,b)=>a[0].localeCompare(b[0])).map(([c,n])=>`<button class="category-row" data-catgo="${escapeHtml(c)}"><span>${escapeHtml(c)}</span><span>${n} ›</span></button>`).join('')||'<div class="empty">No categories yet.</div>'}</div>`);
  s.querySelectorAll('[data-catgo]').forEach(b=>b.onclick=()=>{ui.category=b.dataset.catgo;ui.view='recipes';s.remove();render();});
}
function exportRecipes(){
  const blob=new Blob([JSON.stringify({version:1,exported:new Date().toISOString(),recipes:state.recipes},null,2)],{type:'application/json'});const a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='verity-recipe-book-backup.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000);showToast('Backup downloaded');
}
function importBackup(){
  const input=document.createElement('input');input.type='file';input.accept='application/json,.json';input.onchange=async()=>{const f=input.files[0];if(!f)return;try{const data=JSON.parse(await f.text());const recipes=Array.isArray(data)?data:data.recipes;if(!Array.isArray(recipes))throw new Error('bad'); if(confirm(`Restore ${recipes.length} recipes? This replaces the recipes currently stored on this device.`)){state.recipes=recipes;saveState();render();showToast('Backup restored');}}catch(e){showToast('That backup file could not be read');}};input.click();
}

if('serviceWorker' in navigator){window.addEventListener('load',()=>navigator.serviceWorker.register('sw.js').catch(()=>{}));}
render();
