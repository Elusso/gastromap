# GastroMap Website Code Review

**Date:** 2026-05-04  
**Reviewer:** Hermes Agent  
**Scope:** Apple design principles, mobile-first responsiveness, accessibility, performance, code organization

---

## Executive Summary

GastroMap demonstrates a solid foundation with Apple-inspired design patterns, but has significant gaps in accessibility, mobile-first patterns, and code organization. The codebase exhibits a "design-first" approach with styling well-structured but lacks critical functionality for production use.

---

## 1. Apple Design Principles (Clean, Minimal)

### ✅ Strengths

| File | Assessment | Details |
|------|------------|---------|
| `styles/main.css` | **Good** | Clean color system with CSS variables (`--apple-accent`, `--apple-dark`), minimal overrides |
| `index.html` | **Good** | Semantic structure with proper header/main/nav elements, clean visual hierarchy |
| `app.js` | **Good** | Clear separation of concerns with dedicated init functions |
| `styles/main.css` lines 5-14 | **Excellent** | Thoughtful Apple color palette with proper semantic naming |

### ⚠️ Issues Found

**Issue 1: Inconsistent Typography Scaling**
- **Location:** `styles/main.css` lines 42, 74, 487
- **Severity:** Medium
- **Recommendation:** Use `rem` units instead of `px` for better font scaling. Apple's design relies on relative text sizing. Example:
  ```css
  /* Current */
  .header-title { font-size: 24px; }
  .section-title { font-size: 28px; }
  
  /* Better */
  .header-title { font-size: 1.5rem; }  /* ~24px at 16px base */
  .section-title { font-size: 1.75rem; }
  ```

**Issue 2: Shadow Overload**
- **Location:** `styles/main.css` lines 13, 91, 468, 838
- **Severity:** Medium
- **Recommendation:** Apple designs use subtle, sparse shadows. The current `--card-shadow` is defined but not consistently applied. Some elements have inconsistent shadow values. Use `box-shadow: none` where no visual depth is needed.

**Issue 3: Missing Apple Icon Styling**
- **Location:** `index.html` throughout
- **Severity:** Low
- **Recommendation:** Apple uses SF Symbols with specific stroke widths. Consider using actual SF Symbols or iOS-style iconography rather than emoji for consistency.

---

## 2. Mobile-First Responsive Design

### ✅ Strengths

| File | Assessment | Details |
|------|------------|---------|
| `index.html` line 5 | **Good** | Proper viewport meta tag with `user-scalable=no` |
| `styles/main.css` line 244-251 | **Good** | Bottom navigation positioned correctly with `position: fixed` |
| `styles/main.css` line 30 | **Good** | Content padding accounts for bottom nav height |

### ❌ Critical Issues

**Issue 4: Missing Mobile Breakpoints**
- **Location:** `styles/main.css` entire file
- **Severity:** High
- **Problem:** No `@media` queries exist. A fully responsive mobile design requires breakpoints at:
  - 320px (small phones)
  - 375px (iPhone-sized)
  - 414px (large phones)
  - 768px (tablets)
  
- **Recommendation:**
  ```css
  /* Add responsive breakpoints */
  @media (max-width: 414px) {
    .header-title { font-size: 20px; }
    .section-title { font-size: 24px; }
    .restaurant-card { width: 90vw; }
  }
  
  @media (min-width: 768px) {
    .app-container { max-width: 768px; margin: 0 auto; }
    .section-header { max-width: 768px; margin: 0 auto; }
  }
  ```

**Issue 5: Card Layout Not Responsive**
- **Location:** `styles/main.css` lines 85-106, `index.html` lines 36-51
- **Severity:** High
- **Problem:** `.restaurant-card` has fixed `width: 280px`. On mobile devices under 320px, cards overflow the viewport. iOS design uses `100% - padding` or `calc(100vw - 2rem)`.

- **Recommendation:**
  ```css
  .restaurant-card {
    width: calc(100% - 24px);
    /* or use max-width: 280px for larger screens */
    max-width: 280px;
    flex-shrink: 0; /* Keep horizontal scroll needed */
  }
  ```

**Issue 6: Image Loading Performance**
- **Location:** `index.html` lines 37-170, 183-207
- **Severity:** High
- **Problem:** All images missing `loading="lazy"` attribute and no srcset for different screen densities.

- **Recommendation:**
  ```html
  <!-- Example fix -->
  <img src="image.jpg" 
       srcset="image@2x.jpg 2x, image@3x.jpg 3x" 
       loading="lazy" 
       alt="Description"
       class="card-image">
  ```

---

## 3. Accessibility (ARIA, Semantic HTML)

### ❌ Critical Issues

**Issue 7: No ARIA Labels on Interactive Elements**
- **Location:** `index.html` lines 318-335
- **Severity:** High
- **Problem:** Bottom navigation buttons have no ARIA labels, reducing content for screen readers.

- **Current:**
  ```html
  <button class="nav-item active" data-tab="explore">
    <span class="nav-icon">🗺️</span>
    <span class="nav-label">Искать</span>
  </button>
  ```

- **Recommended:**
  ```html
  <button class="nav-item active" data-tab="explore" aria-label="Show map and restaurants" aria-controls="tab-explore">
    <span class="nav-icon" aria-hidden="true">🗺️</span>
    <span class="nav-label">Искать</span>
  </button>
  ```

**Issue 8: Missing Semantic Sectioning**
- **Location:** `index.html` lines 176-210
- **Severity:** High
- **Problem:** Offers section lacks proper `section` element with heading level.

- **Current:**
  ```html
  <div class="tab-content" id="tab-offers">
    <div class="section-header">
  </div>
  ```

- **Recommended:**
  ```html
  <section class="tab-content" aria-labelledby="offers-heading" id="tab-offers">
    <header class="section-header">
      <h2 id="offers-heading" class="section-title">Акции</h2>
  </header>
  ```

**Issue 9: No Keyboard Navigation Support**
- **Location:** `app.js` and `index.html` throughout
- **Severity:** High
- **Problem:** Detail sheet, detail page, and bottom navigation lack keyboard accessibility.

- **Recommendation:**
  - Add keyboard shortcuts: ESC to close modals, arrow keys for carousel
  - Ensure focus management: restore focus when modals close
  - Add `tabindex="0"` where needed, remove `tabindex="0"` from elements that shouldn't be focusable

**Issue 10: Contrast Issues**
- **Location:** `styles/main.css` lines 5-13
- **Severity:** Medium
- **Problem:** Text color `#1a1a1d` on background `#f5f5f7` has ratio of 11.9:1 (passes AA), but some tag elements use `#8e8e93` which may fail contrast tests on lighter backgrounds.

- **Recommendation:** Run full contrast checks using WebAIM Contrast Checker. Consider:
  - Darker gray for secondary text for accessibility
  - Ensure tags have sufficient contrast ratio (4.5:1 minimum)

**Issue 11: Missing Focus States**
- **Location:** `styles/main.css` lines 173-189
- **Severity:** Medium
- **Problem:** Toggle buttons and many interactive elements have `:hover` but no `:focus` state.

- **Recommendation:**
  ```css
  .toggle-btn:focus-visible {
    outline: 2px solid var(--apple-accent);
    outline-offset: 2px;
  }
  
  .nav-item:focus-visible {
    outline: 2px solid var(--apple-accent);
    outline-offset: 4px;
  }
  ```

---

## 4. Performance Best Practices

### ✅ Strengths

| File | Assessment | Details |
|------|------------|---------|
| `styles/main.css` line 25-26 | **Good** | Proper system font stack with fallback to system UI |
| `app.js` line 1-2 | **Good** | Event listener on `DOMContentLoaded` |
| `styles/main.css` lines 290, 284 | **Good** | hardware-accelerated CSS transitions with `transform` |

### ⚠️ Issues Found

**Issue 12: JavaScript File Too Large**
- **Location:** `app.js` (233 lines)
- **Severity:** Medium
- **Problem:** Single JavaScript file handles all functionality, making caching inefficient and code harder to maintain.

- **Recommendation:** Split into modules:
  - `nav.js` - Navigation tab management
  - `restaurant.js` - Card interactions
  - `detail-sheet.js` - Bottom sheet logic
  - `carousel.js` - Image slider logic

**Issue 13: No Critical CSS in `<head>`**
- **Location:** `index.html` lines 1-8
- **Severity:** Medium
- **Problem:** All CSSLoads in order and blocks rendering. For mobile, this delays First Contentful Paint.

- **Recommendation:**
  ```html
  <!-- Critical styles in head -->
  <style>
    /* Critical CSS: hero, header, bottom nav */
    body { padding-bottom: 84px; }
    .app-header { ... }
    .bottom-nav { ... }
  </style>
  <!-- Non-critical CSS deferred -->
  <link rel="stylesheet" href="styles/main.css" media="print" onload="this.media='all'">
  ```

**Issue 14: Missing Image Optimization Hints**
- **Location:** `index.html` lines 37-170
- **Severity:** Low
- **Problem:** No `width`/`height` attributes, no `sizes` attribute, missing aspect ratio preservation.

- **Recommendation:**
  ```html
  <div class="card-image" 
       style="background-image: url('...')"
       aria-role="img" 
       aria-label="La Trattoria restaurant interior">
  </div>
  ```

---

## 5. Code Organization

### ✅ Strengths

| File | Assessment | Details |
|------|------------|---------|
| `styles/main.css` lines 1-20 | **Good** | Well-structured :root for theming |
| `styles/main.css` structure | **Good** | Logical grouping: components, navigation, details |
| `app.js` lines 1-14 | **Good** | Clear `initApp()` function orchestrates initialization |

### ❌ Critical Issues

**Issue 15: JavaScript Scope Bug (Critical)**
- **Location:** `app.js` line 122
- **Severity:** Critical
- **Problem:** `closeDetailSheet` function is used before declaration, though JavaScript hoisting allows this, it's poor practice and creates maintainability issues.

- **Current:**
  ```javascript
  // Line 51: used here
  card.addEventListener('click', function() {
    const id = this.dataset.id;
    openDetailSheet(id);  // Calls function
  });
  
  // Line 122: defined here - AFTER usage
  closeDetailSheet = function() { ... }
  ```

- **Recommended:**
  ```javascript
  // Define ALL functions BEFORE event handlers
  function closeDetailSheet() {
    document.getElementById('detail-sheet').classList.remove('open');
  }
  
  // Then attach event handlers
  // ...
  ```

**Issue 16: Inconsistent Naming Convention**
- **Location:** Entire codebase
- **Severity:** Medium
- **Problem:** Mixed Russian/English in class names (`tab-content`, `section-header`), IDs (`res-date`, `map-grid`), and content.

- **Current Mix:**
  | File | Class Name | Language |
  |------|------------|----------|
  | `index.html` | `tab-content` | English |
  | `index.html` | `section-header` | English |
  | `index.html` | `offer-card` | English |
  | `index.html` | `news-card` | English |
  | `styles/main.css` | `.card-rating` | English |
  | `styles/main.css` | `.map-container` | English |
  
  But content in HTML is mostly Russian.

- **Recommendation:** Choose ONE language for class names (English standard in web dev). Keep content language as desired, but class names should be consistent.

**Issue 17: CSS Organization - Repeated Selectors**
- **Location:** `styles/main.css` lines 516-556, 763-818
- **Severity:** Low
- **Problem:** `.menu-item` and `.nav-item` have overlapping styles but different implementations.

- **Recommendation:** Extract shared styles into base classes:
  ```css
  .ui-flex-item {
    display: flex;
    align-items: center;
    gap: 12px;
  }
  
  .menu-item, .nav-item {
    @extend .ui-flex-item;
  }
  ```

**Issue 18: Magic Values**
- **Location:** `styles/main.css` lines 284, 289, 200
- **Severity:** Medium
- **Problem:** Hardcoded z-indexes, percentage values without context.

- **Recommendation:**
  ```css
  :root {
    --z-bottom-nav: 100;
    --z-detail-sheet: 90;
    --z-detail-page: 1000;
  }
  ```

---

## Detailed Action Plan

### Immediate (Before Production)

1. **Fix JavaScript scope issue** - Move `closeDetailSheet` function definition before usage (Issue 15)
2. **Add ARIA attributes** - Add labels, roles, and keyboard support (Issues 7, 8, 9)
3. **Add mobile breakpoints** - Implement @media queries for responsive design (Issue 4)
4. **Add keyboard navigation** - Implement focus management and keyboard shortcuts (Issue 9)
5. **Fix restaurant card overflow** - Use responsive width calculations (Issue 6)

### Short-term (1-2 weeks)

6. **Add loading attributes** - Include `loading="lazy"` on images (Issue 11)
7. **Add focus states** - Implement `:focus-visible` for all interactive elements (Issue 10)
8. **Split JavaScript** - Modularize code into separate files (Issue 12)
9. **Critical CSS** - Inline critical styles for fast first paint (Issue 13)
10. **_normalize CSS** - Add CSS reset/normalize for consistency (not currently present)

### Medium-term (1 month)

11. **Standardize naming** - Enforce English-only class names (Issue 16)
12. **Extract constants** - Use CSS variables for magic values (Issue 18)
13. **Test with screen readers** - Verify accessibility with VoiceOver/Android TalkBack
14. **Add error boundaries** - Improve error handling in JavaScript (Issue 2)

### Long-term (Ongoing)

15. **Performance monitoring** - Add Lighthouse CI to catch regressions
16. **Unit tests** - Add Jest tests for JavaScript functions
17. **Animation improvements** - Improve smooth transitions with proper timing functions
18. **i18n support** - Prepare for internationalization if expanding beyond Russian

---

## Files Analyzed

| File | Size | Lines | Main Issues |
|------|------|-------|-------------|
| `/root/gastromap/index.html` | 21KB | 466 | Missing ARIA, semantic issues, responsive |
| `/root/gastromap/styles/main.css` | 14KB | 885 | No media queries, shadow inconsistency, focus states |
| `/root/gastromap/scripts/app.js` | 7KB | 233 | Scope bugs, no modularity, error handling |
| `/root/gastromap/audit_findings.md` | 7KB | 181 | Already documented critical issues |

---

## Summary Scores

| Category | Score | Notes |
|----------|-------|-------|
| Apple Design | 7/10 | Good color and layout, missing typographic nuance |
| Mobile-First | 4/10 | No breakpoints, responsive issues |
| Accessibility | 3/10 | Missing ARIA, keyboard, focus states |
| Performance | 6/10 | Good structure, needs lazy loading, critical CSS |
| Code Organization | 6/10 | Clear but inconsistent naming, monolithic JS |

**Overall Score: 5.3/10**

GastroMap has solid visual design foundations but requires significant work before production deployment, particularly around accessibility and responsive design.

---

*Review completed by Hermes Agent on 2026-05-04*
