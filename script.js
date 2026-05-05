// GastroMap — JS Logic
document.addEventListener('DOMContentLoaded', () => {
  // Language support
  const translations = {
    sk: {
      nav_home: "Domov",
      nav_map: "Mapa",
      nav_reservations: "Rezervácie",
      hero_title: "Откройте вкусы <br>Братиславы",
      hero_subtitle: "Лучшие рестораны — в красивом интерфейсе",
      search_placeholder: "Поиск по названию, кухне...",
      search_button: "Найти",
      popular_places: "Популярные места",
      map_title: "Карта ресторанов",
      reservations_title: "Мои бронирования",
      res_restaurant: "Ресторан",
      res_date: "Дата",
      res_time: "Время",
      res_people: "Человек",
      cancel_button: "Отмена",
      confirm_button: "Забронировать",
      filter_all: "все",
      filter_japanese: "японская",
      filter_french: "французская",
      filter_slovak: "словацкая",
      filter_asian: "азиатская",
      filter_european: "европейская",
      restaurant_1: "1. Slovenská krčma",
      restaurant_2: "TUSI",
      restaurant_3: "Galileo",
      restaurant_4: "DAX",
      restaurant_5: "Fellini"
    },
    en: {
      nav_home: "Home",
      nav_map: "Map",
      "nav_reservations": "Reservations",
      hero_title: "Discover Flavors <br>of Bratislava",
      hero_subtitle: "Best restaurants — in a beautiful interface",
      search_placeholder: "Search by name, cuisine...",
      search_button: "Find",
      popular_places: "Popular Places",
      map_title: "Restaurants Map",
      reservations_title: "My Reservations",
      res_restaurant: "Restaurant",
      res_date: "Date",
      res_time: "Time",
      res_people: "People",
      cancel_button: "Cancel",
      confirm_button: "Book",
      filter_all: "all",
      filter_japanese: "japanese",
      filter_french: "french",
      filter_slovak: "slovak",
      filter_asian: "asian",
      filter_european: "european",
      restaurant_1: "1. Slovenská krčma",
      restaurant_2: "TUSI",
      restaurant_3: "Galileo",
      restaurant_4": "DAX",
      restaurant_5: "Fellini"
    },
    ru: {
      nav_home: "Главная",
      nav_map: "Карта",
      nav_reservations: "Бронирование",
      hero_title: "Откройте вкусы <br>Братиславы",
      hero_subtitle: "Лучшие рестораны — в красивом интерфейсе",
      search_placeholder: "Поиск по названию, кухне...",
      search_button: "Найти",
      popular_places: "Популярные места",
      map_title: "Карта ресторанов",
      reservations_title: "Мои бронирования",
      res_restaurant: "Ресторан",
      res_date: "Дата",
      res_time: "Время",
      res_people: "Человек",
      cancel_button: "Отмена",
      confirm_button: "Забронировать",
      filter_all: "все",
      filter_japanese: "японская",
      filter_french: "французская",
      filter_slovak: "словацкая",
      filter_asian: "азиатская",
      filter_european: "европейская",
      restaurant_1: "1. Slovenská krčma",
      restaurant_2: "TUSI",
      restaurant_3: "Galileo",
      restaurant_4: "DAX",
      restaurant_5: "Fellini"
    }
  };
  
  let currentLang = 'sk';
  
  // Set current language from HTML lang attribute
  const htmlLang = document.documentElement.lang;
  if (['sk', 'en', 'ru'].includes(htmlLang)) {
    currentLang = htmlLang;
  }
  
  // Translate function
  const t = (key) => {
    return translations[currentLang][key] || key;
  };
  
  // Update all text elements
  const translatePage = () => {
    document.querySelectorAll('[data-i18n]').forEach(el => {
      const key = el.getAttribute('data-i18n');
      const text = t(key);
      if (el.tagName === 'INPUT' || el.tagName === 'SELECT') {
        el.placeholder = text;
      } else {
        el.innerHTML = text;
      }
    });
    
    // Update select options
    const restaurantSelect = document.getElementById('res-restaurant');
    if (restaurantSelect) {
      restaurantSelect.innerHTML = `
        <option>${t('restaurant_1')}</option>
        <option>${t('restaurant_2')}</option>
        <option>${t('restaurant_3')}</option>
        <option>${t('restaurant_4')}</option>
        <option>${t('restaurant_5')}</option>
      `;
    }
  };
  
  // Language toggle
  const langToggle = document.getElementById('lang-toggle');
  if (langToggle) {
    const langs = ['sk', 'en', 'ru'];
    langToggle.addEventListener('click', () => {
      currentLang = langs[(langs.indexOf(currentLang) + 1) % langs.length];
      document.documentElement.lang = currentLang;
      langToggle.textContent = currentLang;
      translatePage();
    });
  }
  
  // Navigation
  const navItems = document.querySelectorAll('.nav-item');
  const sections = document.querySelectorAll('.section');
  
  navItems.forEach(item => {
    item.addEventListener('click', () => {
      navItems.forEach(nav => {
        nav.classList.remove('active');
        const sectionId = nav.getAttribute('data-section');
        const section = document.getElementById(sectionId);
        if (section) section.classList.remove('active');
      });
      
      item.classList.add('active');
      const targetSectionId = item.getAttribute('data-section');
      const targetSection = document.getElementById(targetSectionId);
      if (targetSection) {
        targetSection.classList.add('active');
        AOS.refresh();
      }
    });
  });
  
  // Initialize AOS
  AOS.init({
    duration: 600,
    once: true,
    offset: 50,
    easing: 'ease-out-cubic'
  });
  
  // Filter buttons
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
    });
  });
  
  // Reservation modal
  const modal = document.getElementById('reservation-modal');
  const closeModal = document.getElementById('close-modal');
  const cancelReservation = document.getElementById('cancel-reservation');
  const confirmReservation = document.getElementById('confirm-reservation');
  
  const openModal = () => {
    modal.classList.add('active');
  };
  
  const closeModalFunc = () => {
    modal.classList.remove('active');
  };
  
  // Initialize reservation button handlers
  const initReservationButtons = () => {
    document.querySelectorAll('.btn-outline').forEach(btn => {
      btn.addEventListener('click', openModal);
    });
  };
  
  // Close modal handlers
  closeModal.addEventListener('click', closeModalFunc);
  cancelReservation.addEventListener('click', closeModalFunc);
  
  // Click outside modal to close
  modal.addEventListener('click', (e) => {
    if (e.target === modal) closeModalFunc();
  });
  
  // Confirm reservation
  confirmReservation.addEventListener('click', () => {
    const restaurant = document.getElementById('res-restaurant').value;
    const date = document.getElementById('res-date').value;
    const time = document.getElementById('res-time').value;
    const people = document.getElementById('res-people').value;
    
    alert(`Бронирование подтверждено! 🎉\n\nРесторан: ${restaurant}\nДата: ${date}\nВремя: ${time}\nГостей: ${people}`);
    closeModalFunc();
  });
  
  // Leaflet Map
  initMap();
  
  // Initial translation
  translatePage();
  initReservationButtons();
  
  console.log('GastroMap loaded ✅');
});

function initMap() {
  const mapEl = document.getElementById('map');
  if (!mapEl) return;
  
  // Bratislava coordinates
  const mapCenter = [48.148, 17.1067];
  const zoom = 14;
  
  const map = L.map(mapEl, {
    center: mapCenter,
    zoom: zoom,
    zoomControl: false,
    attributionControl: false
  });
  
  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);
  
  // Bratislava restaurants markers
  const restaurants = [
    { 
      name: "1. Slovenská krčma",
      lat: 48.1483,
      lng: 17.1124,
      cuisine: "Словакская",
      image: "https://images.unsplash.com/photo-1559396852-46991b05c330?w=800&q=80"
    },
    { 
      name: "TUSI",
      lat: 48.1501,
      lng: 17.1173,
      cuisine: "Вьетнамская",
      image: "https://images.unsplash.com/photo-1595037031676-855dd35464a2?w=800&q=80"
    },
    { 
      name: "Galileo",
      lat: 48.1545,
      lng: 17.1184,
      cuisine: "Европейская",
      image: "https://images.unsplash.com/photo-1556622333-858035c12133?w=800&q=80"
    },
    { 
      name: "DAX",
      lat: 48.1552,
      lng: 17.1119,
      cuisine: "Пицца",
      image: "https://images.unsplash.com/photo-1565299624946-b28f40a0ae33?w=800&q=80"
    },
    { 
      name: "Fellini",
      lat: 48.1538,
      lng: 17.1220,
      cuisine: "Словакская",
      image: "https://images.unsplash.com/photo-1511671727733-5aa2e2fc303c?w=800&q=80"
    }
  ];
  
  restaurants.forEach(r => {
    const icon = L.divIcon({
      html: `<div style="background: #e85d5d; color: white; padding: 6px 12px; border-radius: 20px; font-weight: 600; font-size: 12px;">${r.name}</div>`,
      className: 'custom-marker-icon',
      iconSize: [null, null]
    });
    
    const marker = L.marker([r.lat, r.lng], { icon })
      .addTo(map)
      .bindPopup(`<div style="padding: 12px; background: white; border-radius: 8px;">
        <strong>${r.name}</strong><br>
        🍽️ ${r.cuisine}<br>
        <a href="#home" style="color: #e85d5d; font-weight: 600; text-decoration: none;">Бронировать</a>
      </div>`);
    
    marker.on('click', () => {
      document.getElementById('res-restaurant').innerHTML = `<option selected>${r.name}</option>`;
      openModal();
    });
  });
  
  // Add zoom control
  L.control.zoom({ position: 'bottomright' }).addTo(map);
}

// Update card grid with restaurant data
window.updateCards = function(restaurants) {
  const cardGrid = document.getElementById('card-grid');
  if (!cardGrid) return;
  
  cardGrid.innerHTML = restaurants.map(r => `
    <article class="card" data-aos="fade-up">
      <div class="card-image">
        <img src="${r.image || 'https://images.unsplash.com/photo-1517248135467-4c7edcad34c4?w=800&q=80'}" alt="${r.name}" loading="lazy">
        <span class="card-badge">⭐ 4.8</span>
      </div>
      <div class="card-content">
        <h3 class="card-title">${r.name}</h3>
        <p class="card-subtitle">${r.cuisine || 'Современная'}</p>
        <div class="card-meta">
          <span class="icon-label">📍</span>
          <span class="meta-text">Братислава</span>
          <span class="icon-label">💰</span>
          <span class="meta-text">${r.price || '20-40 €'}</span>
          <span class="icon-label">🍽️</span>
          <span class="meta-text">${r.cuisine || 'Современная'}</span>
        </div>
        <button class="btn btn-outline" onclick="openModal()">Забронировать</button>
      </div>
    </article>
  `).join('');
};