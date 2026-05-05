document.addEventListener('DOMContentLoaded', function() {
  initApp();
});
function initApp() {
  initNavigation();
  initRestaurantCards();
  initMapMarkers();
  initDetailSheets();
  initDetailPage();
  initCarousel();
  initTabs();
  initReservation();
  initMapToggle();
}

// Navigation
function initNavigation() {
  const navItems = document.querySelectorAll('.nav-item');
  const contents = document.querySelectorAll('.tab-content');

  navItems.forEach(item => {
    item.addEventListener('click', function(e) {
      e.preventDefault();
      
      // Update nav active states
      navItems.forEach(n => n.classList.remove('active'));
      this.classList.add('active');

      // Show corresponding content
      const tab = this.dataset.tab;
      contents.forEach(c => c.classList.remove('active'));
      
      const section = document.getElementById(`tab-${tab}`);
      if (section) section.classList.add('active');

      // Hide detail page if open
      document.getElementById('detail-page').classList.remove('active');
    });
  });
}

// Restaurant Cards Click Handler
function initRestaurantCards() {
  const cards = document.querySelectorAll('.restaurant-card');
  cards.forEach(card => {
    card.addEventListener('click', function() {
      const id = this.dataset.id;
      openDetailSheet(id);
    });
  });
}

// Map Markers Click Handler
function initMapMarkers() {
  const markers = document.querySelectorAll('.map-marker');
  markers.forEach(marker => {
    marker.addEventListener('click', function(e) {
      e.stopPropagation();
      const id = this.dataset.id;
      openDetailSheet(id);
    });
  });
}

// Toggle Cards/Map View
function initMapToggle() {
  const toggleBtns = document.querySelectorAll('.toggle-btn');
  const list = document.querySelector('.restaurant-list');
  const mapGrid = document.querySelector('.map-grid');

  toggleBtns.forEach(btn => {
    btn.addEventListener('click', function() {
      // Remove active from all buttons first
      toggleBtns.forEach(b => b.classList.remove('active'));
      // Then activate the clicked one
      this.classList.add('active');

      if (this.dataset.target === 'list') {
        list.style.display = 'block';
        mapGrid.style.display = 'none';
      } else {
        list.style.display = 'none';
        mapGrid.style.display = 'block';
      }
    });
  });
}

// Detail Sheet (Bottom Popup)
function openDetailSheet(id) {
  const sheet = document.getElementById('detail-sheet');
  const closeBtn = document.getElementById('close-detail');
  
  // Fill with data based on ID (XSS-safe using textContent)
  const card = document.querySelector(`.restaurant-card[data-id="${id}"]`);
  if (card) {
    const title = card.querySelector('.card-title').textContent;
    const desc = card.querySelector('.card-desc').textContent;
    const image = card.querySelector('.card-image').style.backgroundImage;
    const tags = card.querySelector('.card-tags').innerHTML;
    const rating = card.querySelector('.card-rating').innerHTML;
    
    document.getElementById('sheet-img').style.backgroundImage = image;
    document.getElementById('sheet-title').textContent = title;
    document.getElementById('sheet-desc').textContent = desc;
    // XSS-safe: insert tags as text, not HTML
    const tagContainer = document.getElementById('sheet-tags');
    tagContainer.innerHTML = '';
    const cardTags = card.querySelector('.card-tags').children;
    for (let tag of cardTags) {
      const span = document.createElement('span');
      span.className = tag.className;
      span.textContent = tag.textContent;
      tagContainer.appendChild(span);
    }
    document.getElementById('sheet-rating').innerHTML = rating;
  }

  sheet.classList.add('open');
}

closeDetailSheet = function() {
  document.getElementById('detail-sheet').classList.remove('open');
}

function initDetailSheets() {
  document.getElementById('close-detail').addEventListener('click', closeDetailSheet);
  // Also close sheet when clicking outside
  document.getElementById('detail-sheet').addEventListener('click', function(e) {
    if (e.target === document.getElementById('detail-sheet')) {
      closeDetailSheet();
    }
  });
}

// Detail Page (Full Screen)
function initDetailPage() {
  const detailPage = document.getElementById('detail-page');
  const closeBtn = document.querySelector('.detail-close');

  // Close handler
  closeBtn.addEventListener('click', function() {
    detailPage.classList.remove('active');
  });

  // Close on overlay click
  detailPage.addEventListener('click', function(e) {
    if (e.target === detailPage) {
      detailPage.classList.remove('active');
    }
  });

  // Close when navigation tabs are clicked
  const navItems = document.querySelectorAll('.nav-item');
  navItems.forEach(item => {
    item.addEventListener('click', function() {
      detailPage.classList.remove('active');
    });
  });
}

// Carousel
function initCarousel() {
  const slides = document.querySelectorAll('.carousel-slide');
  const indicators = document.querySelectorAll('.indicator');

  indicators.forEach((indicator, index) => {
    indicator.addEventListener('click', function() {
      slides.forEach(s => s.classList.remove('active'));
      indicators.forEach(i => i.classList.remove('active'));
      
      slides[index].classList.add('active');
      indicator.classList.add('active');
    });
  });
}

// Tab Switching (Details Page)
function initTabs() {
  const tabLinks = document.querySelectorAll('.tab-link');
  const sections = document.querySelectorAll('.detail-section');

  tabLinks.forEach(link => {
    link.addEventListener('click', function() {
      // Update tab styles
      tabLinks.forEach(t => t.classList.remove('active'));
      this.classList.add('active');

      // Get tab name
      const tabName = this.dataset.detailTab;

      // Hide all sections, show target
      const targetSection = document.querySelector(`.detail-section[data-section="${tabName}"]`);
      if (targetSection) {
        sections.forEach(s => s.classList.remove('active'));
        targetSection.classList.add('active');
      }
    });
  });
}

// Reservation: Table Selection
function initReservation() {
  const tables = document.querySelectorAll('.table');
  const dateInput = document.getElementById('res-date');
  const timeSelect = document.getElementById('res-time');
  const bookBtn = document.querySelector('.book-btn');

  // Table selection
  tables.forEach(table => {
    table.addEventListener('click', function() {
      tables.forEach(t => t.classList.remove('selected'));
      this.classList.add('selected');
    });
  });

  // Book button
  if (bookBtn) {
    bookBtn.addEventListener('click', function() {
    const table = document.querySelector('.table.selected');
    const date = dateInput.value;
    const time = timeSelect.value;

    if (table && date && time) {
      alert(`Table reserved!\nTable: ${table.dataset.table}\nDate: ${date}\nTime: ${time}`);
      closeDetailSheet();
      document.getElementById('detail-page').classList.remove('active');
    } else {
      alert('Please select a table and date/time');
    }
    });
  }
}
