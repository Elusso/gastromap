// GastroMap — JS Logic
document.addEventListener('DOMContentLoaded', () => {
  // NAVIGATION
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
        // Trigger AOS animation
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

  // Search
  const searchInput = document.querySelector('.search-bar input');
  searchInput.addEventListener('keypress', (e) => {
    if (e.key === 'Enter') {
      const query = searchInput.value.trim();
      if (query) {
        console.log('Search:', query);
        alert(`Поиск: ${query}`);
      }
    }
  });

  // Filters
  const filterBtns = document.querySelectorAll('.filter-btn');
  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      console.log('Filter by:', btn.textContent.trim());
    });
  });

  // Reservation Buttons
  const bookButtons = document.querySelectorAll('.btn-outline');
  bookButtons.forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.card');
      const restaurantName = card.querySelector('.card-title')?.textContent || 'Ресторан';
      showReservationForm(restaurantName);
    });
  });

  function showReservationForm(restaurantName) {
    const date = document.getElementById('res-date');
    const time = document.getElementById('res-time');
    const people = document.getElementById('res-people');
    alert(`Бронирование: ${restaurantName}\n\nДля завершения введите дату, время и количество гостей.`);
  }

  // Menu item buttons
  const menuItems = document.querySelectorAll('.menu-item');
  menuItems.forEach(item => {
    item.addEventListener('click', (e) => {
      if (e.target.tagName !== 'BUTTON') {
        const title = item.querySelector('h4')?.textContent;
        alert(`Блюдо: ${title}\nДетали и заказ — в карточке бронирования.`);
      }
    });
  });

  // Leaflet Map
  initMap();

  console.log('GastroMap loaded ✅');
});

function initMap() {
  if (!document.getElementById('map')) return;
  
  // Yekaterinburg coordinates
  const mapCenter = [56.8389, 60.6122];
  const zoom = 13;
  
  const map = L.map('map', {
    center: mapCenter,
    zoom: zoom,
    zoomControl: false,
    attributionControl: false
  });

  L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
    maxZoom: 19,
    attribution: '© OpenStreetMap'
  }).addTo(map);

  // Fake markers for demo
  const restaurants = [
    { name: "Sushi Bar Izumo", lat: 56.8390, lng: 60.6120 },
    { name: "Le French", lat: 56.8410, lng: 60.6150 },
    { name: "Olivier Garden", lat: 56.8370, lng: 60.6180 },
    { name: "Pierogi House", lat: 56.8400, lng: 60.6100 }
  ];

  restaurants.forEach(r => {
    L.marker([r.lat, r.lng], {
      icon: new L.Icon({
        iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/markers_default-green.png',
        iconSize: [40, 40],
        iconAnchor: [20, 40]
      }),
      title: r.name
    }).addTo(map).bindPopup(`<div style="padding:10px; color:#f7f8f8;"><strong>${r.name}</strong><br>⭐ 4.8<br>📍 Показать на карте</div>`);
  });

  // Zoom control (custom position)
  L.control.zoom({
    position: 'bottomright'
  }).addTo(map);
}
