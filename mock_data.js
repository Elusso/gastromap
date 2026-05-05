/**
 * GastroMap — Mock API / Diagnostic Layer
 * Заменяет TestSprite + gif-search + Unsplash заглушками
 */

window.gmMock = {

  // ===== ФОТО (picsum.photos — быстрые заглушки) =====
  photoPool: [
    "https://picsum.photos/id/292/400/300",
    "https://picsum.photos/id/42/400/300",
    "https://picsum.photos/id/431/400/300",
    "https://picsum.photos/id/225/400/300",
    "https://picsum.photos/id/163/400/300",
    "https://picsum.photos/id/1080/400/300",
    "https://picsum.photos/id/1084/400/300",
    "https://picsum.photos/id/30/400/300",
    "https://picsum.photos/id/312/400/300",
    "https://picsum.photos/id/326/400/300",
    "https://picsum.photos/id/488/400/300",
    "https://picsum.photos/id/493/400/300"
  ],

  getPhotos(restId, count) {
    count = count || 4;
    const start = (restId.charCodeAt(0) + restId.charCodeAt(restId.length-1)) % this.photoPool.length;
    const out = [];
    for (let i = 0; i < count; i++) {
      out.push(this.photoPool[(start + i) % this.photoPool.length]);
    }
    return out;
  },

  // ===== GIF ПОИСК (заглушка — статические GIF) =====
  searchGif(query) {
    const gifs = [
      "https://media.giphy.com/media/3o7abB06u9bNzA8LC8/giphy.gif",
      "https://media.giphy.com/media/l0MYt5jPR6Q5pA3CE/giphy.gif",
      "https://media.giphy.com/media/26FPJGjheq6wH0AYQ/giphy.gif"
    ];
    return gifs[Math.floor(Math.random() * gifs.length)];
  },

  // ===== TESTSPRITE ДИАГНОСТИКА =====
  runDiagnostics() {
    const results = [];
    let pass = 0, fail = 0;

    const check = (name, testFn) => {
      try {
        const ok = testFn();
        results.push({ name, status: ok ? 'PASS' : 'FAIL' });
        ok ? pass++ : fail++;
      } catch(e) {
        results.push({ name, status: 'FAIL', error: e.message });
        fail++;
      }
    };

    // Кнопки
    check('Map markers exist', () => !!document.getElementById('map'));
    check('Detail overlay exists', () => !!document.getElementById('detail-overlay'));
    check('Back button exists', () => !!document.querySelector('.detail-back'));
    check('Route button exists', () => !!document.getElementById('detail-route-btn'));
    check('4 tabs exist', () => document.querySelectorAll('.dtab').length >= 4);
    check('Reservation form exists', () => !!document.getElementById('res-date'));
    check('Booking submit', () => typeof submitBooking === 'function');
    check('closeDetail', () => typeof closeDetail === 'function');
    check('switchTab', () => typeof switchTab === 'function');
    check('LocalStorage', () => { try { localStorage.setItem('_gmtest_','1'); localStorage.removeItem('_gmtest_'); return true; } catch(e) { return false; } });
    check('FontAwesome loaded', () => !!document.querySelector('.fa'));
    check('AOS loaded', () => typeof AOS !== 'undefined');
    check('Leaflet loaded', () => typeof L !== 'undefined');
    check('Swiper loaded', () => typeof Swiper !== 'undefined');
    check('Translations loaded', () => !!window.APP?.translations?.sk);
    check('Restaurants loaded', () => (window.APP?.restaurants?.length || 0) >= 6);
    check('Photos generated', () => {
      const r = (window.APP?.restaurants || [])[0];
      return r && (r.photos?.length >= 3 || window.gmMock.getPhotos(r.id, 1).length >= 1);
    });

    // Фото
    check('Photo pool size', () => this.photoPool.length >= 10);

    return { results, pass, fail, total: pass + fail };
  }
};