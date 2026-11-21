// Ekran parçaları: kendi hızında okuma, serbest etkinlikler, profil, fidan, rozetler.
const workshopLabels = ['Hayal et', 'Kelime sandığı', 'Hikâye zamanı', 'Dedektif Mino', 'Ses stüdyosu', 'Filmini kur'];
const workshopIcons = ['light_bulb', 'books', 'open_book', 'magnifier', 'microphone', 'clapper'];

function readerLink(b) { return 'oku/' + b.id + '/' + Journal.bookmark(b.id); }
function bookPagesRead(id) { return Journal.entries().filter(e => e.book === id && e.type === 'page').length; }

// Fidan: tek bir SVG, damla sayısıyla sürekli büyür. Aşama adı yalnız etiket;
// çocuk her sayfada gövdenin uzadığını ya da yeni bir yaprak çıktığını görür.
function plantSVG(sum, size = 'big') {
  const d = sum.drops, L = sum.level;
  const g = Math.min(1, d / 60);
  const stemTop = 168 - (L === 0 ? 0 : 22 + g * 104);
  const leaves = [];
  if (L >= 1) {
    const n = Math.min(8, 2 + Math.floor(d / 2));
    for (let i = 0; i < n; i++) {
      const y = 166 - (i + 1) * ((166 - stemTop) / (n + 1));
      const dir = i % 2 ? -1 : 1, s = 0.75 + (i / n) * 0.35;
      leaves.push(`<path class="leaf" style="--i:${i}" d="M100 ${y}c${dir * 10 * s} ${-14 * s} ${dir * 30 * s} ${-14 * s} ${dir * 34 * s} ${-4 * s}c${-dir * 8 * s} ${12 * s} ${-dir * 24 * s} ${14 * s} ${-dir * 34 * s} ${4 * s}z"/>`);
    }
  }
  let crown = '';
  if (L >= 3) {
    const r = 26 + Math.min(1, (d - 22) / 38) * 26;
    crown = `<g class="crown"><circle cx="100" cy="${stemTop}" r="${r}"/><circle cx="${100 - r * .7}" cy="${stemTop + r * .35}" r="${r * .62}"/><circle cx="${100 + r * .7}" cy="${stemTop + r * .35}" r="${r * .62}"/><circle cx="100" cy="${stemTop - r * .45}" r="${r * .6}"/></g>`;
    if (L >= 4) crown += [[-.45, -.1], [.4, .05], [0, -.55], [-.15, .3], [.55, -.35]].slice(0, L === 5 ? 5 : 2).map(([x, y], i) => `<circle class="${L === 5 ? 'fruit' : 'bloom'}" style="--i:${i}" cx="${100 + x * r}" cy="${stemTop + y * r}" r="${L === 5 ? 6 : 4.5}"/>`).join('');
  }
  const trunk = L >= 3 ? 7 : 3.5;
  return `<svg class="plant-svg ${size}" viewBox="0 0 200 230" role="img" aria-label="Okuma fidanı: ${sum.stage.name}, ${d} damla">
    <ellipse class="shadow" cx="100" cy="222" rx="58" ry="6"/>
    ${L === 0 ? '<ellipse class="seed" cx="100" cy="166" rx="9" ry="6"/><path class="sprout" d="M100 161c0-6 3-9 7-10"/>' : `<path class="stem" stroke-width="${trunk}" d="M100 170C${L >= 3 ? 98 : 96} ${(170 + stemTop) / 2} ${L >= 3 ? 102 : 104} ${(170 + stemTop) / 2 - 10} 100 ${stemTop}"/>`}
    ${leaves.join('')}${crown}
    <path class="soil" d="M52 168q48-12 96 0v6H52z"/>
    <path class="pot" d="M46 172h108l-12 50H58z"/><path class="pot-rim" d="M42 166h116v12H42z"/>
  </svg>`;
}

function badgeList(sum, steps) {
  const finished = books.filter(b => bookPagesRead(b.id) >= readerBooks[b.id].length).length;
  const stamps = books.reduce((n, b) => n + Math.floor(Math.min(4, Number(steps[b.id]) || 0) / 2), 0);
  return [
    {icon: '💧', title: 'İlk damla', have: sum.pages, need: 1, hint: 'İlk sayfanı oku'},
    {icon: '📖', title: 'Sayfa dostu', have: sum.pages, need: 10, hint: '10 sayfa oku'},
    {icon: '🔎', title: 'Meraklı kâşif', have: sum.tasks, need: 1, hint: 'Bir etkinlik bitir'},
    {icon: '🧩', title: 'Etkinlik ustası', have: sum.tasks, need: 6, hint: '6 etkinlik bitir'},
    {icon: '🏅', title: 'Patika damgası', have: stamps, need: 1, hint: 'Bir patika durağı bitir'},
    {icon: '🐛', title: 'Kitap kurdu', have: finished, need: 1, hint: 'Bir kitabı sonuna kadar oku'},
    {icon: '🔥', title: '3 gün seri', have: sum.streak, need: 3, hint: '3 gün üst üste oku'},
    {icon: '🌳', title: 'Bahçıvan', have: sum.streak, need: 7, hint: '7 gün üst üste oku'},
    {icon: '🧭', title: 'Raf gezgini', have: sum.books, need: 4, hint: '4 farklı kitaptan oku'}
  ].map(b => ({...b, on: b.have >= b.need}));
}

// Ana odadaki "Bugün" kartı: fidan, günlük hedef, kaldığın yer — tek bakışta.
function todayCard(sum, b) {
  const left = Math.max(0, sum.goal - sum.todayDrops);
  const pct = Math.min(1, sum.todayDrops / sum.goal);
  return `<section class="today"><a class="today-plant" href="#profil" aria-label="Fidanımı gör">${plantSVG(sum, 'mini')}</a>
  <div class="today-body"><small class="eyebrow">BUGÜN</small><h2>${left ? 'Fidanın ' + left + ' damla bekliyor' : 'Bugünün hedefi tamam!'}</h2>
  <div class="drops" aria-label="Bugün ${sum.todayDrops} / ${sum.goal} damla">${Array.from({length: sum.goal}, (_, i) => `<i class="${i < sum.todayDrops ? 'full' : ''}"></i>`).join('')}<span>${sum.streak ? '🔥 ' + sum.streak + ' gün seri' : 'Seriye bugün başla'}</span></div>
  <p class="muted">Bir sayfa = 1 damla · Bir etkinlik = 2 damla</p>
  ${btn(readerLink(b), Journal.bookmark(b.id) ? b.name + ' · Kaldığın yerden' : b.name + ' · Okumaya başla')}</div><div class="ring" style="--p:${pct}" aria-hidden="true"><b>${sum.todayDrops}/${sum.goal}</b></div></section>`;
}

function bookModes(b, n) {
  const length = readerBooks[b.id].length, read = bookPagesRead(b.id);
  const tasks = Journal.entries().filter(e => e.book === b.id && e.type === 'task').length;
  return `<div class="mode-grid">
  <section class="mode solo"><span class="mode-icon" aria-hidden="true">📖</span><small class="eyebrow">KENDİ HIZIMDA</small><h2>Kitabı oku</h2><p>${length} sayfa${b.id === 'pinokyo' ? '' : ' · örnek bölüm'}. Her sayfa fidanına 1 damla.</p><div class="minibar"><i style="width:${read / length * 100}%"></i></div><small class="muted">${read}/${length} sayfa okundu</small>${btn(readerLink(b), Journal.bookmark(b.id) ? 'Kaldığın yerden' : 'Okumaya başla')}</section>
  <section class="mode solo"><span class="mode-icon" aria-hidden="true">🧩</span><small class="eyebrow">İSTEDİĞİM SIRAYLA</small><h2>Etkinlik seç</h2><p>Sırayı sen seç. Her etkinlik 2 damla.</p><small class="muted">${tasks} etkinlik tamamlandı</small>${btn('etkinlikler/' + b.id, 'Etkinliklere bak', 'cta')}</section>
  <section class="mode path"><img src="pinokyo/assets/mino.webp" alt="" class="mode-mino"><small class="eyebrow">MİNO İLE</small><h2>Patikayı izle</h2><p>Durakları sırayla geç, her durakta pasaportuna damga kazan.</p>${btn('patika/' + b.id, n ? 'Patikama dön' : 'Patikaya başla')}</section></div>`;
}

function reader(b, index) {
  const pages = readerBooks[b.id], i = Math.min(pages.length - 1, Math.max(0, Number(index) || 0));
  const [title, paras, img] = pages[i];
  Journal.bookmark(b.id, i);
  const done = Journal.has(b.id, 'page', 'p' + i);
  const font = readerFont();
  return `<div class="reader-top">${back('kitap/' + b.id, b.name)}<div class="reader-tools"><button type="button" data-font="-1" aria-label="Yazıyı küçült">A−</button><button type="button" data-font="1" aria-label="Yazıyı büyüt">A+</button><button type="button" data-listen aria-label="Sayfayı dinle">🔊 Dinle</button></div></div>
  <article class="panel reading ${img ? 'has-img' : ''}" style="--fs:${font}px"><div class="page-meta"><small class="eyebrow">SAYFA ${i + 1} / ${pages.length}</small>${done ? '<span class="got">💧 alındı</span>' : '<span class="todo">+1 💧</span>'}</div>
  <div class="page-dots" aria-hidden="true">${pages.map((_, k) => `<i class="${Journal.has(b.id, 'page', 'p' + k) ? 'read' : ''} ${k === i ? 'here' : ''}"></i>`).join('')}</div>
  ${img ? `<img class="scene" src="${asset(img)}" alt="">` : ''}<div class="page-text"><h1>${title || b.name}</h1>${paras.map(p => '<p>' + p + '</p>').join('')}</div>
  <div class="actions">${i ? btn('oku/' + b.id + '/' + (i - 1), '‹ Önceki', 'back') : ''}<button class="cta primary" data-page="${i}">${i === pages.length - 1 ? 'Okudum, kitabı bitir' : 'Okudum, sayfayı çevir ›'}</button></div></article>`;
}
function readerFont() { try { return Number(localStorage.getItem('okumino-yazi')) || 19; } catch { return 19; } }

function finishedBook(b) {
  const read = bookPagesRead(b.id), length = readerBooks[b.id].length;
  return `<div class="panel center"><span class="big-emoji" aria-hidden="true">🎉</span><small class="eyebrow">${b.name}</small><h1>${read >= length ? 'Son sayfaya geldin!' : 'Bölümün sonu'}</h1><p>${read}/${length} sayfa okudun.${read < length ? ' Atladığın sayfalar fidanını bekliyor.' : ' Fidanın bu kitapla ' + length + ' damla içti.'}</p><div class="actions center">${btn('etkinlikler/' + b.id, 'Etkinlik seç')}${btn('profil', 'Fidanımı gör', 'cta')}</div></div>`;
}

function activityMenu(b, justDone) {
  const done = id => Journal.has(b.id, 'task', id);
  const workshop = b.id === 'pinokyo' ? workshopLabels.map((name, i) => `<a class="task ${done('atolye-' + i) ? 'done' : ''}" href="pinokyo/index.html?serbest=${i}"><img src="pinokyo/assets/icons/${workshopIcons[i]}.png" alt=""><span><b>${name}</b><small>Atölye · ${done('atolye-' + i) ? 'Tamamlandı' : '+2 💧'}</small></span></a>`).join('') : '';
  const questions = b.stops.map((s, i) => `<a class="task ${done('soru-' + i) ? 'done' : ''}" href="#soru/${b.id}/${i}"><img src="pinokyo/assets/icons/thinking.png" alt=""><span><b>${s[0]}</b><small>Hikâye sorusu · ${done('soru-' + i) ? 'Tamamlandı' : '+2 💧'}</small></span></a>`).join('');
  return back('kitap/' + b.id, b.name) + `${justDone ? '<p class="banner-ok" role="status">Etkinlik tamam! Fidanına 2 damla gitti 💧💧</p>' : ''}<h1>Etkinlik seç</h1><p>${b.name} · İstediğinden başla, sıra yok.</p><div class="tasks">${workshop}${questions}</div>`;
}

function question(b, i) {
  const s = b.stops[i];
  if (!s) return '';
  const done = Journal.has(b.id, 'task', 'soru-' + i);
  return back('etkinlikler/' + b.id, 'Etkinlikler') + `<article class="panel"><small class="eyebrow">${b.name} · Hikâye sorusu</small><h2>${s[0]}</h2><img class="scene" src="${asset(b.id + '-' + (i + 1))}" alt=""><p>${s[1]}</p><h3>${s[2]}</h3><div class="options">${(i === 0 ? [4, 3] : [3, 4]).map(k => `<button data-qanswer="${k}" data-q="${i}">${s[k]}</button>`).join('')}</div><p class="status" role="status">${done ? 'Bu soruyu daha önce çözdün.' : ''}</p></article>`;
}

function weekChart(sum) {
  // Çubuklar piksel yüksekliğiyle: yüzdeyle çizilince en uzun çubuk gün etiketini aşağı itiyordu.
  const H = 104, max = Math.max(sum.goal, ...sum.week.map(w => w.drops));
  const days = ['Paz', 'Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt'];
  return `<div class="week" role="img" aria-label="Son 7 günün damlaları: ${sum.week.map(w => w.drops).join(', ')}">${sum.week.map((w, k) => `<div class="day ${k === 6 ? 'today-col' : ''}"><span class="val">${w.drops || ''}</span><i style="height:${Math.max(3, w.drops / max * H)}px" class="${w.drops >= sum.goal ? 'hit' : ''}"></i><small>${k === 6 ? 'Bugün' : days[w.date.getDay()]}</small></div>`).join('')}<div class="goal-line" style="bottom:${30 + sum.goal / max * H}px"><span>hedef</span></div></div>`;
}
function profile(steps) {
  const sum = Journal.summary();
  const badges = badgeList(sum, steps);
  const earned = badges.filter(b => b.on).length;
  const stat = (v, l) => `<div class="stat"><b>${v}</b><small>${l}</small></div>`;
  return `<h1>Profilim</h1>
  <section class="garden"><div class="garden-plant">${plantSVG(sum)}</div><div class="garden-info"><small class="eyebrow">OKUMA FİDANIM</small><h2>${sum.stage.name}</h2>
  <div class="stage-track" aria-hidden="true">${sum.stages.map((s, i) => `<i class="${i <= sum.level ? 'on' : ''}" title="${s.name}"></i>`).join('')}</div>
  <p>${sum.next ? `<b>${sum.next.name}</b> olmasına <b>${sum.next.at - sum.drops} damla</b> kaldı.` : 'Fidanın meyve verdi! Okudukça yeni meyveler gelecek.'}</p>
  <div class="minibar"><i style="width:${sum.progress * 100}%"></i></div><small class="muted">Toplam ${sum.drops} damla</small></div></section>
  <div class="stats">${stat(sum.pages, 'sayfa')}${stat(sum.tasks, 'etkinlik')}${stat(sum.streak, 'gün seri')}${stat(sum.minutes, 'dakika')}</div>
  <div class="row"><h2>Bu hafta</h2><small class="muted">Günlük hedef ${sum.goal} damla</small></div>${weekChart(sum)}
  <div class="row"><h2>Rozetlerim</h2><small class="muted">${earned}/${badges.length}</small></div>
  <div class="badges">${badges.map(b => `<div class="badge ${b.on ? 'earned' : ''}"><span aria-hidden="true">${b.icon}</span><b>${b.title}</b>${b.on ? '<small>Kazanıldı</small>' : `<small>${b.hint}</small><div class="minibar"><i style="width:${Math.min(1, b.have / b.need) * 100}%"></i></div>`}</div>`).join('')}</div>
  <div class="row"><h2>Kitaplarım</h2>${btn('pasaport', 'Pasaportum', 'link')}</div>
  <div class="book-progress">${books.map(b => { const r = bookPagesRead(b.id), t = readerBooks[b.id].length, p = sum.perBook[b.id]; return `<a href="#kitap/${b.id}" class="bp"><img src="${asset(b.id)}" alt=""><span><b>${b.name}</b><small>${r}/${t} sayfa · ${p ? p.tasks : 0} etkinlik</small><div class="minibar"><i style="width:${r / t * 100}%"></i></div></span></a>`; }).join('')}</div>
  <div class="row"><h2>Okuma günlüğüm</h2></div>
  ${sum.list.length ? `<ol class="log">${sum.list.slice(0, 12).map(e => `<li><span class="log-dot">${e.type === 'page' ? '💧' : '🧩'}</span><span><b>${e.title}</b><small>${(books.find(b => b.id === e.book) || {}).name || ''} · ${new Date(e.time).toLocaleDateString('tr-TR', {weekday: 'long', day: 'numeric', month: 'long'})}</small></span></li>`).join('')}</ol>` : '<p class="muted">Okuduğun ilk sayfa ya da bitirdiğin ilk etkinlik burada görünecek.</p>'}`;
}
