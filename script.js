// GastroMap — Full App Logic v2
// Beige Design System, 4 Tabs, Swiper Carousel, Leaflet Map

const APP = {
  restaurants: [],
  translations: {},
  photos: {},
  lang: localStorage.getItem('gm-lang') || 'sk',
  map: null,
  markers: [],
  swiper: null,
  currentResto: null
};

// ==================== INIT ====================
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  APP.lang = localStorage.getItem('gm-lang') || 'sk';
  setLangUI();
  initMap();
  renderRestaurantList();
  initNavigation();
  initViewToggle();
  initDetailTabs();
  renderPromotions();
  renderNews();
  renderProfile();
  initBottomSheet();
  AOS.init({ duration: 600, once: true, offset: 30, startEvent: 'DOMContentLoaded' });
});

// ==================== DATA ====================
async function loadData() {
  try {
    const [rRes, tRes, pRes] = await Promise.all([
      fetch('data/restaurants.json'),
      fetch('data/translations.json'),
      fetch('data/photos.json').catch(() => ({ json: () => ({ photos: {} }) }))
    ]);
    APP.restaurants = (await rRes.json()).restaurants || [];
    APP.translations = await tRes.json();
    APP.photos = (await pRes.json()).photos || {};
  } catch(e) { console.error('Data load fail:', e); }
}

function t(key) {
  // Support nested keys like 'nav.explore'
  const parts = key.split('.');
  let val = APP.translations[APP.lang];
  for (const p of parts) {
    if (val == null) break;
    val = val[p];
  }
  return val ?? key;
}

function tnested(obj, key) {
  if (!obj) return key;
  const langSuffix = APP.lang === 'sk' ? '_sk' : APP.lang === 'ru' ? '_ru' : '_en';
  // Try language-specific field first
  const lkey = key + langSuffix;
  const nameKey = 'name' + langSuffix;
  return obj[lkey] || obj[nameKey] || obj[key] || obj.name || key;
}

// ==================== LANGUAGE ====================
function setLang(lang) {
  APP.lang = lang;
  localStorage.setItem('gm-lang', lang);
  setLangUI();
  renderRestaurantList();
  renderPromotions();
  renderNews();
  renderProfile();
  if (APP.currentResto) renderDetailTabs();
}

function setLangUI() {
  document.querySelectorAll('.lang-btn').forEach(b => {
    b.classList.toggle('active', b.dataset.lang === APP.lang);
  });
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const val = t(el.dataset.i18n);
    if (val) el.textContent = val;
  });
}

document.querySelectorAll('.lang-btn').forEach(b => {
  b.addEventListener('click', () => setLang(b.dataset.lang));
});

// ==================== NAVIGATION ====================
function initNavigation() {
  document.querySelectorAll('.nav-item').forEach(btn => {
    btn.addEventListener('click', () => {
      const tab = btn.dataset.tab;
      switchTab(tab);
    });
  });
}

function switchTab(tab) {
  document.querySelectorAll('.tab-content-page').forEach(s => s.classList.add('hidden'));
  document.querySelectorAll('.tab-content-page').forEach(s => s.classList.remove('active'));
  const target = document.getElementById(tab + '-tab');
  if (target) { target.classList.remove('hidden'); target.classList.add('active'); }

  document.querySelectorAll('.nav-item').forEach(n => n.classList.remove('active'));
  document.querySelector(`.nav-item[data-tab="${tab}"]`)?.classList.add('active');

  if (tab === 'explore' && APP.map) {
    setTimeout(() => APP.map.invalidateSize(), 100);
  }
}

// ==================== MAP ====================
function initMap() {
  const center = [48.1486, 17.1077];
  APP.map = L.map('map', {
    center, zoom: 14,
    zoomControl: false,
    attributionControl: false
  });
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    maxZoom: 19
  }).addTo(APP.map);

  L.control.zoom({ position: 'topright' }).addTo(APP.map);

  APP.restaurants.forEach(r => {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="
        width:40px;height:40px;border-radius:50%;
        background:var(--accent,#C17B4E);color:#fff;
        display:flex;align-items:center;justify-content:center;
        font-weight:700;font-size:14px;box-shadow:0 2px 12px rgba(0,0,0,0.2);
        border:3px solid #fff;
      ">${r.name.charAt(0)}</div>`,
      iconSize: [40, 40],
      iconAnchor: [20, 40]
    });
    const marker = L.marker([r.lat, r.lon], { icon }).addTo(APP.map);
    marker.on('click', () => openDetail(r));
    APP.markers.push({ marker, resto: r });
  });
}

// ==================== VIEW TOGGLE ====================
function initViewToggle() {
  const mapBtn = document.getElementById('map-btn');
  const listBtn = document.getElementById('list-btn');
  const mapCont = document.getElementById('map-container');
  const listCont = document.getElementById('list-container');

  mapBtn?.addEventListener('click', () => {
    mapBtn.classList.add('active'); listBtn.classList.remove('active');
    mapCont.classList.remove('hidden'); listCont.classList.add('hidden');
    setTimeout(() => APP.map?.invalidateSize(), 150);
  });
  listBtn?.addEventListener('click', () => {
    listBtn.classList.add('active'); mapBtn.classList.remove('active');
    mapCont.classList.add('hidden'); listCont.classList.remove('hidden');
  });
}

// ==================== RESTAURANT LIST ====================
function renderRestaurantList() {
  const cont = document.getElementById('restaurant-list');
  if (!cont) return;

  cont.innerHTML = APP.restaurants.map(r => {
    const name = tnested(r, 'name');
    const cuisine = (Array.isArray(r.cuisine) ? r.cuisine.join(', ') : r.cuisine) || '';
      const photo = (APP.photos[r.id] && APP.photos[r.id][0]) ? APP.photos[r.id][0].replace(/[?&]w=\d+(&h=\d+)?(&fit=crop)?(&crop=center)?/g, '') + '&w=180&h=180&fit=crop&crop=center' : '';
    return `
      <div class="resto-card fade-up" data-id="${r.id}">
        ${photo ? `<img src="${photo}" class="resto-card-img" alt="${name}" loading="lazy" onerror="this.style.display='none'">` : `<div class="resto-card-img" style="background:linear-gradient(135deg,var(--accent),#D9956B);display:flex;align-items:center;justify-content:center;color:#fff;font-size:28px;font-weight:700">${name.charAt(0)}</div>`}
        <div class="resto-card-body">
          <div class="resto-card-name">${name}</div>
          <div class="resto-card-cuisine">${cuisine}</div>
          <div class="resto-card-meta">
            <span class="stars-row">${starsHTML(r.rating)} ${r.rating}</span>
            <span>${r.reviews} ${t('restaurant.reviews')}</span>
          </div>
        </div>
      </div>`;
  }).join('');

  document.querySelectorAll('.resto-card').forEach(card => {
    card.addEventListener('click', () => {
      const resto = APP.restaurants.find(r => r.id === card.dataset.id);
      if (resto) openDetail(resto);
    });
  });

  // Cuisine filter chips
  renderCuisineFilter();
}

function renderCuisineFilter() {
  const cont = document.getElementById('cuisine-filter');
  const cuisines = [...new Set(APP.restaurants.flatMap(r => r.cuisine || []))];
  cont.innerHTML = `<button class="cuisine-chip active" data-cuisine="all">All</button>` +
    cuisines.map(c => `<button class="cuisine-chip" data-cuisine="${c}">${c}</button>`).join('');

  cont.querySelectorAll('.cuisine-chip').forEach(chip => {
    chip.addEventListener('click', () => {
      cont.querySelectorAll('.cuisine-chip').forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      filterByCuisine(chip.dataset.cuisine);
    });
  });
}

function filterByCuisine(cuisine) {
  const cont = document.getElementById('restaurant-list');
  document.querySelectorAll('.resto-card').forEach(card => {
    const resto = APP.restaurants.find(r => r.id === card.dataset.id);
    const match = cuisine === 'all' || (resto?.cuisine || []).includes(cuisine);
    card.style.display = match ? '' : 'none';
  });
}

function starsHTML(rating) {
  const s = Math.round(rating);
  return '★'.repeat(s) + '☆'.repeat(5 - s);
}

// ==================== DETAIL OVERLAY ====================
function openDetail(resto) {
  APP.currentResto = resto;
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('hidden');
  document.body.style.overflow = 'hidden';

  document.getElementById('detail-name').textContent = tnested(resto, 'name');
  document.getElementById('detail-address').textContent = resto.address || '';
  document.getElementById('detail-stars').textContent = starsHTML(resto.rating);
  document.getElementById('detail-rating-value').textContent = resto.rating;
  document.getElementById('detail-reviews-count').textContent = `(${resto.reviews})`;

  // Cuisine tags
  const tagsCont = document.getElementById('detail-cuisine-tags');
  tagsCont.innerHTML = (resto.cuisine || []).map(c =>
    `<span class="cuisine-tag">${c}</span>`
  ).join('');

  // Carousel
  renderCarousel(resto);
  renderDetailTabs();

  // Reset to first tab
  document.querySelectorAll('.dtab').forEach((t, i) => t.classList.toggle('active', i === 0));
  document.querySelectorAll('.dtab-panel').forEach((p, i) => p.classList.toggle('active', i === 0));

  setTimeout(() => overlay.scrollTop = 0, 50);
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
  document.body.style.overflow = '';
  APP.currentResto = null;
  if (APP.swiper) APP.swiper.destroy();
  APP.swiper = null;
}

function renderCarousel(resto) {
  const slides = document.getElementById('carousel-slides');
  const photos = APP.photos[resto.id] || resto.photos || [];
  if (photos.length === 0) {
    slides.innerHTML = `<div class="swiper-slide" style="background:linear-gradient(135deg,var(--accent),#D9956B);display:flex;align-items:center;justify-content:center;color:#fff;font-size:32px;font-weight:700">${resto.name?.charAt(0) || '🍽️'}</div>`;
  } else {
    slides.innerHTML = photos.map(p =>
      `<div class="swiper-slide"><img src="${p}" alt="" loading="lazy" onerror="this.parentElement.style.background='linear-gradient(135deg,var(--accent),#D9956B)'"></div>`
    ).join('');
  }

  if (APP.swiper) APP.swiper.destroy();
  APP.swiper = new Swiper('#detail-carousel', {
    slidesPerView: 1,
    spaceBetween: 0,
    loop: photos.length > 1,
    pagination: { el: '.swiper-pagination', clickable: true },
    autoplay: photos.length > 1 ? { delay: 4000, disableOnInteraction: false } : false
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
      document.getElementById('dtab-' + tab)?.classList.add('active');
    });
  });
}

function renderDetailTabs() {
  const r = APP.currentResto;
  if (!r) return;

  // Description
  const descCont = document.getElementById('dtab-description');
  const desc = tnested(r, 'description') || '';
  const features = r.features || [];
  descCont.innerHTML = `
    <p class="desc-text">${desc}</p>
    ${features.length ? `<div class="features-grid">${features.map(f => `<span class="feature-pill">${f}</span>`).join('')}</div>` : ''}
    <div class="hours-line">
      <span>🕐</span> <span>${r.hours || '—'}</span>
    </div>`;

  // Menu
  const menuCont = document.getElementById('dtab-menu');
  const menu = r.menu || [];
  menuCont.innerHTML = menu.length ? menu.map(m => `
    <div class="menu-item">
      <div><div class="menu-item-name">${tnested(m, 'name') || m.name}</div></div>
      <div class="menu-item-price">${m.price}</div>
    </div>`).join('') : '<p style="color:var(--text-muted)">Menu not available</p>';

  // Reservation — fill time slots
  const timeSelect = document.getElementById('res-time');
  timeSelect.innerHTML = generateTimeSlots();

  // Set date to today
  document.getElementById('res-date').value = new Date().toISOString().split('T')[0];

  // Reviews
  renderReviews(r);
}

function generateTimeSlots() {
  let html = '';
  for (let h = 11; h <= 22; h++) {
    html += `<option>${String(h).padStart(2,'0')}:00</option>`;
    html += `<option>${String(h).padStart(2,'0')}:30</option>`;
  }
  return html;
}

function renderReviews(r) {
  const cont = document.getElementById('dtab-reviews');
  const reviews = r.reviews_data || [
    { author: 'Anna K.', rating: 5, date: '2026-04-20', text: 'Skvelé jedlo a príjemná obsluha. Určite sa vrátime!' },
    { author: 'Peter M.', rating: 4, date: '2026-04-15', text: 'Dobrá atmosféra, jedlo výborné. Trochu dlhšie čakanie.' },
    { author: 'Jana S.', rating: 5, date: '2026-04-10', text: 'Najlepšia reštaurácia v okolí. Odporúčam rezervovať vopred.' }
  ];
  cont.innerHTML = `<h4 style="font-size:18px;font-weight:700;margin-bottom:14px">${t('restaurant.reviews')} (${r.reviews})</h4>` +
    reviews.map(rv => `
      <div class="review-card">
        <div class="review-header">
          <div class="review-avatar">${rv.author.charAt(0)}</div>
          <div><div class="review-name">${rv.author}</div><div class="review-date">${rv.date}</div></div>
        </div>
        <div class="review-stars">${starsHTML(rv.rating)}</div>
        <div class="review-text">${rv.text}</div>
      </div>`).join('');
}

// ==================== BOOKING ====================
function submitBooking() {
  const r = APP.currentResto;
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const guests = document.getElementById('res-guests').value;
  showToast(`✅ ${t('reservation.success')} — ${r.name}, ${date} ${time}, ${guests} guests`);
}

function showToast(msg) {
  const toast = document.getElementById('toast');
  document.getElementById('toast-msg').textContent = msg;
  toast.classList.add('show');
  setTimeout(() => toast.classList.remove('show'), 2500);
}
window.submitBooking = submitBooking;

// ==================== PROMOTIONS ====================
function renderPromotions() {
  const cont = document.getElementById('promo-list');
  const promos = [
    { icon: '☕', title: 'Káva 1+1 zadarmo', desc: 'Pri každom hlavnom jedle dostanete druhú kávu zdarma.', valid: '2026-05-31', color: '#A05E35' },
    { icon: '🍝', title: 'Obedné menu —20%', desc: 'Pondelok–Piatok 11:00–14:00. Zľava 20% na celé obedné menu.', valid: '2026-06-15', color: '#C17B4E' },
    { icon: '🍷', title: 'Happy Hour 17:00–19:00', desc: 'Všetky nápoje s 30% zľavou. Víno, pivo, kokteily.', valid: '2026-05-30', color: '#D9956B' }
  ];
  cont.innerHTML = promos.map(p => `
    <div class="promo-card" data-aos="fade-up">
      <div class="promo-banner" style="background:linear-gradient(135deg,${p.color},${p.color}dd)">${p.icon}</div>
      <div class="promo-body">
        <div class="promo-title">${p.title}</div>
        <div class="promo-desc">${p.desc}</div>
        <div class="promo-valid">${t('promotions.valid_until')}: ${p.valid}</div>
      </div>
    </div>`).join('');
  setTimeout(() => AOS.refresh(), 100);
}

// ==================== NEWS ====================
function renderNews() {
  const cont = document.getElementById('news-list');
  const news = [
    { date: '2026-05-03', title: 'Nová reštaurácia: Galileo Restaurant', text: 'V historickom centre otvorili novú taliansku reštauráciu s domácou cestovinou a pizzou z drevenej pece. Skvelé hodnotenie 4.7 ⭐.' },
    { date: '2026-04-28', title: 'Sezónne menu — jar 2026', text: 'Všetky reštaurácie prinášajú jarné sezónne menu. Čakajte čerstvé špargle, divoký cesnak a ľahké šaláty.' },
    { date: '2026-04-20', title: 'GastroMap dosiahol 1 000+ recenzií', text: 'Ďakujeme našej komunite za vyše 1 000 overených recenzií! Každá recenzia pomáha objavovať najlepšie miesta.' }
  ];
  cont.innerHTML = news.map(n => `
    <div class="news-card" data-aos="fade-up">
      <div class="news-date">${n.date}</div>
      <div class="news-title">${n.title}</div>
      <div class="news-text">${n.text}</div>
    </div>`).join('');
  setTimeout(() => AOS.refresh(), 100);
}

// ==================== PROFILE ====================
function renderProfile() {
  const cont = document.getElementById('profile-sections');
  const items = [
    { icon: '📋', key: 'profile.my_reservations', text: 'Moje rezervácie' },
    { icon: '🎫', key: 'profile.used_promotions', text: 'Použité akcie' },
    { icon: '⭐', key: 'profile.points', text: 'Nazhromaždené body' },
    { icon: '⚙️', key: 'profile.settings', text: 'Nastavenia' }
  ];
  cont.innerHTML = items.map(i => `
    <div class="profile-item">
      <span class="profile-item-icon">${i.icon}</span>
      <span class="profile-item-text">${t(i.key) || i.text}</span>
      <span class="profile-item-arrow">›</span>
    </div>`).join('');
}

// ==================== BOTTOM SHEET ====================
function initBottomSheet() {
  const sheet = document.getElementById('bottom-sheet');
  const handle = sheet?.querySelector('.sheet-handle');
  let startY = 0, sheetTop = 0;

  handle?.addEventListener('click', () => sheet.classList.toggle('collapsed'));

  sheet?.addEventListener('touchstart', e => {
    startY = e.touches[0].clientY;
    sheetTop = sheet.getBoundingClientRect().top;
  });

  sheet?.addEventListener('touchmove', e => {
    const dy = e.touches[0].clientY - startY;
    if (dy > 30) sheet.classList.add('collapsed');
    else if (dy < -30) sheet.classList.remove('collapsed');
  });
}