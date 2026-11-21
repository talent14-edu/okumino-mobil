const devices = {telefon:[390,844],tablet:[1024,768]};
const device = document.querySelector('.device');
const frame = document.querySelector('iframe');
const stage = document.querySelector('.stage');
let selected = new URLSearchParams(location.search).get('cihaz') === 'tablet' ? 'tablet' : 'telefon';
function layout(){
  const [w,h] = devices[selected];
  const edge = selected === 'tablet' ? 36 : 28;
  const width = w + edge, height = h + edge;
  const room = innerHeight - document.querySelector('header').offsetHeight - 24;
  const scale = Math.min(1,(document.documentElement.clientWidth-16)/width,Math.max(room,250)/height);
  stage.style.width = width*scale+'px';
  stage.style.height = height*scale+'px';
  device.classList.toggle('tablet',selected==='tablet');
  device.style.transform = 'scale('+scale+')';
  frame.style.width=w+'px';
  frame.style.height=h+'px';
  document.querySelector('output').textContent=w+' × '+h;
  for(const button of document.querySelectorAll('[data-device]')) button.setAttribute('aria-pressed',String(button.dataset.device===selected));
}
for(const button of document.querySelectorAll('[data-device]')) button.onclick=()=>{
  selected=button.dataset.device;
  const url=new URL(location.href); url.searchParams.set('cihaz',selected); history.replaceState(null,'',url);
  layout();
};
frame.src='oda.html'+location.hash;
window.addEventListener('resize',layout);
layout();
// Bildirim ve demo düğmeleri telefondaki uygulamaya mesaj gönderir.
for(const b of document.querySelectorAll('[data-notify],[data-demo]')) b.onclick=()=>{
  if(b.dataset.demo==='reset' && !confirm('Bu tarayıcıdaki Okumino ilerlemesi silinsin mi?')) return;
  frame.contentWindow.postMessage({type:'okumino',notify:b.dataset.notify,demo:b.dataset.demo},'*');
};
