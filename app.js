const state={channels:[],favorites:new Set(JSON.parse(localStorage.getItem("enjoytv_favs")||"[]")),recent:JSON.parse(localStorage.getItem("enjoytv_recent")||"[]"),filter:"all"};

const $=id=>document.getElementById(id);
const save=()=>{localStorage.setItem("enjoytv_favs",JSON.stringify([...state.favorites]));localStorage.setItem("enjoytv_recent",JSON.stringify(state.recent.slice(0,20)))};
function demoChannels(){return[
{name:"Enjoy News",group:"News",url:"https://test-streams.mux.dev/x36xhzz/x36xhzz.m3u8"},
{name:"Sample Live",group:"Demo",url:"https://test-streams.mux.dev/test_001/stream.m3u8"},
{name:"Movie Demo",group:"Movies",url:"https://test-streams.mux.dev/bbb-360p/bbb-360p.m3u8"}
]}
state.channels=demoChannels();

function render(){
 let list=state.channels;
 if(state.filter==="fav") list=list.filter(x=>state.favorites.has(x.id));
 if(state.filter==="recent") list=state.recent.map(id=>state.channels.find(x=>x.id===id)).filter(Boolean);
 $("channelCount").textContent=`${state.channels.length} channels`;
 $("favCount").textContent=`${state.favorites.size} saved`;
 $("recentCount").textContent=`${state.recent.length} items`;
 $("channelHeading").textContent=state.filter==="fav"?"Favorites":state.filter==="recent"?"Recently Watched":"Live Channels";
 $("empty").classList.toggle("hidden",list.length>0);
 $("channelGrid").innerHTML=list.map((c,i)=>`<article class="channel">
 <button class="heart ${state.favorites.has(c.id)?"on":""}" data-fav="${c.id}">${state.favorites.has(c.id)?"♥":"♡"}</button>
 <div class="thumb">${c.logo?`<img src="${escapeAttr(c.logo)}" onerror="this.remove()">`:`<div class="fallback">TV</div>`}</div>
 <div class="channelInfo"><div class="channelName">${escapeHtml(c.name)}</div><div class="channelGroup">${escapeHtml(c.group||"General")}</div>
 <button class="play" data-play="${c.id}">▶ Watch</button></div></article>`).join("");
 document.querySelectorAll("[data-play]").forEach(b=>b.onclick=()=>play(b.dataset.play));
 document.querySelectorAll("[data-fav]").forEach(b=>b.onclick=()=>toggleFav(b.dataset.fav));
}
function escapeHtml(s){return String(s??"").replace(/[&<>"']/g,m=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;","'":"&#39;"}[m]))}
function escapeAttr(s){return escapeHtml(s)}
function toggleFav(id){state.favorites.has(id)?state.favorites.delete(id):state.favorites.add(id);save();render()}
function play(id){
 const c=state.channels.find(x=>x.id===id); if(!c)return;
 const v=$("player"); $("playerSection").classList.remove("hidden");$("nowTitle").textContent=c.name;$("nowGroup").textContent=c.group||"";
 v.src=c.url; v.play().catch(()=>{});
 state.recent=[id,...state.recent.filter(x=>x!==id)].slice(0,20);save();window.scrollTo({top:$("playerSection").offsetTop-60,behavior:"smooth"});
}
function setFilter(f){state.filter=f;document.querySelectorAll(".filter,.nav").forEach(x=>x.classList.toggle("active",x.dataset.filter===f));render();if(f!=="all")$("channels").scrollIntoView({behavior:"smooth"})}
document.querySelectorAll(".filter,.quick,.nav[data-filter]").forEach(x=>x.onclick=()=>setFilter(x.dataset.filter||"all"));
$("browseBtn").onclick=()=>{$("channels").scrollIntoView({behavior:"smooth"})};
$("closePlayer").onclick=()=>{$("player").pause();$("player").removeAttribute("src");$("player").load();$("playerSection").classList.add("hidden")};

function openModal(id){$(id).classList.remove("hidden")}function closeModal(id){$(id).classList.add("hidden")}
$("addBtn").onclick=()=>openModal("modal");$("modalClose").onclick=()=>closeModal("modal");
$("loadPlaylist").onclick=async()=>{
 const url=$("m3uUrl").value.trim();$("loadStatus").textContent="Loading…";
 try{
  const r=await fetch(url);if(!r.ok)throw new Error("HTTP "+r.status);const txt=await r.text();const parsed=parseM3U(txt);
  if(!parsed.length)throw new Error("No channels found");
  state.channels=parsed;save();closeModal("modal");state.filter="all";render();
 }catch(e){$("loadStatus").textContent="Could not load playlist. The URL may block browser CORS requests. Try a CORS-enabled public M3U URL."}
};
function parseM3U(txt){
 const lines=txt.split(/\r?\n/).map(x=>x.trim()).filter(Boolean),out=[];let meta=null;
 for(const line of lines){if(line.startsWith("#EXTINF")){meta=line}else if(!line.startsWith("#")&&meta){
  const comma=meta.indexOf(",");let name=comma>=0?meta.slice(comma+1).trim():"Channel";
  const group=(meta.match(/group-title="([^"]*)"/i)||[])[1]||"General";
  const logo=(meta.match(/tvg-logo="([^"]*)"/i)||[])[1]||"";
  const id="c"+Math.random().toString(36).slice(2)+Date.now();out.push({id,name,group,logo,url:line});meta=null;
 }} return out;
}

$("searchBtn").onclick=()=>{openModal("searchModal");$("searchInput").focus();doSearch()};
$("navSearch").onclick=()=>{$("searchBtn").click()};
$("searchClose").onclick=()=>closeModal("searchModal");
$("searchInput").oninput=doSearch;
function doSearch(){const q=$("searchInput").value.trim().toLowerCase();const arr=state.channels.filter(c=>c.name.toLowerCase().includes(q)||String(c.group).toLowerCase().includes(q));$("searchResults").innerHTML=arr.slice(0,30).map(c=>`<div class="result"><button data-s="${c.id}"><b>${escapeHtml(c.name)}</b><br><small>${escapeHtml(c.group||"")}</small></button></div>`).join("")||`<div class="status">No results</div>`;document.querySelectorAll("[data-s]").forEach(b=>b.onclick=()=>{closeModal("searchModal");play(b.dataset.s)})}
$("navLive").onclick=()=>setFilter("all");
$("navSettings").onclick=()=>openModal("modal");
render();
