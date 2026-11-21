// Günlük bildirim simülasyonu. Gerçek uygulamada bunlar telefonun bildirimleri olur;
// burada ekranın üstünden kayan bir afiş ve uygulama içi bir bildirim kutusu.
// Kurallar: günde en çok iki hatırlatma, hiç azarlama yok, her bildirim tek dokunuşla
// çocuğu doğrudan okuyacağı sayfaya götürür.
const Notify = (() => {
  const KEY = 'okumino-bildirimler';
  const list = () => { try { return JSON.parse(localStorage.getItem(KEY)) || []; } catch { return []; } };
  const store = items => { try { localStorage.setItem(KEY, JSON.stringify(items.slice(0, 20))); } catch {} };
  const unread = () => list().filter(n => !n.read).length;

  function currentBook() {
    let id = 'pinokyo';
    try { id = JSON.parse(localStorage.getItem('okumino-mobil-v1'))?.selected || id; } catch {}
    const last = Journal.entries().find(e => e.type === 'page');
    if (last) id = last.book;
    return books.find(b => b.id === id) || books[0];
  }
  // Zaman dilimine ve öğrencinin durumuna göre tek bir mesaj seçer.
  function compose(slot) {
    const s = Journal.summary(), b = currentBook(), page = Journal.bookmark(b.id);
    const left = Math.max(0, s.goal - s.todayDrops);
    const read = '#oku/' + b.id + '/' + page;
    const badge = badgeList(s, appSteps()).filter(x => !x.on && x.need - x.have <= 2).sort((x, y) => (x.need - x.have) - (y.need - y.have))[0];
    if (slot === 'sabah') return {icon: '🌱', title: 'Günaydın! Fidanın uyandı', body: `Bugün ${s.goal} damla istiyor. Okula gitmeden tek sayfa bile yeter.`, link: read};
    if (slot === 'okul') return {icon: '🦊', title: 'Mino seni bekliyor', body: `${b.name}, ${page + 1}. sayfada kaldın. 5 dakikalık bir okuma molası?`, link: read};
    if (slot === 'aksam') {
      if (!left) return {icon: '🌳', title: 'Bugünün hedefi tamam!', body: `Fidanın bugün ${s.todayDrops} damla içti. Yarın görüşürüz.`, link: '#profil'};
      if (s.streak) return {icon: '🔥', title: `${s.streak} günlük serin devam etsin`, body: `Bugün ${left} damla daha. Bir sayfa = bir damla.`, link: read};
      return {icon: '💧', title: 'Fidanın biraz susadı', body: 'Bir sayfa okursan bir damla alır. Yarın yeniden başlamak da olur.', link: read};
    }
    if (slot === 'rozet') return badge
      ? {icon: badge.icon, title: `${badge.title} rozetine çok az kaldı`, body: `${badge.hint}. ${badge.need - badge.have} adım kaldı.`, link: '#profil'}
      : {icon: '🏅', title: 'Yeni bir rozet seni bekliyor', body: 'Profilinde hangi rozete yakın olduğunu gör.', link: '#profil'};
    if (slot === 'durak') {
      const steps = appSteps()[b.id] || 0;
      return {icon: '🗺️', title: `${b.name} patikasında yeni durak`, body: steps >= 2 ? 'İkinci durak açıldı. Mino haritada seni bekliyor.' : 'İlk durağın hazır. Damganı kazanmaya ne dersin?', link: '#patika/' + b.id};
    }
    return compose('okul');
  }
  const SLOT_TIMES = {sabah: '07:45', okul: '16:30', aksam: '19:30', rozet: '18:00', durak: '17:15'};
  function push(slot) {
    const n = {...compose(slot), slot, time: SLOT_TIMES[slot] || new Date().toLocaleTimeString('tr-TR', {hour: '2-digit', minute: '2-digit'}), id: Date.now(), read: false};
    store([n, ...list()]);
    banner(n);
    paintBell();
  }
  let timer;
  function banner(n) {
    let el = document.querySelector('.push');
    if (!el) { el = document.createElement('a'); el.className = 'push'; document.body.append(el); }
    el.href = n.link;
    el.innerHTML = `<img src="assets/okumino_ikon.png" alt=""><span><small>OKUMINO · ${n.time}</small><b>${n.icon} ${n.title}</b><span>${n.body}</span></span>`;
    el.onclick = () => markRead(n.id);
    el.classList.remove('show'); void el.offsetWidth; el.classList.add('show');
    clearTimeout(timer); timer = setTimeout(() => el.classList.remove('show'), 6500);
  }
  function markRead(id) { store(list().map(n => id === undefined || n.id === id ? {...n, read: true} : n)); paintBell(); }
  function paintBell() {
    const b = document.querySelector('.bell');
    if (!b) return;
    const u = unread();
    b.querySelector('i').textContent = u || '';
    b.querySelector('i').hidden = !u;
    b.setAttribute('aria-label', u ? `Bildirimler, ${u} okunmamış` : 'Bildirimler');
  }
  function center() {
    const items = list();
    markRead();
    return `<h1>Bildirimler</h1><p class="muted">Okumino günde en çok iki kez hatırlatır. Saatleri velin ayarlar.</p>
    ${items.length ? `<div class="notes">${items.map(n => `<a class="note ${n.read ? '' : 'new'}" href="${n.link}"><span class="note-icon">${n.icon}</span><span><b>${n.title}</b><small>${n.body}</small></span><time>${n.time}</time></a>`).join('')}</div>` : '<div class="panel center"><span class="big-emoji">🔔</span><p>Henüz bildirim yok. Fidanın seni çağırınca burada görünecek.</p></div>'}
    <div class="panel schedule"><h2>Bildirim saatlerim</h2>${[['sabah', 'Sabah', '07:45'], ['okul', 'Okul sonrası', '16:30'], ['aksam', 'Akşam', '19:30']].map(([k, l, t]) => `<div class="sched"><span><b>${l}</b><small>${t}</small></span><button type="button" data-try="${k}">Şimdi dene</button></div>`).join('')}</div>`;
  }
  // Cihaz önizlemesinin dışındaki panel bu çerçeveye mesaj gönderir.
  addEventListener('message', e => {
    const d = e.data || {};
    if (d.type !== 'okumino') return;
    if (d.notify) push(d.notify);
    if (d.demo === 'seed') {
      Journal.seed(); load();
      // Hazır veri kutlama yağmuruna dönmesin: son görüleni yeni duruma eşitle.
      const s = Journal.summary();
      try { localStorage.setItem('okumino-son-gorulen', JSON.stringify({drops: s.drops, level: s.level, badges: badgeList(s, appSteps()).filter(b => b.on).map(b => b.title)})); } catch {}
      location.hash = '#oda'; dispatchEvent(new HashChangeEvent('hashchange')); }
    if (d.demo === 'reset') { Journal.reset(); location.hash = '#oda'; location.reload(); }
  });
  // Uygulama açıldıktan birkaç saniye sonra günün bağlamına uyan tek bir bildirim.
  function autoplay() {
    try { if (sessionStorage.getItem('okumino-oto-bildirim')) return; sessionStorage.setItem('okumino-oto-bildirim', '1'); } catch {}
    const h = new Date().getHours();
    setTimeout(() => push(h < 12 ? 'sabah' : h < 18 ? 'okul' : 'aksam'), 3500);
  }
  return {push, center, paintBell, autoplay, unread};
})();
