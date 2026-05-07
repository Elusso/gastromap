// GastroMap Main Application Logic
let currentLang = 'sk';
let restaurants = [];
let photos = {};
let translations = {};
let currentRestaurant = null;
let selectedTable = null;
let selectedRating = 0;
let userBookings = [
  { restaurant: 'Papaya Asian Bistro', date: '2026-05-10', time: '19:00', guests: 2, status: 'confirmed' },
  { restaurant: 'Galileo Restaurant', date: '2026-05-15', time: '20:00', guests: 4, status: 'pending' }
];

let deals = [
  { id: 1, title_sk: 'Káva 1+1', title_en: 'Coffee 1+1', title_ru: 'Кофе 1+1', desc_sk: 'Kúpte si jednu kávu a druhú máte zdarma', desc_en: 'Buy one coffee get one free', desc_ru: 'Купите одну кофе, вторая бесплатно', validUntil: '2026-05-15T23:59:59', used: false, restaurant: 'DAX Cafe & Restaurant' },
  { id: 2, title_sk: 'Obedné menu 20% zľava', title_en: 'Lunch special 20% off', title_ru: 'Бизнес-ланч 20% скидка', desc_sk: 'Iba v pracovné dni 11:00-15:00', desc_en: 'Only on weekdays 11:00-15:00', desc_ru: 'Только в будни 11:00-15:00', validUntil: '2026-05-20T23:59:59', used: false, restaurant: 'Slovenská Krčma' },
  { id: 3, title_sk: 'Happy Hour 18:00-20:00', title_en: 'Happy Hour 18:00-20:00', title_ru: 'Happy Hour 18:00-20:00', desc_sk: 'Všetky nápoje 2+1 zdarma', desc_en: 'All drinks 2+1 free', desc_ru: 'Все напитки 2+1 бесплатно', validUntil: '2026-05-30T23:59:59', used: false, restaurant: 'Galileo Restaurant' }
];

let news = [
  { id: 1, title_sk: 'Nová reštaurácia Fellini', title_en: 'New restaurant Fellini', title_ru: 'Новый ресторан Fellini', excerpt_sk: 'Otvárame nový taliansky reštauráciu s morskými plodmi', excerpt_en: 'Opening new Italian seafood restaurant', excerpt_ru: 'Открываем новый итальянский ресторан с морепродуктами', date: '2026-05-05', image: 'https://images.unsplash.com/photo-1565558825493-5a151d60f05d?w=400&h=300&fit=crop' },
  { id: 2, title_sk: 'Sezónne menu v Papaya', title_en: 'Seasonal menu at Papaya', title_ru: 'Сезонное меню в Papaya', excerpt_sk: 'Skúste naše nové jarné špeciality', excerpt_en: 'Try our new spring specials', excerpt_ru: 'Попробуйте наши новые весенние специальные блюда', date: '2026-05-03', image: 'https://images.unsplash.com/photo-1517248135467-4c7edcad0f22?w=400&h=300&fit=crop' },
  { id: 3, title_sk: 'Bratislavský festival jedla', title_en: 'Bratislava Food Festival', title_ru: 'Фестиваль еды Братиславы', excerpt_sk: 'Navštívte náš stánok na námestí', excerpt_en: 'Visit our booth at the square', excerpt_ru: 'Посетите наш стенд на площади', date: '2026-05-01', image: 'https://images.unsplash.com/photo-1559339352-11d035aa65de?w=400&h=300&fit=crop' }
];

document.addEventListener('DOMContentLoaded', function() {
  loadData();
});

function loadData() {
  try {
    const restaurantsScript = document.getElementById('restaurants-data');
    const photosScript = document.getElementById('photos-data');
    const translationsScript = document.getElementById('translations-data');
    
    if (restaurantsScript && restaurantsScript.textContent) {
      const data = JSON.parse(restaurantsScript.textContent);
      restaurants = data.restaurants || [];
    }
    
    if (photosScript && photosScript.textContent) {
      photos = JSON.parse(photosScript.textContent);
    }
    
    if (translationsScript && translationsScript.textContent) {
      translations = JSON.parse(translationsScript.textContent);
    }
    
    initApp();
  } catch (e) {
    console.error('Error loading data:', e);
    // Fallback: fetch JSON files directly
    Promise.all([
      fetch('data/restaurants.json').then(r => r.json()),
      fetch('data/photos.json').then(r => r.json()),
      fetch('data/translations.json').then(r => r.json())
    ]).then(([restData, photoData, transData]) => {
      restaurants = restData.restaurants || [];
      photos = photoData;
      translations = transData;
      initApp();
    }).catch(err => console.error('Failed to load data:', err));
  }
}

function initApp() {
  initLanguage();
  initNavigation();
  renderRestaurantCards();
  initLeafletMap();
  renderDeals();
  renderNews();
  renderProfile();
  initDetailTabs();
  initStarRating();
  AOS.init({ duration: 600, once: true });
}

// ====== LANGUAGE HANDLING ======
function initLanguage() {
  const langBtns = document.querySelectorAll('.lang-btn');
  langBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      langBtns.forEach(b => b.classList.remove('active'));
      this.classList.add('active');
      currentLang = this.dataset.lang;
      updateLanguage();
    });
  });
  updateLanguage();
}

function updateLanguage() {
  const langData = translations[currentLang] || translations['sk'];
  document.querySelectorAll('[data-i18n]').forEach(el => {
    const keys = el.dataset.i18n.split('.');
    let value = langData;
    for (const key of keys) {
      value = value?.[key];
      if (!value) break;
    }
    if (value) {
      if (el.tagName === 'INPUT' && el.type === 'placeholder') {
        el.placeholder = value;
      } else {
        el.textContent = value;
      }
    }
  });
  // Re-render dynamic content
  renderRestaurantCards();
  renderDeals();
  renderNews();
  renderProfile();
  if (currentRestaurant) {
    openDetail(currentRestaurant.id);
  }
}

// ====== NAVIGATION ======
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const tabs = document.querySelectorAll('.tab-page');
  
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');
      
      const tabId = this.dataset.tab;
      tabs.forEach(t => t.classList.add('hidden'));
      const targetTab = document.getElementById(`${tabId}-tab`);
      if (targetTab) targetTab.classList.remove('hidden');
      
      document.getElementById('detail-overlay').classList.add('hidden');
    });
  });
  
  // View toggle (map/list)
  document.getElementById('map-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('list-btn').classList.remove('active');
    document.getElementById('map-container').classList.remove('hidden');
    document.getElementById('list-container').classList.add('hidden');
  });
  
  document.getElementById('list-btn').addEventListener('click', function() {
    this.classList.add('active');
    document.getElementById('map-btn').classList.remove('active');
    document.getElementById('map-container').classList.add('hidden');
    document.getElementById('list-container').classList.remove('hidden');
  });
}

// ====== RESTAURANT CARDS ======
function renderRestaurantCards() {
  const container = document.getElementById('restaurant-list');
  container.innerHTML = '';
  
  restaurants.forEach(restaurant => {
    const restPhotos = photos[restaurant.id] || [];
    const photoUrl = restPhotos.length > 0 ? restPhotos[0] : 'https://via.placeholder.com/800x500';
    const name = restaurant[`name_${currentLang}`] || restaurant.name;
    const desc = restaurant[`description_${currentLang}`] || restaurant.description_en;
    
    const card = document.createElement('div');
    card.className = 'restaurant-card';
    card.dataset.id = restaurant.id;
    card.innerHTML = `
      <div class="card-image" style="background-image: url('${photoUrl}')"></div>
      <div class="card-content">
        <h3 class="card-title">${name}</h3>
        <p class="card-desc">${desc.substring(0, 80)}...</p>
        <div class="card-tags">
          ${restaurant.cuisine.map(c => `<span class="tag">${c}</span>`).join('')}
        </div>
        <div class="card-rating">
          ${generateStars(restaurant.rating)} <strong>${restaurant.rating}</strong> (${restaurant.reviews} ${getTranslation('explore.reviews')})
        </div>
      </div>
    `;
    card.addEventListener('click', () => openDetail(restaurant.id));
    container.appendChild(card);
  });
}

// ====== LEAFLET MAP ======
function initLeafletMap() {
  const map = L.map('map').setView([48.1486, 17.1077], 14);
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    attribution: '© OpenStreetMap contributors'
  }).addTo(map);
  
  // Custom cuisine icons
  const cuisineIcons = {
    'asian': L.divIcon({ html: '<i class="fas fa-utensils" style="color:#ff6b6b"></i>', className: 'custom-marker', iconSize: [30, 30] }),
    'italian': L.divIcon({ html: '<i class="fas fa-pizza-slice" style="color:#ffa502"></i>', className: 'custom-marker', iconSize: [30, 30] }),
    'slovak': L.divIcon({ html: '<i class="fas fa-drumstick-bite" style="color:#2ed573"></i>', className: 'custom-marker', iconSize: [30, 30] }),
    'vietnamese': L.divIcon({ html: '<i class="fas fa-bowl-rice" style="color:#1e90ff"></i>', className: 'custom-marker', iconSize: [30, 30] }),
    'european': L.divIcon({ html: '<i class="fas fa-bread-slice" style="color:#ff4757"></i>', className: 'custom-marker', iconSize: [30, 30] }),
    'default': L.divIcon({ html: '<i class="fas fa-map-marker-alt" style="color:#C17B4E"></i>', className: 'custom-marker', iconSize: [30, 30] })
  };
  
  restaurants.forEach(restaurant => {
    const restPhotos = photos[restaurant.id] || [];
    const photoUrl = restPhotos.length > 0 ? restPhotos[0] : '';
    const name = restaurant[`name_${currentLang}`] || restaurant.name;
    
    let icon = cuisineIcons['default'];
    if (restaurant.cuisine && restaurant.cuisine.length > 0) {
      const mainCuisine = restaurant.cuisine[0];
      icon = cuisineIcons[mainCuisine] || cuisineIcons['default'];
    }
    
    const marker = L.marker([restaurant.lat, restaurant.lon], { icon }).addTo(map);
    marker.bindPopup(`
      <div style="min-width:200px">
        <h4>${name}</h4>
        <img src="${photoUrl}" style="width:100%;height:100px;object-fit:cover;border-radius:8px;margin:8px 0">
        <p>${restaurant.address}</p>
        <button onclick="openDetail('${restaurant.id}')" style="background:#C17B4E;color:white;border:none;padding:6px 12px;border-radius:6px;cursor:pointer">
          ${getTranslation('explore.book')}
        </button>
      </div>
    `);
  });
}

// ====== DEALS WITH COUNTDOWN ======
function renderDeals() {
  const container = document.getElementById('promo-list');
  container.innerHTML = '';
  
  deals.forEach(deal => {
    const title = deal[`title_${currentLang}`] || deal.title_sk;
    const desc = deal[`desc_${currentLang}`] || deal.desc_sk;
    const timeLeft = getTimeLeft(deal.validUntil);
    
    const card = document.createElement('div');
    card.className = 'promo-card';
    card.innerHTML = `
      <div class="promo-header">
        <h3>${title}</h3>
        <span class="promo-restaurant">${deal.restaurant}</span>
      </div>
      <p class="promo-desc">${desc}</p>
      <div class="promo-footer">
        <div class="countdown" data-until="${deal.validUntil}">
          <i class="fas fa-clock"></i> <span class="countdown-text">${timeLeft}</span>
        </div>
        <button class="btn-use-deal ${deal.used ? 'used' : ''}" data-deal-id="${deal.id}" ${deal.used ? 'disabled' : ''}>
          ${deal.used ? getTranslation('promotions.used') || 'Použité' : getTranslation('promotions.use') || 'Použiť'}
        </button>
      </div>
    `;
    container.appendChild(card);
  });
  
  // Attach event listeners
  document.querySelectorAll('.btn-use-deal').forEach(btn => {
    btn.addEventListener('click', function() {
      const dealId = parseInt(this.dataset.dealId);
      useDeal(dealId);
    });
  });
  
  // Start countdown timers
  startCountdowns();
}

function useDeal(dealId) {
  const deal = deals.find(d => d.id === dealId);
  if (deal && !deal.used) {
    deal.used = true;
    renderDeals();
    showToast(getTranslation('promotions.used_success') || 'Akcia bola použitá!');
  }
}

function getTimeLeft(until) {
  const now = new Date();
  const end = new Date(until);
  const diff = end - now;
  
  if (diff <= 0) return getTranslation('promotions.expired') || 'Vypršalo';
  
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));
  const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  
  if (days > 0) return `${days}d ${hours}h`;
  return `${hours}h ${minutes}m`;
}

function startCountdowns() {
  setInterval(() => {
    document.querySelectorAll('.countdown').forEach(el => {
      const until = el.dataset.until;
      const timeLeft = getTimeLeft(until);
      el.querySelector('.countdown-text').textContent = timeLeft;
    });
  }, 60000); // Update every minute
}

// ====== NEWS ======
function renderNews() {
  const container = document.getElementById('news-list');
  container.innerHTML = '';
  
  news.forEach(item => {
    const title = item[`title_${currentLang}`] || item.title_sk;
    const excerpt = item[`excerpt_${currentLang}`] || item.excerpt_sk;
    
    const card = document.createElement('div');
    card.className = 'news-card';
    card.innerHTML = `
      <img src="${item.image}" alt="${title}" class="news-image">
      <div class="news-content">
        <span class="news-date">${item.date}</span>
        <h3 class="news-title">${title}</h3>
        <p class="news-excerpt">${excerpt}</p>
      </div>
    `;
    container.appendChild(card);
  });
}

// ====== PROFILE ======
function renderProfile() {
  // Points
  document.getElementById('gm-points').textContent = '1 250';
  
  // Bookings
  const bookingsContainer = document.getElementById('profile-bookings');
  bookingsContainer.innerHTML = '';
  
  userBookings.forEach(booking => {
    const item = document.createElement('div');
    item.className = 'booking-item';
    item.innerHTML = `
      <div class="booking-info">
        <h4>${booking.restaurant}</h4>
        <p><i class="fas fa-calendar"></i> ${booking.date} <i class="fas fa-clock"></i> ${booking.time}</p>
        <p><i class="fas fa-users"></i> ${booking.guests} guests</p>
      </div>
      <span class="booking-status ${booking.status}">${booking.status}</span>
    `;
    bookingsContainer.appendChild(item);
  });
  
  // Used deals
  const dealsContainer = document.getElementById('profile-deals');
  dealsContainer.innerHTML = '';
  const usedDeals = deals.filter(d => d.used);
  if (usedDeals.length === 0) {
    dealsContainer.innerHTML = `<p class="empty-state">${getTranslation('profile.no_deals') || 'Zatiaľ žiadne použité akcie'}</p>`;
  } else {
    usedDeals.forEach(deal => {
      const title = deal[`title_${currentLang}`] || deal.title_sk;
      const item = document.createElement('div');
      item.className = 'deal-item';
      item.innerHTML = `<i class="fas fa-check-circle"></i> ${title}`;
      dealsContainer.appendChild(item);
    });
  }
}

// ====== RESTAURANT DETAIL ======
function openDetail(restaurantId) {
  currentRestaurant = restaurants.find(r => r.id === restaurantId);
  if (!currentRestaurant) return;
  
  const overlay = document.getElementById('detail-overlay');
  overlay.classList.remove('hidden');
  
  const name = currentRestaurant[`name_${currentLang}`] || currentRestaurant.name;
  const desc = currentRestaurant[`description_${currentLang}`] || currentRestaurant.description_en;
  const restPhotos = photos[restaurantId] || [];
  
  // Update basic info
  document.getElementById('detail-name').textContent = name;
  document.getElementById('detail-address').textContent = currentRestaurant.address;
  document.getElementById('meta-stars').innerHTML = generateStars(currentRestaurant.rating) + ` <strong>${currentRestaurant.rating}</strong>`;
  document.getElementById('meta-price').textContent = currentRestaurant.price_range;
  document.getElementById('meta-check').textContent = currentRestaurant.avg_check;
  
  // Cuisine tags
  const tagsContainer = document.getElementById('detail-cuisine-tags');
  tagsContainer.innerHTML = currentRestaurant.cuisine.map(c => `<span class="tag">${c}</span>`).join('');
  
  // Route button
  document.getElementById('detail-route-btn').href = `https://www.google.com/maps/dir/?api=1&destination=${currentRestaurant.lat},${currentRestaurant.lon}`;
  
  // Carousel
  const swiperWrapper = document.getElementById('carousel-slides');
  swiperWrapper.innerHTML = '';
  restPhotos.forEach(photo => {
    const slide = document.createElement('div');
    slide.className = 'swiper-slide';
    slide.style.backgroundImage = `url('${photo}')`;
    swiperWrapper.appendChild(slide);
  });
  new Swiper('#detail-carousel', {
    loop: true,
    pagination: { el: '.swiper-pagination', clickable: true }
  });
  
  // Menu tab
  renderMenu();
  
  // Reservation tab - generate tables
  renderTables();
  
  // Reviews tab
  renderReviews();
}

function closeDetail() {
  document.getElementById('detail-overlay').classList.add('hidden');
}

// ====== DETAIL TABS ======
function initDetailTabs() {
  const tabs = document.querySelectorAll('.dtab');
  const panels = document.querySelectorAll('.dtab-panel');
  
  tabs.forEach(tab => {
    tab.addEventListener('click', function() {
      tabs.forEach(t => t.classList.remove('active'));
      this.classList.add('active');
      
      const tabId = this.dataset.dtab;
      panels.forEach(p => p.classList.add('hidden'));
      document.getElementById(`dtab-${tabId}`).classList.remove('hidden');
    });
  });
}

// ====== MENU ======
function renderMenu() {
  if (!currentRestaurant) return;
  const container = document.getElementById('menu-list');
  container.innerHTML = '';
  
  currentRestaurant.menu.forEach(item => {
    const menuItem = document.createElement('div');
    menuItem.className = 'menu-item';
    menuItem.innerHTML = `
      <span class="menu-name">${item.name}</span>
      <span class="menu-price">${item.price}</span>
    `;
    container.appendChild(menuItem);
  });
}

// ====== TABLE SELECTION ======
function renderTables() {
  const container = document.getElementById('table-grid');
  container.innerHTML = '';
  
  // Generate 12 tables (mix of 2, 4, 6 seater)
  for (let i = 1; i <= 12; i++) {
    const size = i <= 4 ? 2 : i <= 8 ? 4 : 6;
    const table = document.createElement('div');
    table.className = 'table';
    table.dataset.table = i;
    table.dataset.size = size;
    table.innerHTML = `
      <i class="fas fa-chair"></i>
      <span>${size}</span>
    `;
    table.addEventListener('click', function() {
      document.querySelectorAll('.table').forEach(t => t.classList.remove('selected'));
      this.classList.add('selected');
      selectedTable = i;
    });
    container.appendChild(table);
  }
}

// ====== RESERVATION ======
function submitBooking() {
  if (!selectedTable) {
    showToast(getTranslation('reservation.select_table_first') || 'Vyberte stôl');
    return;
  }
  
  const date = document.getElementById('res-date').value;
  const time = document.getElementById('res-time').value;
  const guests = document.getElementById('res-guests').value;
  
  if (!date) {
    showToast(getTranslation('reservation.select_date') || 'Vyberte dátum');
    return;
  }
  
  // Add to user bookings
  userBookings.unshift({
    restaurant: currentRestaurant[`name_${currentLang}`] || currentRestaurant.name,
    date: date,
    time: time,
    guests: guests,
    status: 'confirmed'
  });
  
  showToast(getTranslation('reservation.success') || 'Rezervácia potvrdená!');
  closeDetail();
}

// ====== REVIEWS ======
function renderReviews() {
  if (!currentRestaurant) return;
  const container = document.getElementById('reviews-list');
  container.innerHTML = '';
  
  // Mock existing reviews
  const mockReviews = [
    { user: 'Jana K.', rating: 5, text: 'Amazing food and atmosphere!', date: '2026-05-05', lang: 'en' },
    { user: 'Peter M.', rating: 4, text: 'Great service, delicious meals.', date: '2026-05-03', lang: 'sk' },
    { user: 'Ivan H.', rating: 5, text: 'Best restaurant in Bratislava!', date: '2026-05-01', lang: 'sk' }
  ];
  
  mockReviews.forEach(review => {
    const reviewEl = document.createElement('div');
    reviewEl.className = 'review-item';
    reviewEl.innerHTML = `
      <div class="review-header">
        <strong>${review.user}</strong>
        <span class="review-date">${review.date}</span>
      </div>
      <div class="review-stars">${generateStars(review.rating)}</div>
      <p class="review-text">${review.text}</p>
    `;
    container.appendChild(reviewEl);
  });
}

function showReviewForm() {
  document.getElementById('review-form').classList.toggle('hidden');
}

function initStarRating() {
  const stars = document.querySelectorAll('#star-rating i');
  stars.forEach(star => {
    star.addEventListener('click', function() {
      selectedRating = parseInt(this.dataset.rating);
      stars.forEach(s => {
        const rating = parseInt(s.dataset.rating);
        s.classList.toggle('fas', rating <= selectedRating);
        s.classList.toggle('far', rating > selectedRating);
      });
    });
  });
}

function submitReview() {
  const text = document.getElementById('review-text').value;
  if (!selectedRating || !text) {
    showToast('Please add rating and text');
    return;
  }
  
  showToast(getTranslation('restaurant.review_thanks') || 'Ďakujeme za recenziu!');
  document.getElementById('review-form').classList.add('hidden');
  document.getElementById('review-text').value = '';
  selectedRating = 0;
  initStarRating();
}

// ====== UTILITIES ======
function generateStars(rating) {
  let stars = '';
  for (let i = 1; i <= 5; i++) {
    if (i <= Math.floor(rating)) {
      stars += '<i class="fas fa-star"></i>';
    } else if (i - 0.5 <= rating) {
      stars += '<i class="fas fa-star-half-alt"></i>';
    } else {
      stars += '<i class="far fa-star"></i>';
    }
  }
  return stars;
}

function getTranslation(key) {
  const keys = key.split('.');
  let value = translations[currentLang];
  for (const k of keys) {
    value = value?.[k];
    if (!value) {
      value = translations['sk'];
      for (const k of keys) {
        value = value?.[k];
        if (!value) break;
      }
      break;
    }
  }
  return value || key;
}

function showToast(message) {
  const toast = document.getElementById('toast');
  const toastMsg = document.getElementById('toast-msg');
  toastMsg.textContent = message;
  toast.classList.remove('hidden');
  setTimeout(() => toast.classList.add('hidden'), 3000);
}
