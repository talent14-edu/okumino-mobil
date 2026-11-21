const books = [
 {id:'pinokyo',name:'Pinokyo',author:'Carlo Collodi',level:'Kâşif',total:8,desc:'Konuşan bir odun parçasından meraklı bir kuklaya… Gepetto’nun atölyesinden yola çık.',stops:[
 ['Atölyedeki ilk sürpriz','Gepetto rendesini eline aldı. Tezgâhtaki odun incecik bir sesle güldü. Usta eğilip dinledi. Atölyede ikisinden başka kimse yoktu.','Ses nereden geldi?','Odundan','Pencereden'],
 ['İlk adımlar','Gepetto kuklasının ayaklarını bitirdi. Pinokyo önce sallandı, sonra bir adım attı. Açık kapıyı görünce sokağa fırladı. Usta elinde minik bir ayakkabıyla arkasından baktı.','Gepetto neden ayakkabıyla kaldı?','Kukla çoktan koşmuştu','Ayakkabı çok büyüktü']]},
 {id:'heidi',name:'Heidi',author:'Johanna Spyri',level:'Minik',total:6,desc:'Dağ yolunu tırman. Heidi ile küçük bir kulübede yeni bir yuva keşfet.',stops:[
 ['Dağa doğru','Heidi teyzesiyle dağa çıktı. Yolun sonunda tahta bir kulübe vardı. Kapıda dedesi oturuyordu. Heidi ona el salladı.','Heidi’yi kim karşıladı?','Dedesi','Çoban'],
 ['Yıldızlı pencere','Heidi samanlığa çıktı. Yumuşak samanları yan yana topladı. Yatağı hazırdı. Uzanınca küçük pencereden yıldızları gördü.','Heidi samanları neden topladı?','Yatak yapmak için','Yolu kapatmak için']]},
 {id:'alice',name:'Alice Harikalar Diyarında',author:'Lewis Carroll',level:'Kâşif',total:8,desc:'Bir cep saati, telaşlı bir tavşan ve hiç beklenmedik bir yolculuk.',stops:[
 ['Saatli tavşan','Alice çimenlere uzanmıştı. Yelekli bir tavşan cebinden saat çıkardı. Geç kaldığını söyleyip koşunca Alice de merakla peşine düştü.','Alice neden tavşanı izledi?','Onu merak etti','Saatini kaybetti'],
 ['Tavşan deliği','Tavşan çitin dibinde gözden kayboldu. Alice deliğe eğilince aşağı doğru süzüldü. Düşerken duvardaki raflara baktı. Bir kavanozu alıp başka bir rafa bıraktı.','Alice düşerken ne gördü?','Kavanozlarla dolu rafları','Bahçedeki çiti']]},
 {id:'kucuk-prens',name:'Küçük Prens',author:'Antoine de Saint-Exupéry',level:'Usta',total:10,desc:'Çöldeki pilotun yanına küçük bir gezgin gelir. Birlikte, çizgilerin ardında saklananı keşfet.',stops:[
 ['Çölde bir ses','Pilot uçağını onarmak için çöle inmişti. Sabah yanında hiç beklemediği küçük bir yolcu buldu. Yolcu ondan su ya da yiyecek yerine bir koyun resmi istedi.','Pilotu şaşırtan istek neydi?','Bir koyun çizmesi','Bir çadır kurması'],
 ['Kutunun içinde','Pilot birkaç koyun çizdi. Küçük yolcu hiçbirini beğenmedi. Sonunda pilot bir kutu çizdi ve koyunun içinde olduğunu söyledi. Yolcu gülümsedi. Artık dilediği koyunu hayal edebilirdi.','Kutu neden işe yaradı?','Hayal etmeye yer bıraktı','Koyunları saymayı öğretti']]}
];
const screen=document.querySelector('main'), nav=document.querySelector('nav'), bar=document.querySelector('header');
let state={selected:'pinokyo',steps:{}}, filter='Tümü';
function load(){try{const saved=JSON.parse(localStorage.getItem('okumino-mobil-v1'));state=saved?.steps && books.some(b=>b.id===saved.selected)?saved:{selected:'pinokyo',steps:{}}}catch{}}
load();
function save(){try{localStorage.setItem('okumino-mobil-v1',JSON.stringify(state))}catch{}}
function appSteps(){return state.steps}
const count=b=>Math.min(4,Math.max(0,Number(state.steps[b.id])||0));
const asset=id=>'assets/'+id+'.webp';
const btn=(url,label,cls='cta primary')=>`<a class="${cls}" href="#${url}">${label}</a>`;
const back=(url,label)=>btn(url,'‹ &nbsp;'+label,'back');
const icons={oda:'<path d="M3 10l9-7 9 7v11h-6v-7H9v7H3z"/>',raf:'<path d="M3 5h4v15H3zm7-1h4v16h-4zm6 2 3-1 3 14-3 1z"/>',patika:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="4" r="2"/><path d="M6 17c0-8 13 0 13-7 0-3-5-2-3-5"/>',profil:'<path d="M12 21V11"/><path d="M12 13c-4 0-6-3-6-7 4 0 6 3 6 7z"/><path d="M12 11c0-4 2-7 6-7 0 4-2 7-6 7z"/><path d="M7 21h10"/>'};
function cards(list){return list.map(b=>{const r=bookPagesRead(b.id),t=readerBooks[b.id].length;return `<a class="book" href="#kitap/${b.id}"><img src="${asset(b.id)}" alt=""><b>${b.name}</b><small>${b.level}${r?' · '+r+'/'+t+' sayfa':''}</small>${r?`<div class="minibar"><i style="width:${r/t*100}%"></i></div>`:''}</a>`}).join('')}

// Üst çubuk: logo, bugünün damlaları, bildirim zili. Tek bakışta üç şey, fazlası değil.
function header(sum){
 bar.innerHTML=`<a href="#oda" aria-label="Okumino ana sayfa"><img src="assets/okumino_logo.webp" alt="Okumino"></a><div class="top-right"><a class="drop-chip" href="#profil" aria-label="Bugün ${sum.todayDrops} / ${sum.goal} damla, ${sum.streak} gün seri"><span>💧 ${sum.todayDrops}/${sum.goal}</span>${sum.streak?`<span class="streak">🔥 ${sum.streak}</span>`:''}</a><a class="bell" href="#bildirimler" aria-label="Bildirimler"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.9" stroke-linejoin="round" aria-hidden="true"><path d="M6 16V11a6 6 0 0 1 12 0v5l2 2H4z"/><path d="M10 20a2 2 0 0 0 4 0"/></svg><i hidden></i></a></div>`;
 Notify.paintBell();
}

// Kutlama: her ekran çiziminde günlüğün özeti son görülenle karşılaştırılır.
// Böylece damla atölyeden de, okuyucudan da gelse aynı yerde kutlanır.
function celebrate(sum){
 let seen={drops:0,level:0,badges:[]};
 try{seen=JSON.parse(localStorage.getItem('okumino-son-gorulen'))||seen}catch{}
 const earned=badgeList(sum,state.steps).filter(b=>b.on).map(b=>b.title);
 try{localStorage.setItem('okumino-son-gorulen',JSON.stringify({drops:sum.drops,level:sum.level,badges:earned}))}catch{}
 if(sum.drops<=seen.drops && !earned.some(b=>!seen.badges.includes(b)))return;
 const gained=sum.drops-seen.drops, fresh=earned.filter(b=>!seen.badges.includes(b));
 if(sum.level>seen.level) return modal(`<div class="grow-anim">${plantSVG(sum)}</div><small class="eyebrow">FİDANIN BÜYÜDÜ</small><h2>Artık bir ${sum.stage.name.toLocaleLowerCase('tr')}!</h2><p>${sum.next?`Sırada ${sum.next.name}: ${sum.next.at-sum.drops} damla kaldı.`:'Fidanın meyve verdi. Harika bir okur oldun!'}</p>${fresh.length?`<p class="muted">Yeni rozet: ${fresh.join(', ')}</p>`:''}<button class="cta primary" data-close>Okumaya devam</button>`);
 if(fresh.length){const b=badgeList(sum,state.steps).find(x=>x.title===fresh[0]);return modal(`<span class="big-emoji pop">${b.icon}</span><small class="eyebrow">YENİ ROZET</small><h2>${b.title}</h2><p>${b.hint}: tamam!</p><button class="cta primary" data-close>Harika!</button>`)}
 if(gained>0)toast(`+${gained} damla 💧 Fidanın büyüyor`);
}
function toast(text){let t=document.querySelector('.toast');if(!t){t=document.createElement('p');t.className='toast';t.setAttribute('role','status');document.body.append(t)}t.textContent=text;t.classList.remove('show');void t.offsetWidth;t.classList.add('show')}
function modal(html){document.querySelectorAll('dialog.celebrate').forEach(x=>x.remove());const d=document.createElement('dialog');d.className='celebrate';d.innerHTML=html;document.body.append(d);d.showModal();d.addEventListener('click',e=>{if(e.target===d||e.target.closest('[data-close]')){d.close();d.remove()}})}

function render(){
 load();
 const [route='oda',id,index]=location.hash.slice(1).split('/').map(x=>x?decodeURIComponent(x):undefined);
 const b=books.find(x=>x.id===id)||books.find(x=>x.id===state.selected);
 const n=count(b), done=Math.floor(n/2), path='patika/'+b.id;
 const section=['kitap','raf','oku','etkinlikler','soru','tamam'].includes(route)?'raf':['patika','durak','sonuc'].includes(route)?'patika':['profil','pasaport'].includes(route)?'profil':route;
 nav.innerHTML=Object.entries({oda:'Odam',raf:'Kitaplığım',patika:'Patikam',profil:'Profilim'}).map(([key,title])=>`<a href="#${key}" ${key===section?'aria-current="page"':''}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round" stroke-linecap="round">${icons[key]}</svg>${title}</a>`).join('');
 const sum=Journal.summary();
 header(sum);
 document.body.dataset.route=route;
 if(route==='raf'){
 screen.innerHTML=`<h1>Kitaplığım</h1><p>Seviyeni seç, kapağına dokun.</p><div class="filters">${['Tümü','Minik','Kâşif','Usta'].map(x=>`<button class="chip" aria-pressed="${filter===x}" data-filter="${x}">${x}</button>`).join('')}</div><div class="shelf">${cards(books.filter(x=>filter==='Tümü'||x.level===filter))}</div>`;
 }else if(route==='kitap'){
 screen.innerHTML=back('raf','Kitaplık')+`<div class="detail"><img src="${asset(b.id)}" alt=""><div><small class="eyebrow">${b.level} · ${b.total} durak</small><h1>${b.name}</h1><b>${b.author}</b><p>${b.desc}</p></div></div><h2 class="mode-title">Nasıl okumak istersin?</h2>${bookModes(b,n)}`;
 }else if(route==='oku'){
 screen.innerHTML=reader(b,index);
 }else if(route==='tamam'){
 screen.innerHTML=back('kitap/'+b.id,b.name)+finishedBook(b);
 }else if(route==='etkinlikler'){
 screen.innerHTML=activityMenu(b,index==='bitti');
 }else if(route==='soru'){
 screen.innerHTML=question(b,Number(index))||'';
 }else if(route==='patika'){
 state.selected=b.id;save();
 screen.innerHTML=back('kitap/'+b.id,b.name)+`<div class="detail"><img src="${asset(b.id)}" alt=""><div><small class="eyebrow">${b.level} · ${b.total} durak</small><h1>${b.name}</h1><b>${b.author}</b><p>${b.desc}</p></div></div><div class="row"><h2>Kitap patikası</h2><b>${done}/2 damga</b></div><small class="muted">Örnek patika · Kitabın ilk iki durağı</small><div class="map"><div class="map-guide"><img src="pinokyo/assets/mino.webp" alt="Mino"><div><b>Mino ile keşfet</b><p>${done===2?"İki damgan da hazır!":"Bir durağa dokun, hikâyeye katıl."}</p></div></div>${b.stops.map((s,i)=>{const locked=i>done,tag=locked?'div':'a';return `<${tag} class="stop ${locked?'locked':''}" ${locked?'':`href="#durak/${b.id}/${i}"`}><span class="num">${i<done?'✓':i+1}</span><span><small>${i+1}. DURAK · ${locked?'Önce 1. durağı bitir':i<done?'Tamamlandı · Tekrar oku':'Açık · Devam et'}</small><b>${s[0]}</b>${b.id==="pinokyo" && i===0?'<span class="mini-icons"><img src="pinokyo/assets/icons/light_bulb.png" alt=""><img src="pinokyo/assets/icons/books.png" alt=""><img src="pinokyo/assets/icons/clapper.png" alt="">6 etkinlik</span>':""}</span></${tag}>`}).join('')}</div>${done===2?btn('pasaport','Damgalarımı gör'):''}`;
 }else if(route==='durak'){
 const i=Number(index);if(![0,1].includes(i)||i>done){location.replace('#'+path);return}
 if(b.id==='pinokyo' && i===0){location.replace('pinokyo/index.html');return}
 const s=b.stops[i],quiz=n===i*2+1;
 screen.innerHTML=`<div class="activity-tools">${back(path,'Kitap patikası')}<button type="button" data-skip>Demoyu geç</button></div><article class="panel"><small class="eyebrow">${b.name} · ${i+1}. durak · ${quiz?'2/2':'1/2'}</small><div class="track"><i style="width:${quiz?100:50}%"></i></div><h2>${quiz?'Hikâyeyi hatırla':s[0]}</h2><img class="scene" src="${asset(b.id+'-'+(i+1))}" alt=""><p>${quiz?s[2]:s[1]}</p>${quiz?`<div class="options">${(i===0?[4,3]:[3,4]).map(k=>`<button data-answer="${k}">${s[k]}</button>`).join('')}</div><p class="status" role="status"></p>`:i<done?btn(path,'Patikaya dön'):'<button class="cta primary" data-read>Soruya geç</button>'}</article>`;
 }else if(route==='sonuc'){
 screen.innerHTML=`<div class="panel center"><small class="eyebrow">Okuma pasaportu</small><h1>Damgan hazır!</h1><div class="stamp">✦ &nbsp; ${b.name} · ${done}. durak</div><p>${done===1?'İkinci durağın açıldı.':'Bu kitabın iki örnek durağını tamamladın.'}</p>${btn(path,'Patikayı gör')}</div>`;
 }else if(route==='pasaport'){
 const stamps=books.flatMap(x=>x.stops.slice(0,Math.floor(count(x)/2)).map((s,i)=>`<div class="stamp">✦ &nbsp; ${x.name} · ${i+1}. durak<br><small>${s[0]}</small></div>`));screen.innerHTML=back('profil','Profilim')+`<h1>Pasaportum</h1><p>${stamps.length?'Tamamladığın duraklardan damgaların.':'İlk durağını tamamladığında damgan burada görünecek.'}</p>${stamps.join('')}${btn(path,'Patikama git')}`;
 }else if(route==='profil'){
 screen.innerHTML=profile(state.steps);
 }else if(route==='bildirimler'){
 screen.innerHTML=Notify.center();Notify.paintBell();
 }else{
 screen.innerHTML=`${todayCard(sum,books.find(x=>x.id===(sum.list.find(e=>e.type==='page')||{}).book)||b)}<div class="row"><h2>Kitap patikam</h2></div><div class="pathcard"><img src="${asset(b.id)}" alt=""><div><small class="eyebrow">${b.level} · ${b.total} durak</small><h3>${b.name}</h3><small>${done===2?'Örnek patika tamamlandı':b.stops[done][0]}</small></div>${btn(path,'Patikayı aç')}</div><div class="row"><h2>Kitap rafım</h2>${btn('raf','Tümünü gör','link')}</div><div class="shelf preview">${cards(books)}</div>`;
 }
 celebrate(sum);
 screen.onclick=e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.filter){filter=t.dataset.filter;render();screen.querySelector('[aria-pressed=true]').focus();return}
 if(t.dataset.try){Notify.push(t.dataset.try);return}
 if(t.dataset.font){const f=Math.max(16,Math.min(26,readerFont()+Number(t.dataset.font)*2));try{localStorage.setItem('okumino-yazi',f)}catch{};screen.querySelector('.reading').style.setProperty('--fs',f+'px');return}
 if(t.hasAttribute('data-listen')){speak(t);return}
 if(t.dataset.page!==undefined){
   const i=Number(t.dataset.page),pages=readerBooks[b.id];
   Journal.record(b.id,'page','p'+i,pages[i][0]||('Sayfa '+(i+1)));
   window.speechSynthesis?.cancel();
   location.hash=i===pages.length-1?'tamam/'+b.id:'oku/'+b.id+'/'+(i+1);return;
 }
 if(t.dataset.qanswer){
   const i=Number(t.dataset.q);
   if(t.dataset.qanswer==='3'){Journal.record(b.id,'task','soru-'+i,'Hikâye sorusu · '+b.stops[i][0]);location.hash='etkinlikler/'+b.id+'/bitti'}
   else{screen.querySelector('.status').textContent='Bir kez daha düşün. İpucu yukarıdaki paragrafta.';t.disabled=true}
   return;
 }
 if(t.hasAttribute('data-skip')){
   const stop=Number(index);
   if(stop<done){location.hash=path;return}
   state.steps[b.id]=n+1;
   save();
   if(n%2===1){Journal.record(b.id,'task','soru-'+stop,'Hikâye sorusu · '+b.stops[stop][0]);location.hash='sonuc/'+b.id}else{render();screen.focus()}
   return;
 }
 if(t.hasAttribute('data-read')){state.steps[b.id]=n+1;save();render();screen.focus();return}
 if(t.dataset.answer){if(t.dataset.answer==='3'){state.steps[b.id]=n+1;save();Journal.record(b.id,'task','soru-'+Number(index),'Hikâye sorusu · '+b.stops[Number(index)][0]);location.hash='sonuc/'+b.id}else{screen.querySelector('.status').textContent='Bir kez daha düşün. '+b.stops[Number(index)][1];t.disabled=true}}
 };
}
// Sayfayı Türkçe sesle okur (tarayıcının kendi sesi); tekrar basınca susar.
function speak(button){
 if(!('speechSynthesis' in window))return toast('Bu cihazda sesli okuma yok.');
 if(speechSynthesis.speaking){speechSynthesis.cancel();button.textContent='🔊 Dinle';return}
 const u=new SpeechSynthesisUtterance(screen.querySelector('.page-text').innerText);u.lang='tr-TR';u.rate=.9;
 u.onend=()=>{button.textContent='🔊 Dinle'};button.textContent='⏸ Durdur';speechSynthesis.speak(u);
}
window.addEventListener('hashchange',()=>{window.speechSynthesis?.cancel();render();window.scrollTo(0,0);screen.focus({preventScroll:true})});
render();
Notify.autoplay();
