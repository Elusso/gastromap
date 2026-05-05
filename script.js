// GastroMap - JavaScript Logic
// Apple Design System Implementation

let map;
let markers = [];
let restaurants = [];
let translations = {};
let currentLang = localStorage.getItem('gastromap-lang') || 'sk';

// Initialize
document.addEventListener('DOMContentLoaded', async () => {
  await loadData();
  initAOS();
  initMap();
  renderRestaurants();
  initLanguage();
  initNavigation();
  initSearch();
  initBooking();
});

// Load data
async function loadData() {
  try {
    const [restaurantsRes, translationsRes] = await Promise.all([
      fetch('data/restaurants.json'),
      fetch('data/translations.json')
    ]);
    restaurants = await restaurantsRes.json();
    translations = await translationsRes.json();
  } catch (err) {
    console.error('Error loading data:', err);
  }
}

// AOS
function initAOS() {
  AOS.init({
    duration: 800,
    once: true,
    offset: 50
  });
}

// Map
function initMap() {
  const center = restaurants.center || { lat: 48.1486, lon: 17.1077 };
  
  map = L.map('map', {
    center: [center.lat, center.lon],
    zoom: 14,
    scrollWheelZoom: true
  });
  
  // Dark style tiles
  L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
    attribution: '© OpenStreetMap contributors © CARTO',
    maxZoom: 19
  }).addTo(map);
  
  // Add markers
  restaurants.restaurants.forEach(r => {
    const marker = L.marker([r.lat, r.lon], {
      icon: L.divIcon({
        className: 'map-marker',
        iconSize: [32, 32],
        iconAnchor: [16, 32]
      })
    }).addTo(map);
    
    marker.bindPopup(`
      <div style="min-width: 200px;">
        <h3 style="font-weight: 600; margin-bottom: 4px;">${r.name}</h3>
        <p style="color: #0071e3; font-size: 12px; margin-bottom: 8px;">${r.cuisine}</p>
        <p style="font-size: 13px; color: #666;">${r.distance}m from center</p>
        <a href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}" 
           target="_blank"
           style="display: inline-block; background: #0071e3; color: white; padding: 6px 12px; border-radius: 8px; text-decoration: none; font-size: 13px; margin-top: 8px;">
          Directions
        </a>
      </div>
    `);
    
    markers.push({ marker, restaurant: r });
  });
}

// Render restaurants
function renderRestaurants(filter = 'all', search = '') {
  const grid = document.getElementById('restaurants-grid');
  let filtered = restaurants.restaurants;
  
  // Filter by cuisine
  if (filter !== 'all') {
    filtered = filtered.filter(r => {
      if (filter === 'slovak') return r.cuisine === 'slovak' || r.cuisine === 'regional';
      if (filter === 'italian') return r.cuisine === 'italian' || r.cuisine === 'pizza';
      if (filter === 'asian') return r.cuisine === 'asian' || r.cuisine === 'vietnamese' || r.cuisine === 'indian';
      if (filter === 'international') return r.cuisine === 'international';
      return true;
    });
  }
  
  // Search
  if (search) {
    const s = search.toLowerCase();
    filtered = filtered.filter(r => 
      r.name.toLowerCase().includes(s) || 
      r.cuisine.toLowerCase().includes(s)
    );
  }
  
  grid.innerHTML = filtered.map(r => `
    <div class="restaurant-card" data-aos="fade-up" data-id="${r.id}">
      <div class="restaurant-image" style="background: linear-gradient(135deg, ${getCuisineColor(r.cuisine)}, ${getCuisineColor2(r.cuisine)});">
        ${r.name.charAt(0)}
      </div>
      <div class="restaurant-content">
        <h3 class="restaurant-name">${r.name}</h3>
        <span class="restaurant-cuisine">${r.cuisine}</span>
        <p class="restaurant-meta">
          ${r.distance}m ${t('restaurant_distance')}<br>
          ${r.hours ? t('restaurant_hours') + ': ' + formatHours(r.hours) : ''}
        </p>
        <div class="restaurant-features">
          ${r.wifi ? '<span class="feature-badge">WiFi</span>' : ''}
          ${r.outdoor ? '<span class="feature-badge">' + t('feature_outdoor') + '</span>' : ''}
          ${r.vegetarian ? '<span class="feature-badge">' + t('feature_vegetarian') + '</span>' : ''}
          ${r.vegan ? '<span class="feature-badge">' + t('feature_vegan') + '</span>' : ''}
          ${r.delivery ? '<span class="feature-badge">' + t('feature_delivery') + '</span>' : ''}
        </div>
        <div class="restaurant-actions">
          <button class="btn-book" onclick="openBooking('${r.id}')">${t('restaurant_book')}</button>
          <a class="btn-directions" href="https://www.google.com/maps/dir/?api=1&destination=${r.lat},${r.lon}" target="_blank">
            ${t('restaurant_directions')}
          </a>
        </div>
      </div>
    </div>
  `).join('');
  
  // Re-init AOS for new cards
  AOS.refresh();
}

// Cuisine colors
function getCuisineColor(cuisine) {
  const colors = {
    'slovak': '#e85d5d',
    'regional': '#e85d5d',
    'italian': '#ff9500',
    'pizza': '#ff9500',
    'asian': '#00c7be',
    'vietnamese': '#00c7be',
    'indian': '#ff6b35',
    'international': '#667eea'
  };
  return colors[cuisine] || '#0071e3';
}

function getCuisineColor2(cuisine) {
  const colors = {
    'slovak': '#ff8787',
    'regional': '#ff8787',
    'italian': '#ffb84d',
    'pizza': '#ffb84d',
    'asian': '#4dd8d0',
    'vietnamese': '#4dd8d0',
    'indian': '#ff9a6c',
    'international': '#8b9eff'
  };
  return colors[cuisine] || '#4da3ff';
}

// Format hours
function formatHours(hours) {
  if (!hours) return '';
  return hours.split(';')[0]; // Show first part
}

// Translation helper
function t(key) {
  return translations[currentLang]?.[key] || key;
}

// Language
function initLanguage() {
  setLanguage(currentLang);
  
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.addEventListener('click', () => {
      setLanguage(btn.dataset.lang);
    });
  });
}

function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem('gastromap-lang', lang);
  
  // Update active button
  document.querySelectorAll('.lang-btn').forEach(btn => {
    btn.classList.toggle('active', btn.dataset.lang === lang);
  });
  
  // Update all translatable elements
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const key = el.dataset.i18n;
    if (translations[lang]?.[key]) {
      el.textContent = translations[lang][key];
    }
  });
  
  document.querySelectorAll('[data-i18n-placeholder]').forEach(el => {
    const key = el.dataset.i18nPlaceholder;
    if (translations[lang]?.[key]) {
      el.placeholder = translations[lang][key];
    }
  });
  
  // Re-render restaurants with new language
  renderRestaurants();
  
  // Update page title
  if (translations[lang]?.seo_title) {
    document.title = translations[lang].seo_title;
  }
}

// Navigation
function initNavigation() {
  document.querySelectorAll('.nav-link').forEach(link => {
    link.addEventListener('click', (e) => {
      e.preventDefault();
      const target = document.querySelector(link.getAttribute('href'));
      if (target) {
        target.scrollIntoView({ behavior: 'smooth' });
      }
      
      document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('active'));
      link.classList.add('active');
    });
  });
}

// Search & Filter
function initSearch() {
  const searchInput = document.querySelector('.search-input');
  const searchBtn = document.querySelector('.search-btn');
  const chips = document.querySelectorAll('.chip');
  
  let currentFilter = 'all';
  
  const doSearch = () => {
    const query = searchInput.value.trim();
    renderRestaurants(currentFilter, query);
  };
  
  searchInput?.addEventListener('input', debounce(doSearch, 300));
  searchBtn?.addEventListener('click', doSearch);
  
  chips.forEach(chip => {
    chip.addEventListener('click', () => {
      chips.forEach(c => c.classList.remove('active'));
      chip.classList.add('active');
      currentFilter = chip.dataset.filter;
      doSearch();
    });
  });
}

// Booking
function initBooking() {
  const modal = document.getElementById('booking-modal');
  const form = document.getElementById('booking-form');
  const closeBtn = modal?.querySelector('.modal-close');
  const cancelBtn = modal?.querySelector('.btn-secondary');
  
  closeBtn?.addEventListener('click', closeBooking);
  cancelBtn?.addEventListener('click', closeBooking);
  
  modal?.addEventListener('click', (e) => {
    if (e.target === modal) closeBooking();
  });
  
  form?.addEventListener('submit', (e) => {
    e.preventDefault();
    const formData = new FormData(form);
    console.log('Booking submitted:', Object.fromEntries(formData));
    
    alert(t('success_booking'));
    closeBooking();
    form.reset();
  });
}

function openBooking(restaurantId) {
  const restaurant = restaurants.restaurants.find(r => r.id === restaurantId);
  const modal = document.getElementById('booking-modal');
  const nameEl = document.getElementById('modal-restaurant-name');
  
  if (restaurant && nameEl) {
    nameEl.textContent = restaurant.name;
  }
  
  modal?.classList.add('active');
  document.body.style.overflow = 'hidden';
}

function closeBooking() {
  const modal = document.getElementById('booking-modal');
  modal?.classList.remove('active');
  document.body.style.overflow = '';
}

// Debounce
function debounce(fn, ms) {
  let timeout;
  return function(...args) {
    clearTimeout(timeout);
    timeout = setTimeout(() => fn.apply(this, args), ms);
  };
}

// Global
window.openBooking = openBooking;