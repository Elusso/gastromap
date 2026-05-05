# GastroMap - Architecture Documentation

Apple-style modern restaurant discovery mobile web application

---

## 🎨 Design System

### Color Palette (Apple-style)
```css
:root {
  --apple-bg: #f5f5f7;        /* Light background */
  --apple-dark: #1a1a1d;      /* Dark text/accent */
  --apple-accent: #ff9500;    /* Apple-style orange (primary) */
  --apple-green: #34c759;     /* Success/active */
  --apple-red: #ff3b30;       /* Error */
  --apple-gray: #8e8e93;      /* Secondary text */
  --apple-gray-light: #afafaf;/* Tertiary text */
  --card-shadow: 0 4px 12px rgba(0,0,0,0.08);
  --header-height: 74px;
  --bottom-nav-height: 68px;
}
```

### Typography (System Fonts)
```css
body {
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', 
               Roboto, 'Helvetica Neue', Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
}
```

---

## 🏗️ Component Structure

```
GastroMap App
├── Header Component
│   ├── Restaurant Map Title
│   └── Accent Title Styling
│
├── Main Content Area
│   ├── Explore Tab (Active by Default)
│   │   ├── Map Toggle Headers (Cards | Map)
│   │   ├── Map View
│   │   │   ├── Map Grid Background
│   │   │   └── Map Markers (Restaurant Locations)
│   │   └── List View
│   │       └── Restaurant Cards (Horizontal Scroll)
│   │           ├── Restaurant Image
│   │           ├── Title & Description
│   │           ├── Tags (Cuisine types)
│   │           └── Rating & Review Count
│   │
│   ├── Offers Tab
│   │   ├── Section Header
│   │   └── Offer Cards
│   │       ├── Discount Badge
│   │       ├── Title & Description
│   │       └── Expiry Date
│   │
│   ├── News Tab
│   │   ├── Section Header
│   │   └── News Cards (Vertical List)
│   │       ├── News Image
│   │       ├── Title & Excerpt
│   │       ├── Timestamp
│   │       └── Read More Link
│   │
│   └── Profile Tab
│       ├── User Avatar
│       ├── Profile Info (Name)
│       ├── Stats Grid (Bookings, Offers, Points)
│       └── Menu Items
│           ├── Bookings
│           ├── Used Offers
│           ├── Point History
│           ├── loyalty Card
│           ├── Settings
│           └── About App
│
├── Bottom Navigation (4 Tabs)
│   ├── Explore Icon & Label
│   ├── Offers Icon & Label
│   ├── News Icon & Label
│   └── Profile Icon & Label
│
├── Detail Sheet (Bottom Popup)
│   ├── Drag Handle
│   ├── Close Button
│   ├── Restaurant Image
│   ├── Title & Description
│   ├── Tags Container
│   └── Rating Display
│
└── Detail Page (Full Screen)
    ├── Detail Header
    │   ├── Back Button
    │   └── Restaurant Title
    │
    ├── Image Carousel
    │   ├── Multiple Slides
    │   ├── Active Indicator
    │   └── Previous/Next Controls
    │
    ├── Info Section
    │   ├── Address with Map Icon
    │   └── Cuisine Tags
    │
    ├── Detail Tabs
    │   ├── Description
    │   ├── Menu
    │   ├── Reservation
    │   └── Reviews
    │
    ├── Tab Contents
    │   ├── Description Tab
    │   │   ├── Atmosphere Text
    │   │   └── Chef Info
    │   │
    │   ├── Menu Tab
    │   │   └── Menu Items
    │   │       ├── Dish Image
    │   │       ├── Name & Description
    │   │       └── Price
    │   │
    │   ├── Reservation Tab
    │   │   ├── Interactive Table Map
    │   │   │   ├── Table Selection
    │   │   │   └── Selected State
    │   │   ├── Date Picker (Calendar)
    │   │   ├── Time Picker (Dropdown)
    │   │   └── Book Button
    │   │
    │   └── Reviews Tab
    │       ├── Existing Reviews
    │       │   ├── Reviewer Name
    │       │   ├── Star Rating
    │       │   ├── Comment
    │       │   └── Date
    │       └── Add Review Button
    │
    └── Reservation Modal (in sheet)
        ├── Table Map with Available/Reserved Marks
        ├── Date Selection (HTML5 Date Input)
        ├── Time Selection (Dropdown)
        └── Confirm Booking Button
```

---

## 📁 File Organization

```
/root/gastromap/
├── index.html              # Main HTML structure
├── styles/
│   └── main.css           # Apple-style CSS (500+ lines)
├── scripts/
│   └── app.js             # Vanilla JS functionality (233 lines)
├── assets/
│   ├── images/            # Restaurant images
│   └── icons/             # SVG icons (optional)
└── ARCHITECTURE.md        # This file
```

---

## 🧩 Component Details

### 1. Bottom Navigation System
```html
<nav class="bottom-nav">
  <button class="nav-item active" data-tab="explore">
    <span class="nav-icon">🗺️</span>
    <span class="nav-label">Искать</span>
  </button>
  <button class="nav-item" data-tab="offers">
    <span class="nav-icon">🏷️</span>
    <span class="nav-label">Акции</span>
  </button>
  <button class="nav-item" data-tab="news">
    <span class="nav-icon">📰</span>
    <span class="nav-label">Новости</span>
  </button>
  <button class="nav-item" data-tab="profile">
    <span class="nav-icon">👤</span>
    <span class="nav-label">Профиль</span>
  </button>
</nav>
```

### 2. Explore Tab with Map Toggle
```html
<div class="map-container">
  <div class="map-header">
    <button class="toggle-btn active" data-target="list">
      📍 Cards
    </button>
    <button class="toggle-btn" data-target="map">
      🗺️ Map
    </button>
  </div>
  
  <!-- List View -->
  <div class="restaurant-list">...</div>
  
  <!-- Map View -->
  <div class="map-placeholder">
    <div class="map-grid">
      <div class="map-marker" data-id="1" style="top: 25%; left: 30%;">🍽️</div>
    </div>
  </div>
</div>
```

### 3. Detail Page with Tabs
```html
<div class="detail-page" id="detail-page">
  <div class="detail-tabs">
    <button class="tab-link active" data-detail-tab="description">
      Описание
    </button>
    <button class="tab-link" data-detail-tab="menu">Меню</button>
    <button class="tab-link" data-detail-tab="reservation">
      Бронирование
    </button>
    <button class="tab-link" data-detail-tab="reviews">Отзывы</button>
  </div>
  
  <div class="detail-content">
    <div class="detail-section active" data-section="description">...</div>
    <div class="detail-section" data-section="menu">...</div>
    <div class="detail-section" data-section="reservation">...</div>
    <div class="detail-section" data-section="reviews">...</div>
  </div>
</div>
```

### 4. Interactive Reservation
```html
<div class="detail-section" data-section="reservation">
  <div class="table-map">
    <div class="table" data-table="1" style="top: 20%; left: 30%;">1</div>
    <div class="table" data-table="2" style="top: 20%; left: 60%;">2</div>
    <div class="table selected" data-table="3" style="top: 50%; left: 45%;">3</div>
  </div>
  
  <div class="date-picker">
    <div class="date-input">
      <label>📅</label>
      <input type="date" id="res-date">
    </div>
    <div class="time-input">
      <label>⏰</label>
      <select id="res-time">
        <option>12:00</option>
        <option>13:00</option>
        <option>14:00</option>
      </select>
    </div>
    <button class="book-btn">Забронировать</button>
  </div>
</div>
```

---

## 🔄 State Management

### Active Tab Tracking
```javascript
// Bottom nav tabs: explore | offers | news | profile
// Detail page tabs: description | menu | reservation | reviews
```

### Modal States
- **Detail Sheet**: Bottom sheet with restaurant info (open/close)
- **Detail Page**: Full screen page with detailed info
- **Reservation Modal**: Time/date + table selection

---

## 🎯 Key Features

1. **Map Toggle**: Switch between list view and grid map view
2. **Interactive Cards**: Tap to see restaurant details
3. **Bottom Sheet**: Quick info popup from map/list
4. **Detail Page**: Full restaurant information with tabs
5. **Carousel**: Image galleries with indicators
6. **Tab Navigation**: Smooth switching between content sections
7. **Reservation**: Table selection, date/time picker, booking confirmation
8. **Responsive Design**: Mobile-first approach with Apple design patterns

---

## 📱 Mobile-First Design Considerations

- Fixed bottom navigation (68px height)
- Scrollable content area with bottom padding (84px)
- Touch-friendly targets (44px+ height)
- Swipe-optimized carousel
- Bottom sheet animation (cubic-bezier easing)
- CSS variables for easy theming
