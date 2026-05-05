# GastroMap Website Audit Report

## Executive Summary
Thorough security and functionality audit of the GastroMap website. Multiple critical and high-priority issues identified requiring immediate attention.

---

## 1. CRITICAL SECURITY VULNERABILITIES

### 1.1 XSS Vulnerability in Detail Sheet (CRITICAL)
**Location:** `app.js` lines 104-108, `index.html` lines 341-346

**Issue:** Direct insertion of unchecked restaurant card content into the detail sheet using `innerHTML`. An attacker could inject malicious HTML/JavaScript through restaurant tags or other fields.

**Proof of Concept:**
```javascript
// If a malicious restaurant is added with tags like:
<span class="tag"><script>alert('XSS')</script></span>
// This would execute when the detail sheet renders
```

**Fix Required:** Use `textContent` for user-controlled content or sanitize HTML before insertion.

### 1.2 XSS Vulnerability in Reservation Alert (CRITICAL)
**Location:** `app.js` lines 200-205

**Issue:** Tables use `dataset.table` directly in alert() which could be exploited if table IDs are user-controllable.

### 1.3 No CSRF Protection on Form Submissions
**Location:** `index.html` lines 415-440 (reservation section)

**Issue:** The reservation form has no CSRF tokens, input validation, or server-side validation. The form appears to be client-side only, making it impossible to securely process reservations.

### 1.4 External Image Loading (SECURITY/RELIABILITY)
**Location:** `index.html` lines 37-170 (picsum.photos)

**Issue:** All restaurant images load from external domain picsum.photos without integrity hashing or fallback. Ifpicsum goes down or returns malicious content, the app breaks or could serve inappropriate content.

---

## 2. HIGH PRIORITY BUGS

### 2.1 Variable Scope Issue in app.js (CRITICAL)
**Location:** `app.js` line 114

**Issue:** `closeDetailSheet` function is defined as a global function inside a callback but is used before declaration.

### 2.2 Tab State Management Bug
**Location:** `app.js` lines 20-43

**Issue:** When switching navigation tabs, detail page is closed but detail sheet is NOT checked or closed. This creates inconsistent UI state.

### 2.3 Map Toggle Button State Bug
**Location:** `app.js` lines 74-87, `index.html` lines 18-24

**Issue:** Both toggle buttons (`data-target="list"` and `data-target="map"`) are active by default. Clicking one doesn't properly disable the other initially - toggleBtns.forEach removes active from ALL buttons including the clicked one.

### 2.4 Missing Restaurant Card Click Handler
**Location:** `app.js` line 51

**Issue:** `openDetailSheet(id)` is called but the function definition (lines 91-112) is placed AFTER its usage in the click handler. JavaScript hoisting doesn't help here since it's not a function declaration.

### 2.5 Event Listener Memory Leak in Detail Page
**Location:** `app.js` lines 122-138

**Issue:** Detail page close handler is only initialized once but if detail page is reopened, event listeners are not properly cleaned up. Repeatedly opening/closing could create multiple overlapping listeners.

---

## 3. LOGIC FLAWS & NAVIGATION ISSUES

### 3.1 Navigation Tab Logic
**Location:** `app.js` lines 24-42

**Issue:** When clicking nav items, `e.preventDefault()` prevents the default action but nav items are `<button>` elements without href, so this has no effect and is unnecessary.

### 3.2 Detail Sheet/Detail Page Conflict
**Location:** `app.js` line 40

**Issue:** Clicking a nav item closes detail page, but clicking a restaurant card opens detail sheet. User can see both a detail sheet AND navigate away, leaving orphaned UI state.

### 3.3 Missing Edge Case: No Empty State for Empty Lists
**Location:** `index.html` lines 15-171

**Issue:** No handling for scenarios where:
- No restaurants match filters
- Server returns 0 restaurants
- Search yields no results

### 3.4 Loading State Not Implemented
**Location:** `app.js` lines 1-207

**Issue:** No loading states anywhere in the app. Images (picsum.photos) can take time to load, but there's no skeleton loader or spinner to indicate loading.

### 3.5 Map/Grid Toggle Logic Flaw
**Location:** `app.js` lines 79-85

**Issue:** The toggle logic shows/hides elements but the map grid is always visible (map-marker elements are static HTML). Only `.map-grid` is hidden, but the markers remain clickable even when "list" view is active.

---

## 4. USER EXPERIENCE ISSUES

### 4.1 No Keyboard Accessibility
- No focus management for modals
- No keyboard shortcuts for closing sheets/pages
- No tab navigation order defined

### 4.2 Poor Error Handling
- No try/catch blocks
- No network error handling
- No fallback for missing data

### 4.3 Missing Feedback Mechanisms
- No success/error messages after form submissions
- No visual feedback for table selection
- No toast notifications for user actions

### 4.4 Mobile Responsiveness Issues
- Bottom nav overlaps content (padding-bottom 84px may not be sufficient on all devices)
- Card images on small screens may be problematic
- No touch-action CSS for buttons

---

## 5. CODE QUALITY ISSUES

### 5.1 Inconsistent Naming
- Mixed Russian and English class names (`tab-content`, `section-header`)
- Mixed Russian and English IDs (`res-date`, `map-grid`)
- Mixed Russian andEnglish labels (tabs have Russian, some content has English)

### 5.2 Magic Values
- `bottom: -100%` for sheet hidden state
- `z-index: 1000` for detail page (magic number)
- Hardcoded image URLs

### 5.3 Unused/Duplicate Code
- `initModals()` name is misleading (it handles toggle buttons, not modals)
- Carousel indicators allow clicking but no auto-play or swipe support

---

## 6. RECOMMENDATIONS (Priority Order)

### Critical (Fix Immediately)
1. **Fix XSS vulnerabilities** - Sanitize all user-controlled content
2. **Fix variable scope issue** - Move function definitions before usage
3. **Add CSRF protection** - Implement proper form handling

### High Priority (Fix This Week)
4. **Implement proper loading states**
5. **Add empty state handling** 
6. **Fix tab state management** - Clear detail sheet when navigating away
7. **Add proper event listener cleanup**

### Medium Priority (Fix Within Month)
8. **Add accessibility improvements**
9. **Implement proper form validation**
10. **Add error boundaries and handling**

### Low Priority (Nice to Have)
11. **Consistent naming conventions**
12. **Extract magic values to constants**
13. **Add unit tests**

---

## Files Modified
- None - Audit only (no fixes applied)

## Files Analyzed
- `/root/gastromap/index.html`
- `/root/gastromap/styles/main.css`
- `/root/gastromap/scripts/app.js`

---

**Audit Date:** 2026-05-04  
**Auditor:** Hermes CI  
**Overall Risk Level:** HIGH - Multiple critical security issues found
