const apps=[
{name:'Firefox',icon:'🦊',category:'Internet',tags:['Browser','Open Source'],version:'141.0',hours:128,path:'firefox.exe',favorite:true},
{name:'Blender',icon:'◈',category:'Graphics',tags:['3D','Creative'],version:'4.5',hours:42,path:'blender.exe'},
{name:'Visual Studio Code',icon:'<>',category:'Development',tags:['Editor','Development'],version:'1.104',hours:310,path:'code.exe',favorite:true},
{name:'Discord',icon:'☁',category:'Internet',tags:['Communication'],version:'1.0',hours:76,path:'discord.exe'},
{name:'VLC Media Player',icon:'▶',category:'Utilities',tags:['Media','Player'],version:'3.0',hours:25,path:'vlc.exe'},
{name:'7-Zip',icon:'7',category:'Utilities',tags:['Archive','Utility'],version:'25.01',hours:8,path:'7zFM.exe'},
{name:'Notepad',icon:'▤',category:'Utilities',tags:['Windows','Editor'],version:'1.0',hours:12,path:'notepad.exe'},
{name:'Git',icon:'●',category:'Development',tags:['Developer Tool'],version:'2.50',hours:19,path:'git.exe'}
];
let view='home', filterCat=null, running=[];
const $=id=>document.getElementById(id);
function card(a){return `<article class="card" data-name="${a.name}"><div class="cover">${a.icon}</div><div class="card-body"><div class="card-title">${a.name}</div><div class="meta">${a.version} · ${a.hours} hours</div>${a.tags.map(t=>`<span class="tag">${t}</span>`).join('')}</div></article>`}
function render(){
 let q=$('search').value.toLowerCase(); let list=apps.filter(a=>(!filterCat||a.category===filterCat)&&a.name.toLowerCase().includes(q));
 $('count').textContent=apps.length; $('runningCount').textContent=running.length;
 $('hero').style.display=view==='home'&&!q?'block':'none';
 const titles={home:['Home','Your applications, all in one place.'],library:['Library','Every application you choose to manage.'],running:['Running','Applications currently launched through the hub.'],favorites:['Favorites','Your pinned applications.']};
 if(filterCat) titles.library=[filterCat,'Applications in this category.'];
 $('pageTitle').textContent=(filterCat?titles.library:titles[view])[0]; $('pageSub').textContent=(filterCat?titles.library:titles[view])[1];
 let display=view==='favorites'?list.filter(a=>a.favorite):view==='running'?running.map(n=>apps.find(a=>a.name===n)).filter(Boolean):list;
 if(view==='home') display=list;
 $('content').innerHTML=`<div class="toolbar"><h2>${view==='home'?'Recently Used':display.length+' Applications'}</h2><select id="sort"><option>Recently used</option><option>Name</option><option>Hours played</option></select></div><div class="grid-apps">${display.length?display.map(card).join(''):'<div class="empty">No applications found.</div>'}</div>`;
 document.querySelectorAll('.card').forEach(c=>c.onclick=()=>launch(c.dataset.name));
 $('sort').onchange=e=>{let s=e.target.value;if(s==='Name')display.sort((a,b)=>a.name.localeCompare(b.name));if(s==='Hours played')display.sort((a,b)=>b.hours-a.hours);$('content').querySelector('.grid-apps').innerHTML=display.map(card).join('');document.querySelectorAll('.card').forEach(c=>c.onclick=()=>launch(c.dataset.name));};
}
async function launch(name){let a=apps.find(x=>x.name===name);if(!a)return;if(a.path.includes('\\')||a.path.endsWith('.exe')){running=[...new Set([...running,name])];render();await window.hub.launchApp(a.path);}}
document.querySelectorAll('.nav[data-view]').forEach(b=>b.onclick=()=>{view=b.dataset.view;filterCat=null;document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
document.querySelectorAll('.category').forEach(b=>b.onclick=()=>{view='library';filterCat=b.dataset.cat;document.querySelectorAll('.nav').forEach(x=>x.classList.remove('active'));b.classList.add('active');render()});
$('search').oninput=render;$('scan').onclick=()=>{alert('Prototype scan complete. In the Windows-native scanner, this will discover Start Menu, Registry, Store, winget and other installed applications.');};$('heroLibrary').onclick=()=>{view='library';$('hero').style.display='none';render()};
$('addApp').onclick=()=>{$('modal').classList.remove('hidden')};$('close').onclick=()=>{$('modal').classList.add('hidden')};$('saveApp').onclick=()=>{let name=$('appName').value.trim(),path=$('appPath').value.trim(),category=$('appCat').value;if(!name)return;apps.push({name,icon:'◆',category,tags:['Manual'],version:'Unknown',hours:0,path});$('appName').value='';$('appPath').value='';$('modal').classList.add('hidden');view='library';filterCat=null;render()};render();
