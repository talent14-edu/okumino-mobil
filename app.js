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
const screen=document.querySelector('main'), nav=document.querySelector('nav');
let state={selected:'pinokyo',steps:{}}, filter='Tümü';
try{const saved=JSON.parse(localStorage.getItem('okumino-mobil-v1'));if(saved?.steps && books.some(b=>b.id===saved.selected))state=saved}catch{}
function save(){try{localStorage.setItem('okumino-mobil-v1',JSON.stringify(state))}catch{}}
const count=b=>Math.min(4,Math.max(0,Number(state.steps[b.id])||0));
const asset=id=>'assets/'+id+'.webp';
const btn=(url,label,cls='cta primary')=>`<a class="${cls}" href="#${url}">${label}</a>`;
const back=(url,label)=>btn(url,'‹ &nbsp;'+label,'back');
const icons={oda:'<path d="M3 10l9-7 9 7v11h-6v-7H9v7H3z"/>',raf:'<path d="M3 5h4v15H3zm7-1h4v16h-4zm6 2 3-1 3 14-3 1z"/>',patika:'<circle cx="6" cy="19" r="2"/><circle cx="18" cy="4" r="2"/><path d="M6 17c0-8 13 0 13-7 0-3-5-2-3-5"/>'};
function cards(list){return list.map(b=>`<a class="book" href="#kitap/${b.id}"><img src="${asset(b.id)}" alt=""><b>${b.name}</b><small>${b.level}</small></a>`).join('')}
function render(){
 const [route='oda',id,index]=location.hash.slice(1).split('/').map(x=>x||undefined);
 const b=books.find(x=>x.id===id)||books.find(x=>x.id===state.selected);
 const n=count(b), done=Math.floor(n/2), path='patika/'+b.id;
 const section=['kitap','raf'].includes(route)?'raf':['patika','durak','sonuc'].includes(route)?'patika':route;
 nav.innerHTML=Object.entries({oda:'Odam',raf:'Kitaplığım',patika:'Patikam'}).map(([key,title])=>`<a href="#${key}" ${key===section?'aria-current="page"':''}><svg aria-hidden="true" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linejoin="round">${icons[key]}</svg>${title}</a>`).join('');
 if(route==='raf'){
 screen.innerHTML=`<h1>Kitaplığım</h1><p>Seviyeni seç, kapağına dokun.</p><div class="filters">${['Tümü','Minik','Kâşif','Usta'].map(x=>`<button class="chip" aria-pressed="${filter===x}" data-filter="${x}">${x}</button>`).join('')}</div><div class="shelf">${cards(books.filter(x=>filter==='Tümü'||x.level===filter))}</div>`;
 }else if(route==='kitap'||route==='patika'){
 if(route==='patika'){state.selected=b.id;save()}
 screen.innerHTML=back('raf','Kitaplık')+`<div class="detail"><img src="${asset(b.id)}" alt=""><div><small class="eyebrow">${b.level} · ${b.total} durak</small><h1>${b.name}</h1><b>${b.author}</b><p>${b.desc}</p></div></div>`+(route==='kitap'?`<div class="panel"><h2>Bu kitabın patikası</h2><p>${b.id==="pinokyo"?"Atölyede Mino ile altı etkinliği tamamla. İlk damganı kazan, ardından ikinci durağa geç.":"İlk iki durağı keşfet. Her durakta kısa bir hikâye oku, bir soruyu çöz ve damganı topla."}</p>${btn(path,n?'Patikama dön':'Patikaya başla')}</div>`:
 `<div class="row"><h2>Kitap patikası</h2><b>${done}/2 damga</b></div><small class="muted">Örnek patika · Kitabın ilk iki durağı</small><div class="map"><div class="map-guide"><img src="pinokyo/assets/mino.webp" alt="Mino"><div><b>Mino ile keşfet</b><p>${done===2?"İki damgan da hazır!":"Bir durağa dokun, hikâyeye katıl."}</p></div></div>${b.stops.map((s,i)=>{const locked=i>done,tag=locked?'div':'a';return `<${tag} class="stop ${locked?'locked':''}" ${locked?'':`href="#durak/${b.id}/${i}"`}><span class="num">${i<done?'✓':i+1}</span><span><small>${i+1}. DURAK · ${locked?'Önce 1. durağı bitir':i<done?'Tamamlandı · Tekrar oku':'Açık · Devam et'}</small><b>${s[0]}</b>${b.id==="pinokyo" && i===0?'<span class="mini-icons"><img src="pinokyo/assets/icons/light_bulb.png" alt=""><img src="pinokyo/assets/icons/books.png" alt=""><img src="pinokyo/assets/icons/clapper.png" alt="">6 etkinlik</span>':""}</span></${tag}>`}).join('')}</div>${done===2?btn('pasaport','Damgalarımı gör'):''}`);
 }else if(route==='durak'){
 const i=Number(index);if(![0,1].includes(i)||i>done){location.replace('#'+path);return}
 if(b.id==='pinokyo' && i===0){location.replace('pinokyo/index.html');return}
 const s=b.stops[i],quiz=n===i*2+1;
 screen.innerHTML=`<div class="activity-tools">${back(path,'Kitap patikası')}<button type="button" data-skip>Demoyu geç</button></div><article class="panel"><small class="eyebrow">${b.name} · ${i+1}. durak · ${quiz?'2/2':'1/2'}</small><div class="track"><i style="width:${quiz?100:50}%"></i></div><h2>${quiz?'Hikâyeyi hatırla':s[0]}</h2><img class="scene" src="${asset(b.id+'-'+(i+1))}" alt=""><p>${quiz?s[2]:s[1]}</p>${quiz?`<div class="options">${(i===0?[4,3]:[3,4]).map(k=>`<button data-answer="${k}">${s[k]}</button>`).join('')}</div><p class="status" role="status"></p>`:i<done?btn(path,'Patikaya dön'):'<button class="cta primary" data-read>Soruya geç</button>'}</article>`;
 }else if(route==='sonuc'){
 screen.innerHTML=`<div class="panel"><small class="eyebrow">Okuma pasaportu</small><h1>Damgan hazır!</h1><div class="stamp">✦ &nbsp; ${b.name} · ${done}. durak</div><p>${done===1?'İkinci durağın açıldı.':'Bu kitabın iki örnek durağını tamamladın.'}</p>${btn(path,'Patikayı gör')}</div>`;
 }else if(route==='pasaport'){
 const stamps=books.flatMap(x=>x.stops.slice(0,Math.floor(count(x)/2)).map((s,i)=>`<div class="stamp">✦ &nbsp; ${x.name} · ${i+1}. durak<br><small>${s[0]}</small></div>`));screen.innerHTML=`<h1>Pasaportum</h1><p>${stamps.length?'Tamamladığın duraklardan damgaların.':'İlk durağını tamamladığında damgan burada görünecek.'}</p>${stamps.join('')}${btn(path,'Patikama git')}`;
 }else{
 screen.innerHTML=`<section class="hero"><div><small>OKUMA ODAM</small><h1>Bir kitap seç.<br>Macera başlasın!</h1>${btn('raf','Raftan kitap seç','cta')}</div></section><div class="row"><h2>Kitap patikam</h2></div><div class="pathcard"><img src="${asset(b.id)}" alt=""><div><small class="eyebrow">${b.level} · ${b.total} durak</small><h3>${b.name}</h3><small>${done===2?'Örnek patika tamamlandı':b.stops[done][0]}</small></div>${btn(path,'Patikayı aç')}</div><div class="row"><h2>Kitap rafım</h2>${btn('raf','Tümünü gör','link')}</div><div class="shelf preview">${cards(books)}</div>`;
 }
 screen.onclick=e=>{const t=e.target.closest('button');if(!t)return;
 if(t.dataset.filter){filter=t.dataset.filter;render();screen.querySelector('[aria-pressed=true]').focus();return}
 if(t.hasAttribute('data-skip')){
   const stop=Number(index);
   if(stop<done){location.hash=path;return}
   state.steps[b.id]=n+1;
   save();
   if(n%2===1){location.hash='sonuc/'+b.id}else{render();screen.focus()}
   return;
 }
 if(t.hasAttribute('data-read')){state.steps[b.id]=n+1;save();render();screen.focus();return}
 if(t.dataset.answer){if(t.dataset.answer==='3'){state.steps[b.id]=n+1;save();location.hash='sonuc/'+b.id}else{screen.querySelector('.status').textContent='Bir kez daha düşün. '+b.stops[Number(index)][1];t.disabled=true}}
 };
}
window.addEventListener('hashchange',()=>{render();window.scrollTo(0,0);screen.focus({preventScroll:true})});render();
