// GastroMap Final - Fixed Version
let currentLang = 'sk';
let restaurants = [];
let photos = {};
let translations = {};
let map = null;
let mapInitialized = false;

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
    // Рендерим контент всех вкладок
    renderDeals();
    renderNews();
    renderProfile();
  }).catch(err => console.error('Load error:', err));
}

function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-page');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      const tabId = this.dataset.tab + '-tab';
      // Убираем active у всех nav-item
      navItems.forEach(n => n.classList.remove('active'));
      // Добавляем active текущему
      this.classList.add('active');
      // Скрываем все tab-page
      tabs.forEach(t => { 
        t.classList.remove('active'); 
        t.style.display = 'none';
      });
      // Показываем нужный tab-page
      const targetTab = document.getElementById(tabId);
      if (targetTab) {
        targetTab.classList.add('active');
        targetTab.style.display = 'block';
      }
      
      // Если переключились на вкладку карты, инициализируем карту с задержкой
    });
  });

  // Логика кнопок Map / List внутри вкладки map
  const mapBtn = document.getElementById('map-btn');
  const listBtn = document.getElementById('list-btn');
  const mapContainer = document.getElementById('map-container');
  const listContainer = document.getElementById('list-container');

  if (mapBtn && listBtn && mapContainer && listContainer) {
    mapBtn.addEventListener('click', function() {
      mapBtn.classList.add('active');
      listBtn.classList.remove('active');
      mapContainer.style.display = 'block';
      listContainer.style.display = 'none';
      // Инициализируем карту если нужно
      setTimeout(initMapLazy, 100);
    });

    listBtn.addEventListener('click', function() {
      listBtn.classList.add('active');
      mapBtn.classList.remove('active');
      listContainer.style.display = 'block';
      mapContainer.style.display = 'none';
    });
  }
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

// Ленивая инициализация карты
function initMapLazy() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) { 
    console.error('Map container not found'); 
    return; 
  }
  
  // Если карта еще не создана
  if (!mapInitialized) {
    initMap();
    mapInitialized = true;
  } else {
    // Если карта уже есть, просто обновляем размер
    if (map) {
      setTimeout(() => map.invalidateSize(), 100);
    }
  }
}

function initMap() {
  const mapDiv = document.getElementById('map');
  if (!mapDiv) return;
  
  try {
    map = L.map('map').setView([48.1486, 17.1077], 14);
    
    // CARTO Beige (light_all) слой
    L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
      attribution: '&copy; <a href="https://carto.com/">CARTO</a>',
      maxZoom: 18,
      subdomains: 'abcd'
    }).addTo(map);

    // Кастомные иконки FontAwesome
    restaurants.forEach(r => {
      const customIcon = L.divIcon({
        className: 'custom-marker',
        html: `<div style="background:#fff;border-radius:50%;width:36px;height:36px;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 6px rgba(0,0,0,0.2);border:2px solid #C17B4E;">
                <i class="fas fa-utensils" style="color:#C17B4E;font-size:16px;"></i>
               </div>`,
        iconSize: [36, 36],
        iconAnchor: [18, 36],
        popupAnchor: [0, -36]
      });
      
      const marker = L.marker([r.lat, r.lon], { icon: customIcon }).addTo(map);
      const name = r.name || 'Restaurant';
      marker.bindPopup(`<b>${name}</b><br>${r.address || ''}`);
      marker.on('click', () => openDetail(r.id));
    });
  } catch (e) {
    console.error('Map init error:', e);
  }
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
      const panel = document.getElementById('dtab-' + this.dataset.dtab);
      if (panel) panel.classList.add('active');
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
