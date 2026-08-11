# Sakwa Canneries & Exports (Pvt) Ltd
### Canned Fish Inventory System & Public Portal

Welcome to the official web application and inventory management platform for **Sakwa Canneries & Exports (Pvt) Ltd**, based in Baddegama, Sri Lanka.

---

## 🐟 Features Overview

### 🌐 Public Landing Page
- **Company Profile**: Premier seafood processer and canned fish exporter in Sri Lanka.
- **Product Lineup**:
  - `425g Mackerel in Tomato Sauce`
  - `425g Mackerel in Natural Brine`
  - `425g Yellowfin Tuna in Sunflower Oil`
- **Quality Certifications**: SLS Standard Certified, HACCP protocols, deep-sea fresh catch.
- **Contact & Location**:
  - Address: Aratuweta Waththa, Boralukada, Baddegama, Sri Lanka
  - Phone / WhatsApp: 071 55 22 378
  - Email: sakwa.trading578@gmail.com

---

### 🏭 Staff Inventory Management System
Accessible via the **Staff Login Portal** (Demo Username: `storekeeper` / Password: `sakwa123`):

1. **Dashboard**: Live metrics for Raw Fish weight (kg), Empty Cans, Salt, Oil, plus production & waste charts.
2. **Fish Arrival Note**: Incoming fish shipment reception log with automated Net Weight calculation (`Net Weight = Supplier Weight - Reject Weight - Loss Weight`).
3. **Raw Material GRN**: Dynamic Goods Receipt Note builder with line item total and grand total auto-calculations.
4. **Stock Issuing**: Production issue form with batch tracking and supervisor authorization.
5. **Stock Inventory**: Comprehensive 4-category stock manager:
   - Raw Material Stock
   - Packaging Material Stock
   - WIP / Production Line Stock
   - Finished Goods Stock
6. **Re-order Alerts**: Automatic safety stock monitoring.
7. **Expiry Tracking**: FEFO (First Expiry, First Out) compliance monitor with live Days Left countdown.

---

## 🛠️ Technology Stack
- **HTML5 & CSS3**: Custom design system with glassmorphism, responsive sidebar, and clean typography.
- **JavaScript (ES6+)**: Reactive state engine backed by `localStorage` persistence.
- **Chart.js**: Interactive management charts for Daily Production, Weekly Production, and Monthly Waste.
- **FontAwesome 6**: Rich iconography.

---

## 🚀 Running Locally
1. Clone the repository:
   ```bash
   git clone https://github.com/janithjanithdamsara-coder/sakwa.git
   ```
2. Open `index.html` in your browser or run via XAMPP / local server:
   ```bash
   # Using Python http server
   python -m http.server 8080
   ```
3. Navigate to `http://localhost:8080`.
