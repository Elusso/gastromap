// GastroMap ULTIMATE — Full Logic
// Beige Design + FontAwesome + Leaflet + Swiper + AOS
'use strict';

const GM = {
  restos: [],
  trans: {},
  lang: localStorage.getItem('gm-lang') || 'sk',
  map: null,
  markers: [],
  swiper: null,
  currentResto: null
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadAll();
  GM.lang = localStorage.getItem('gm-lang') || 'sk';
  applyLang();
  initMap();
  renderList();
  renderCuisineFilter();
  renderPromos();
  renderNews();
  renderProfile();
  initDetailTabs();
  initViewToggle();
  initNav();
  initSheets();
  AOS.init({ duration: 600, once: true, offset: 30 });
  runAutoDiag();
});

// ==================== DATA ====================
async function loadAll() {
  try {
    const [rR, tR] = await Promise.all([
      fetch('data/restaurants.json'),
      fetch('data/translations.json')
    ]);
    const rData = await rR.json();
    GM.restos = (rData.restaurants || []).map(r => ({
      ...r,
      photos: r.photos?.length ? r.photos : gmMock.getPhotos(r.id, 4)
    }));
    GM.trans = await tR.json();
  } catch(e) {
    console.error('Load fail:', e);
    // Fallback: generate photos anyway
    if (GM.restos.length > 0) {
      GM.restos.forEach(r => {
        if (!r.photos || !r.photos.length) r.photos = gmMock.getPhotos(r.id, 4);
      });
    }
  }
}

// ==================== TRANSLATION ====================
function gt(key) {
  let v = GM.trans[GM.lang];
  for (const p of key.split('.')) {
    if (v == null) break;
    v = v[p];
  }
  return v ?? key;
}

function gName(r) {
  const suff = GM.lang === 'sk' ? '_sk' : GM.lang === 'ru' ? '_ru' : '_en';
  const key = 'name' + suff;
  return r[key] || r.name || r.id;
}

function applyLang() {
  document.querySelectorAll('.lang-btn').forEach(b =>
    b.classList.toggle('active', b.dataset.lang === GM.lang));
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const v = gt(el.dataset.i18n);
    if (v) el.textContent = v;
  });
}

document.querySelectorAll('.lang-btn').forEach(b => {
  b.addEventListener('click', () => {
    GM.lang = b.dataset.lang;
    localStorage.setItem('gm-lang', GM.lang);
    applyLang();
    renderList();
    renderPromos();
    renderNews();
    renderProfile();
  });
});

// ==================== NAVIGATION ====================
function initNav() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => switchTab(btn.dataset.tab));
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-page').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-page').forEach(s => s.classList.remove('active'));
  const tgt = document.getElementById(tab + '-tab');
  if (tgt) { tgt.classList.remove('hidden'); tgt.classList.add('active'); }
  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  const navBtn = document.querySelector(`.nav-item[data-tab="${tab}"]`);
  if (navBtn) navBtn.classList.add('active');
  if (tab === 'explore' && GM.map) setTimeout(() => GM.map.invalidateSize(), 150);
}

window.switchTab = switchTab;

// ==================== MAP ====================
function initMap() {
  GM.map = L.map('map', {
    center: [48.1486, 17.1077],
    zoom: 14,
    zoomControl: false
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(GM.map);
  L.control.zoom({ position: 'topright' }).addTo(GM.map);

  GM.restos.forEach(r => {
    const icon = L.divIcon({
      className: 'gm-marker',
      html: `<div style="
        width:42px;height:42px;border-radius:50%;
        background:var(--accent,#C17B4E);color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:15px;box-shadow:0 3px 12px rgba(0,0,0,0.25);
        border:3px solid #fff;
      ">${gName(r).charAt(0)}</div>`,
      iconSize: [42, 42],
      iconAnchor: [21, 42]
    });
    const m = L.marker([r.lat, r.lon], { icon }).addTo(GM.map);
    m.on('click', () => openDetail(r));
    GM.markers.push({ marker: m, resto: r });
  });
}

// ==================== VIEW TOGGLE ====================
function initViewToggle() {
  const mb = document.getElementById('map-btn');
  const lb = document.getElementById('list-btn');
  const mc = document.getElementById('map-container');
  const lc = document.getElementById('list-container');
  if (!mb || !lb) return;
  mb.addEventListener('click', () => {
    mb.classList.add('active'); lb.classList.remove('active');
    mc.classList.remove('hidden'); lc.classList.add('hidden');
    setTimeout(() => GM.map?.invalidateSize(), 150);
  });
  lb.addEventListener('click', () => {
    lb.classList.add('active'); mb.classList.remove('active');
    mc.classList.add('hidden'); lc.classList.remove('hidden');
  });
}

// ==================== RESTAURANT LIST ====================
function renderList() {
  const cont = document.getElementById('restaurant-list');
  if (!cont) return;
  cont.innerHTML = GM.restos.map(r => {
    const name = gName(r);
    const photo = r.photos?.[0] || '';
    const stars = '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5 - Math.round(r.rating));
    return `
      <div class="resto-card" data-id="${r.id}" data-aos="fade-up">
        <div class="resto-card-img-wrap">
          ${photo ? `<img src="${photo}" alt="${name}" loading="lazy" onerror="this.parentElement.innerHTML='<div style=\\'background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;height:100%;font-size:24px\\'>${name.charAt(0)}</div>'">` : `<div style="background:var(--accent);color:#fff;display:flex;align-items:center;justify-content:center;height:100%;font-size:24px">${name.charAt(0)}</div>`}
        </div>
        <div class="resto-card-body">
          <h3 class="resto-card-name">${name}</h3>
          <p class="resto-card-cuisine">${(r.cuisine||[]).join(', ')}</p>
          <div class="resto-card-meta">
            <span class="stars-text">${stars}</span>
            <span class="meta-rating">${r.rating}</span>
            <span class="meta-sep">•</span>
            <span class="meta-price">${r.price_range||'$$'}</span>
            <span class="meta-sep">•</span>
            <span class="meta-check">${r.avg_check||''}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  cont.querySelectorAll('.resto-card').forEach(card => {
    card.addEventListener('click', () => {
      const r = GM.restos.find(x => x.id === card.dataset.id);
      if (r) openDetail(r);
    });
  });

  setTimeout(() => AOS.refresh(), 100);
}

function renderCuisineFilter() {
  const cont = document.getElementById('cuisine-filter');
  const cuis = [...new Set(GM.restos.flatMap(r => r.cuisine||[]))].sort();
  cont.innerHTML = `<button class="cuisine-chip active" data-cuisine="all"><i class="fas fa-globe-europe"></i> All</button>` +
    cuis.map(c => `<button class="cuisine-chip" data-cuisine="${c}">${c}</button>`).join('');

  cont.querySelectorAll('.cuisine-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      cont.querySelectorAll('.cuisine-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterByCuisine(chip.dataset.cuisine);
    });
  });
}

function filterByCuisine(cuisine) {
  document.querySelectorAll('.resto-card').forEach(card => {
    const r = GM.restos.find(x => x.id === card.dataset.id);
    const match = cuisine === 'all' || (r?.cuisine||[]).includes(cuisine);
    card.style.display = match ? '' : 'none';
  });
}

// ==================== DETAIL OVERLAY ====================
function openDetail(r) {
  GM.currentResto = r;
  const ol = document.getElementById('detail-overlay');
  ol.classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  document.getElementById('detail-name').textContent = gName(r);
  document.getElementById('detail-address').textContent = r.address || '';
  document.getElementById('meta-stars').textContent = '★'.repeat(Math.round(r.rating)) + '☆'.repeat(5-Math.round(r.rating)) + ' ' + r.rating;
  document.getElementById('meta-price').textContent = r.price_range || '$$';
  document.getElementById('meta-check').textContent = r.avg_check ? 'Ček: ' + r.avg_check : '';
  document.getElementById('detail-route-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}`;

  const tags = document.getElementById('detail-cuisine-tags');
  tags.innerHTML = (r.cuisine||[]).map(c => `<span class="cuisine-tag">${c}</span>`).join('');

  // Carousel
  renderCarousel(r);

  // Tabs
  renderDetailTabs();
  document.querySelectorAll('.dtab').forEach((t,i) => t.classList.toggle('active', i===0));
  document.querySelectorAll('.dtab-panel').forEach((p,i) => p.classList.toggle('active', i===0));
  document.getElementById('res-date').value = new Date().toISOString().split('T')[0];

  setTimeout(() => ol.scrollTop = 0, 50);
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  GM.currentResto = null;
  if (GM.swiper) { GM.swiper.destroy(); GM.swiper = null; }
}
window.openDetail = openDetail;
window.closeDetail = closeDetail;

function renderCarousel(r) {
  const slides = document.getElementById('carousel-slides');
  const photos = r.photos || gmMock.getPhotos(r.id, 4);
  slides.innerHTML = photos.map(p =>
    `<div class="swiper-slide"><img src="${p}" alt="" loading="lazy" onerror="this.style.background='var(--accent)'"></div>`
  ).join('');
  if (GM.swiper) GM.swiper.destroy();
  GM.swiper = new Swiper('#detail-carousel', {
    slidesPerView: 1,
    loop: photos.length > 1,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: photos.length > 1 ? { delay: 3500 } : false
  });
}

// ==================== DETAIL TABS ====================
function initDetailTabs() {
  document.querySelectorAll('.dtab').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.dtab;
      document.querySelectorAll('.dtab').forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      document.querySelectorAll('.dtab-panel').forEach(p => p.classList.remove('active'));
      const panel = document.getElementById('dtab-' + tab);
      if (panel) panel.classList.add('active');
    });
  });
}

function renderDetailTabs() {
  const r = GM.currentResto;
  if (!r) return;

  // Description
  document.getElementById('dtab-description').innerHTML = `
    <p class="desc-text">${r.description_en || r.description_sk || ''}</p>
    <div class="features-grid">${(r.features||[]).map(f => `<span class="feature-pill"><i class="fas fa-check-circle"></i> ${f}</span>`).join('')}</div>
    <div class="hours-line"><i class="fas fa-clock"></i> ${r.hours || '—'}</div>`;

  // Menu
  document.getElementById('dtab-menu').innerHTML = (r.menu||[]).map(m => `
    <div class="menu-item"><div class="menu-info"><strong>${m.name}</strong></div><span class="menu-price">${m.price}</span></div>
  `).join('') || '<p class="empty-text">Menu bude čoskoro</p>';

  // Time slots
  const ts = document.getElementById('res-time');
  ts.innerHTML = '';
  for (let h = 11; h <= 22; h++) {
    ts.innerHTML += `<option>${String(h).padStart(2,'0')}:00</option><option>${String(h).padStart(2,'0')}:30</option>`;
  }

  // Reviews
  renderReviews(r);
}

function renderReviews(r) {
  const revs = [
    { author: 'Anna K.', rating: 5, date: '2026-04-20', text: 'Skvelé jedlo a príjemná obsluha. Určite sa vrátime!' },
    { author: 'Peter M.', rating: 4, date: '2026-04-15', text: 'Dobrá atmosféra, jedlo výborné. Trochu dlhšie čakanie.' },
    { author: 'Jana S.', rating: 5, date: '2026-04-10', text: 'Najlepšia reštaurácia v okolí. Odporúčam rezervovať vopred.' }
  ];
  document.getElementById('dtab-reviews').innerHTML = `<h4 style="margin:0 0 12px;font-weight:700">${gt('restaurant.reviews')} (${r.reviews})</h4>` +
    revs.map(rv => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${rv.author.charAt(0)}</div>
          <div><div class="review-name">${rv.author}</div><div class="review-date">${rv.date}</div></div>
        </div>
        <div class="review-stars">${'★'.repeat(rv.rating)}${'☆'.repeat(5-rv.rating)}</div>
        <div class="review-text">${rv.text}</div>
      </div>`).join('');
}

// ==================== BOOKING ====================
function submitBooking() {
  const r = GM.currentResto;
  if (!r) return;
  const booking = {
    id: Date.now(),
    resto: gName(r),
    restoId: r.id,
    date: document.getElementById('res-date').value,
    time: document.getElementById('res-time').value,
    guests: document.getElementById('res-guests').value,
    created: new Date().toISOString()
  };
  const bookings = JSON.parse(localStorage.getItem('gm-bookings') || '[]');
  bookings.push(booking);
  localStorage.setItem('gm-bookings', JSON.stringify(bookings));
  showToast(`✅ ${gt('reservation.success')} — ${booking.resto}, ${booking.date} ${booking.time}`);
  closeDetail();
  renderProfile();
}
window.submitBooking = submitBooking;

function showToast(msg) {
  const t = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  t.classList.add('show');
  setTimeout(() => t.classList.remove('show'), 2800);
}

// ==================== PROMOTIONS ====================
function renderPromos() {
  const cont = document.getElementById('promo-list');
  const promos = [
    { icon: 'fa-coffee', title: 'Káva 1+1 zadarmo', desc: 'Pri každom hlavnom jedle dostanete druhú kávu zdarma.', valid: '2026-05-31', bg: 'linear-gradient(135deg,#A05E35,#C17B4E)' },
    { icon: 'fa-utensils', title: 'Obedné menu —20%', desc: 'Pondelok–Piatok 11:00–14:00. Zľava 20% na celé obedné menu.', valid: '2026-06-15', bg: 'linear-gradient(135deg,#C17B4E,#D9956B)' },
    { icon: 'fa-wine-glass-alt', title: 'Happy Hour 17:00–19:00', desc: 'Všetky nápoje s 30% zľavou. Víno, pivo, kokteily.', valid: '2026-05-30', bg: 'linear-gradient(135deg,#D9956B,#E0B08A)' }
  ];
  cont.innerHTML = promos.map((p,i) => `
    <div class="promo-card" data-aos="fade-up" data-aos-delay="${i*100}">
      <div class="promo-banner" style="background:${p.bg}"><i class="fas ${p.icon}"></i></div>
      <div class="promo-body">
        <div class="promo-title">${p.title}</div>
        <div class="promo-desc">${p.desc}</div>
        <div class="promo-valid">${gt('promotions.valid_until')}: ${p.valid}</div>
      </div>
    </div>`).join('');
}

// ==================== NEWS ====================
function renderNews() {
  const cont = document.getElementById('news-list');
  const news = [
    { date: '2026-05-04', title: '🍕 Nové letné menu v Papaya — zľava 15% na Pho Bo', text: 'Reštaurácia Papaya Asian Bistro prináša letné menu s čerstvými ázijskými špecialitami. Zľava platí do konca mája pri rezervácii cez GastroMap.' },
    { date: '2026-05-02', title: '🥇 DAX získal cenu „Najlepšie raňajky v Bratislave 2026"', text: 'Kaviareň a reštaurácia DAX na Hviezdoslavovom námestí vyhrala prestížnu gastro cenu. Eggs Benedict a avokádový toast sú top!' },
    { date: '2026-04-28', title: '🌿 TUSI spúšťa vegánske jarné rolky', text: 'TUSI Vietnamese prináša vegánske letné rolky — čerstvé suroviny, bez mäsa, plné chuti. Dostupné denne od 11:00 na Obchodnej 38.' },
    { date: '2026-04-25', title: '🍷 Galileo: Večer talianskeho vína — 28. mája', text: 'Reštaurácia Galileo pozýva na špeciálny večer. Degustácia 5 vín, domáca pasta a živá hudba. Rezervácia už otvorená!' }
  ];
  cont.innerHTML = news.map((n,i) => `
    <div class="news-card" data-aos="fade-up" data-aos-delay="${i*100}">
      <div class="news-date">${n.date}</div>
      <div class="news-title">${n.title}</div>
      <div class="news-text">${n.text}</div>
    </div>`).join('');
}

// ==================== PROFILE ====================
function renderProfile() {
  const bookings = JSON.parse(localStorage.getItem('gm-bookings') || '[]');
  const pbCont = document.getElementById('profile-bookings');
  pbCont.innerHTML = bookings.length ? `
    <h3 style="font-weight:700;margin-bottom:12px"><i class="fas fa-calendar-alt"></i> ${gt('profile.my_reservations')}</h3>
    ${bookings.slice(-5).reverse().map(b => `
      <div class="booking-row">
        <div><strong>${b.resto}</strong></div>
        <div class="booking-meta">${b.date} ${b.time} — ${b.guests} guests</div>
      </div>`).join('')}
  ` : `<p style="color:var(--text-muted);padding:12px 0">Žiadne rezervácie. <a href="#" onclick="switchTab('explore')" style="color:var(--accent)">Objavte reštaurácie</a></p>`;

  const sec = document.getElementById('profile-sections');
  sec.innerHTML = [
    { icon: 'fa-ticket-alt', key: 'profile.used_promotions', txt: 'Použité akcie' },
    { icon: 'fa-cog', key: 'profile.settings', txt: 'Nastavenia' }
  ].map(i => `
    <div class="profile-item">
      <span class="profile-item-icon"><i class="fas ${i.icon}"></i></span>
      <span class="profile-item-text">${gt(i.key) || i.txt}</span>
      <span class="profile-item-arrow"><i class="fas fa-chevron-right"></i></span>
    </div>`).join('');
}

// ==================== BOTTOM SHEET ====================
function initSheets() {
  // No bottom sheet — removed. Markers open detail directly.
}

// ==================== DIAGNOSTICS ====================
function runAutoDiag() {
  setTimeout(() => {
    const d = gmMock.runDiagnostics();
    const cont = document.getElementById('diag-results');
    if (!cont) return;
    cont.innerHTML = `<div style="padding:8px;font-size:13px">
      <strong>${d.pass}/${d.total} PASS</strong>${d.fail > 0 ? ` | 🔴 ${d.fail} FAIL` : ''}
    </div>` +
    d.results.map(r => `<div style="font-size:12px;padding:2px 8px;color:${r.status==='PASS'?'#2e7d32':'#c62828'}">${r.status==='PASS'?'✅':'❌'} ${r.name}${r.error ? ' — '+r.error : ''}</div>`).join('');
    cont.classList.remove('hidden');
  }, 1500);
}

function toggleDiag() {
  document.getElementById('diag-results').classList.toggle('hidden');
}
window.toggleDiag = toggleDiag;