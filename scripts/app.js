// GastroMap Final - Working Version
let currentLang = 'sk';
let restaurants = [];
let photos = {};
let translations = {};
let map = null;

document.addEventListener('DOMContentLoaded', initApp);

function initApp() {
  fetch('data/restaurants.json').then(r => r.json()).then(data => {
    restaurants = data.restaurants || [];
    return fetch('data/photos.json');
  }).then(r => r.json()).then(data => {
    photos = data;
    return fetch('data/translations.json');
  }).then(r => r.json()).then(data => {
    translations = data;
    initNavigation();
    initLanguage();
    renderRestaurants();
    renderDeals();
    renderNews();
    renderProfile();
    // Init map after short delay
    setTimeout(initMap, 300);
  }).catch(err => console.error('Load error:', err));
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-page');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      tabs.forEach(t => t.classList.remove('active'));
      const tabId = this.dataset.tab + '-tab';
      document.getElementById(tabId).classList.add('active');
    });
  });

  document.getElementById('map-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('list-btn').classList.remove('active');
    document.getElementById('map-container').style.setProperty('display', 'block', 'important');
    document.getElementById('list-container').style.setProperty('display', 'none', 'important');
    setTimeout(() => { if (map) map.invalidateSize(); }, 100);
  });

  document.getElementById('list-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('map-btn').classList.remove('active');
    document.getElementById('list-container').style.setProperty('display', 'block', 'important');
    document.getElementById('map-container').style.setProperty('display', 'none', 'important');
  });
}

function initLanguage() {
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', function() {
      document.querySelectorAll('.lang-btn').forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentLang = this.dataset.lang;
      updateUI();
    });
  });
  updateUI();
}

function updateUI() {
  const t = translations[currentLang] || translations['sk'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.dataset.i18n.split('.');
    let val = t;
    keys.forEach(k => val = val?.[k]);
    if (val) el.textContent = val;
  });
  renderRestaurants();
}

function renderRestaurants() {
  const list = document.getElementById('restaurant-list');
  if (!list) return;
  list.innerHTML = '';
  const langSuffix = currentLang === 'en' ? '_en' : currentLang === 'ru' ? '_ru' : '';
  
  restaurants.forEach(r => {
    const name = r['name' + langSuffix] || r.name;
    const desc = (r['description' + langSuffix] || r.description_en).substring(0, 60) + '...';
    const rPhotos = photos[r.id] || [];
    
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.innerHTML = `
      <div class="card-image" style="background-image:url('${rPhotos[0] || 'https://via.placeholder.com/120'}')"></div>
      <div class="card-content">
        <div class="card-title">${name}</div>
        <div class="card-desc">${desc}</div>
        <div class="card-tags">${r.cuisine.map(c => `<span class="tag">${c}</span>`).join('')}</div>
        <div class="card-rating">${'★'.repeat(Math.floor(r.rating))} ${r.rating}</div>
      </div>`;
    card.addEventListener('click', () => openDetail(r.id));
    list.appendChild(card);
  });
}

function initMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) { console.error('Map div not found'); return; }
  if (map) map.remove();
  
  map = L.map('map').setView([48.1486, 17.1077], 14);
  L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
    attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
    maxZoom: 18
  }).addTo(map);

  restaurants.forEach(r => {
    const icon = L.divIcon({
      className: 'custom-marker',
      html: `<div style="background:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);"><i class="fas fa-utensils" style="color:#C17B4E;font-size:16px;"></i></div>`,
      iconSize: [36, 36], iconAnchor: [18, 36]
    });
    const marker = L.marker([r.lat, r.lon], { icon: icon }).addTo(map);
    marker.bindPopup(`<b>${r.name}</b><br>${r.address}`);
    marker.on('click', () => openDetail(r.id));
  });
}

function openDetail(id) {
  const r = restaurants.find(x => x.id === id);
  if (!r) return;
  document.getElementById('detail-name').textContent = r.name;
  document.getElementById('detail-address').textContent = r.address;
  document.getElementById('meta-stars').textContent = '★'.repeat(Math.floor(r.rating)) + ` ${r.rating}`;
  document.getElementById('meta-price').textContent = r.price_range;
  
  const swiperWrapper = document.getElementById('carousel-slides');
  const rPhotos = photos[id] || [];
  swiperWrapper.innerHTML = rPhotos.map(p => 
    `<div class="swiper-slide" style="background-image:url('${p}')"></div>`
  ).join('');
  
  initDetailTabs();
  document.getElementById('detail-overlay').classList.remove('hidden');
}

function initDetailTabs() {
  const tabs = document.querySelectorAll('.dtab');
  const panels = document.querySelectorAll('.dtab-panel');
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      panels.forEach(p => p.classList.remove('active'));
      document.getElementById('dtab-' + this.dataset.dtab).classList.add('active');
    });
  });
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
}

function renderDeals() {
  const container = document.getElementById('promo-list');
  if (!container) return;
  container.innerHTML = [
    { title: 'Káva 1+1', desc: 'Kúpte si jednu kávu a druhú máte zdarma', icon: '☕' },
    { title: 'Obedné menu 20%', desc: 'Iba v pracovné dni 11:00-15:00', icon: '🍲' },
    { title: 'Happy Hour 18-20', desc: 'Všetky nápoje 2+1 zdarma', icon: '🍺' }
  ].map(d => `
    <div class="offer-card">
      <div class="offer-image" style="display:flex;align-items:center;justify-content:center;font-size:40px;">${d.icon}</div>
      <div class="offer-content">
        <div class="offer-title">${d.title}</div>
        <div class="offer-desc">${d.desc}</div>
      </div>
    </div>`).join('');
}

function renderNews() {
  const container = document.getElementById('news-list');
  if (!container) return;
  container.innerHTML = `
    <div class="news-card">
      <div class="news-image" style="background-image:url('https://images.unsplash.com/photo-1565558825493-5a151d60f05d?w=400')"></div>
      <div class="news-content">
        <div class="news-title">Nová reštaurácia Fellini</div>
        <div class="news-excerpt">Otvárame nový taliansky reštauráciu...</div>
      </div>
    </div>`;
}

function renderProfile() {
  const bookingsEl = document.getElementById('profile-bookings');
  if (!bookingsEl) return;
  bookingsEl.innerHTML = '<h3>Moje rezervácie</h3>' +
    `<div style="padding:12px;background:#f8f8f8;border-radius:10px;margin-bottom:8px;">
      <strong>Papaya Asian Bistro</strong><br>
      <small>2026-05-10 19:00 - <span style="color:green">confirmed</span></small>
    </div>`;
}

function submitBooking() {
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  if (date && time) {
    alert(`Rezervácia potvrdená!\nDátum: ${date}\nČas: ${time}`);
    closeDetail();
  } else {
    alert('Vyplňte dátum a čas.');
  }
}
