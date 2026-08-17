/**
 * CANNING FACTORY INVENTORY SYSTEM - SAKWA CANNERIES & EXPORTS (PVT) LTD
 * App Routing, Auth Engine, State & Dashboard System
 */

document.addEventListener('DOMContentLoaded', () => {
  // Initialize State Data
  let appData = getStoredData();

  // Mode switching references
  const appBody = document.getElementById('appBody');
  const loginForm = document.getElementById('loginForm');
  const btnQuickLogin = document.getElementById('btnQuickLogin');
  const btnBackToHome = document.getElementById('btnBackToHome');
  const btnHeaderPublicWebsite = document.getElementById('btnHeaderPublicWebsite');
  const logoutBtn = document.getElementById('logoutBtn');

  // Navigation Buttons to Login
  const loginTriggerBtns = [
    document.getElementById('btnNavToLogin'),
    document.getElementById('btnHeroLogin'),
    document.getElementById('btnFooterLogin')
  ];

  // Internal App References
  const navItems = document.querySelectorAll('.nav-item');
  const viewPanels = document.querySelectorAll('.view-panel');
  const pageTitle = document.getElementById('pageTitle');
  const toastContainer = document.getElementById('toastContainer');

  // Chart Instances
  let dailyChart = null;
  let weeklyChart = null;
  let wasteChart = null;

  // Master Dropdown State Variables
  const defaultMasterDropdowns = {
    fishSpecies: ['Mackerel (Aratoluwa)', 'Tuna (Kelawalla)', 'Linna', 'Balaya', 'Hurulla', 'Yellowfin Tuna'],
    rawMaterials: [
      'Local Fish (Chill Fish) - Cool Room',
      'Frozen Pacific Mackerel - Cool Room',
      'Salt (1kg / 25kg Packets & Sacks)',
      'Water (Potable Water)'
    ],
    packaging: [
      '300 Ø A1 S/R Stackable Can with Ends (Primary)',
      'Label - Sakwa J.M (Secondary)',
      'Label - Sakwa M (Secondary)',
      'Label - Luhu (Secondary)',
      'Corrugated Box / Master Carton (Secondary)'
    ],
    finishedGoods: [
      'Sakwa 425g x 24 Cans',
      'Luhu 425g x 24 Cans',
      'Skipper 425g x 24 Cans',
      'Calido 425g x 24 Cans'
    ],
    boilerFuels: [
      'Kerosene (Industrial Grade)',
      'Diesel (Automotive Gas Oil)',
      'Industrial Oil (Furnace Fuel)'
    ],
    qualityDispositions: [
      'HOLD BATCH (Quarantine / QC Inspection Pending)',
      'MAIN BATCH (Approved for Distribution)'
    ],
    boxTypes: ['Rigiform Box (25kg)', 'Plastic Crate (30kg)', 'Insulated Tub (100kg)', 'Wooden Box'],
    suppliers: ['Seagold Fisheries', 'Ocean Fresh Traders', 'Lanka Sea Foods Ltd', 'Industrial Salt Suppliers'],
    departments: ['Fish Canning Line - 1', 'Fish Canning Line - 2', 'Retort Sterilization', 'Packing Line'],
    inspectors: ['Line #1 • HACCP Team', 'Nimal Perera (Production Mgr)', 'Sarath Silva (Plant Sup)']
  };

  let masterDropdowns = JSON.parse(localStorage.getItem('SAKWA_MASTER_DROPDOWNS')) || defaultMasterDropdowns;
  let activeMasterCategory = 'fishSpecies';

  // Session & View Persistence Check
  const savedMode = localStorage.getItem('SAKWA_APP_MODE') || 'public-mode';
  const savedView = localStorage.getItem('SAKWA_CURRENT_VIEW') || 'dashboard';
  const savedUser = localStorage.getItem('SAKWA_USER_NAME') || 'Storekeeper';

  // Register Mode & Routing Listeners
  initModeRouting();
  initNavigation();
  initDashboardCharts();
  renderDashboardMetrics();
  initFishArrivalModule();
  initGrnModule();
  initStockIssueModule();
  initStockInventoryTabs();
  renderAllStockTables();
  renderReorderAlerts();
  renderExpiryTracking();
  initSeamQcModule();
  initMasterSettingsModule();

  // Restore Session Mode, Active Role & Active View
  const savedRole = localStorage.getItem('SAKWA_USER_ROLE') || 'storekeeper';
  const userRoleSelect = document.getElementById('userRoleSelect');
  if (userRoleSelect) {
    userRoleSelect.value = savedRole;
  }

  userRoleSelect?.addEventListener('change', (e) => {
    const selectedRole = e.target.value;
    localStorage.setItem('SAKWA_USER_ROLE', selectedRole);
    applyUserRolePermissions(selectedRole);
  });

  if (savedMode === 'app-mode') {
    document.getElementById('currentUserName').textContent = savedUser;
    setAppMode('app-mode');
    applyUserRolePermissions(savedRole);
    switchView(savedView);
  } else {
    setAppMode(savedMode);
  }

  function applyUserRolePermissions(role) {
    const userNameEl = document.getElementById('currentUserName');
    if (role === 'qc_officer') {
      if (userNameEl) userNameEl.textContent = 'QC Officer (HACCP)';
      showToast('Switched Role: Quality Control Officer (HACCP QC Mode Active)', 'info');
    } else if (role === 'director') {
      if (userNameEl) userNameEl.textContent = 'Plant Director';
      showToast('Switched Role: Plant Director (Executive Oversight Active)', 'info');
    } else {
      if (userNameEl) userNameEl.textContent = 'Storekeeper';
      showToast('Switched Role: Storekeeper (Full Inventory System Active)', 'success');
    }
  }

  /* ==========================================================================
     MODE ROUTING ENGINE (PUBLIC vs LOGIN vs INVENTORY APP)
     ========================================================================== */
  function setAppMode(modeName) {
    appBody.className = modeName;
    localStorage.setItem('SAKWA_APP_MODE', modeName);
    if (modeName === 'app-mode') {
      renderDashboardMetrics();
      setTimeout(updateCharts, 100);
      initLiveTempStream();
    }
  }

  function initLiveTempStream() {
    const tempDisplay = document.getElementById('liveColdRoomTemp');
    if (!tempDisplay) return;

    setInterval(() => {
      // Simulate live micro-fluctuations around -18.4 °C
      const baseTemp = -18.4;
      const variation = (Math.random() * 0.4 - 0.2);
      const currentTemp = (baseTemp + variation).toFixed(1);
      tempDisplay.textContent = currentTemp;
    }, 4000);
  }

  function initModeRouting() {
    // Password Toggle Visibility
    const togglePasswordBtn = document.getElementById('togglePasswordBtn');
    const loginPasswordInput = document.getElementById('loginPassword');
    const togglePasswordIcon = document.getElementById('togglePasswordIcon');

    togglePasswordBtn?.addEventListener('click', () => {
      const isPassword = loginPasswordInput.getAttribute('type') === 'password';
      loginPasswordInput.setAttribute('type', isPassword ? 'text' : 'password');
      togglePasswordIcon.className = isPassword ? 'fa-solid fa-eye-slash' : 'fa-solid fa-eye';
    });

    // Open Login Screen
    loginTriggerBtns.forEach(btn => {
      btn?.addEventListener('click', () => {
        setAppMode('login-mode');
        window.scrollTo(0, 0);
      });
    });

    // Back to Public Website
    btnBackToHome?.addEventListener('click', () => {
      setAppMode('public-mode');
    });
    btnHeaderPublicWebsite?.addEventListener('click', () => {
      setAppMode('public-mode');
      showToast('Switched to Sakwa Canneries Public Website', 'info');
    });

    // Logout Buttons (Sidebar & Mobile Header)
    const handleLogout = () => {
      setAppMode('public-mode');
      showToast('Logged out of Inventory System', 'info');
    };

    logoutBtn?.addEventListener('click', handleLogout);
    document.getElementById('mobileHeaderLogoutBtn')?.addEventListener('click', handleLogout);

    // Login Form Submission
    loginForm?.addEventListener('submit', (e) => {
      e.preventDefault();
      const username = document.getElementById('loginUsername').value.trim();
      executeLogin(username || 'Storekeeper');
    });

    // 1-Click Quick Demo Login
    btnQuickLogin?.addEventListener('click', () => {
      executeLogin('Storekeeper');
    });

    // Mobile Navbar Toggle (Public Site)
    const publicNavToggle = document.getElementById('publicNavToggle');
    const publicNavLinks = document.getElementById('publicNavLinks');

    publicNavToggle?.addEventListener('click', () => {
      publicNavLinks?.classList.toggle('mobile-open');
    });

    // Inventory Sidebar Mobile Drawer Toggle
    const inventorySidebarToggle = document.getElementById('inventorySidebarToggle');
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    const toggleMobileSidebar = () => {
      appSidebar?.classList.toggle('open');
      sidebarOverlay?.classList.toggle('active');
    };

    inventorySidebarToggle?.addEventListener('click', toggleMobileSidebar);
    sidebarOverlay?.addEventListener('click', toggleMobileSidebar);
  }

  function executeLogin(username, targetView = 'dashboard') {
    document.getElementById('currentUserName').textContent = username;
    localStorage.setItem('SAKWA_USER_NAME', username);
    setAppMode('app-mode');
    switchView(targetView);
    showToast(`Welcome back, ${username}! System ready.`, 'success');
  }

  /* ==========================================================================
     1. INTERNAL NAVIGATION SYSTEM
     ========================================================================== */
  function initNavigation() {
    const appSidebar = document.getElementById('appSidebar');
    const sidebarOverlay = document.getElementById('sidebarOverlay');

    navItems.forEach(item => {
      item.addEventListener('click', () => {
        const targetView = item.getAttribute('data-view');
        switchView(targetView);
        
        // Auto-close mobile sidebar drawer on item click
        if (window.innerWidth <= 992) {
          appSidebar?.classList.remove('open');
          sidebarOverlay?.classList.remove('active');
        }
      });
    });

    // Dashboard Quick Action Buttons
    document.getElementById('btnNavFishArrival')?.addEventListener('click', () => switchView('fish-arrival'));
    document.getElementById('btnNavGRN')?.addEventListener('click', () => switchView('raw-grn'));
    document.getElementById('btnNavIssuing')?.addEventListener('click', () => switchView('stock-issuing'));
    document.getElementById('btnNavReports')?.addEventListener('click', () => switchView('stock-inventory'));
  }

  function switchView(viewId) {
    localStorage.setItem('SAKWA_CURRENT_VIEW', viewId);
    navItems.forEach(nav => {
      if (nav.getAttribute('data-view') === viewId) {
        nav.classList.add('active');
        pageTitle.textContent = nav.querySelector('span').textContent;
      } else {
        nav.classList.remove('active');
      }
    });

    viewPanels.forEach(panel => {
      if (panel.id === `view-${viewId}`) {
        panel.classList.add('active');
      } else {
        panel.classList.remove('active');
      }
    });

    if (viewId === 'dashboard') {
      renderDashboardMetrics();
      updateCharts();
    } else if (viewId === 'stock-inventory') {
      renderAllStockTables();
    } else if (viewId === 'reorder-alerts') {
      renderReorderAlerts();
    } else if (viewId === 'expiry-tracking') {
      renderExpiryTracking();
    } else if (viewId === 'seam-qc') {
      renderSeamQcHistory();
    }
  }

  /* ==========================================================================
     2. DASHBOARD & CHARTS
     ========================================================================== */
  function renderDashboardMetrics() {
    const summary = appData.stockSummary;
    document.getElementById('dashRawFish').innerHTML = `${summary.rawFish.toLocaleString()} <span class="card-unit">kg</span>`;
    document.getElementById('dashCans').textContent = summary.emptyCans.toLocaleString();
    document.getElementById('dashRigiform').textContent = summary.rigiformCans.toLocaleString();
    document.getElementById('dashPlastic').textContent = summary.plasticBoxes.toLocaleString();
    document.getElementById('dashSalt').innerHTML = `${summary.saltStock.toLocaleString()} <span class="card-unit">kg</span>`;
    document.getElementById('dashOil').innerHTML = `${summary.oilStock.toLocaleString()} <span class="card-unit">L</span>`;
  }

  function initDashboardCharts() {
    // Daily Production Chart
    const ctxDaily = document.getElementById('dailyProdChart')?.getContext('2d');
    if (ctxDaily) {
      dailyChart = new Chart(ctxDaily, {
        type: 'bar',
        data: {
          labels: appData.charts.dailyProduction.labels,
          datasets: [{
            label: 'Production (kg)',
            data: appData.charts.dailyProduction.data,
            backgroundColor: '#2563eb',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Inter', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
          }
        }
      });
    }

    // Weekly Production Chart
    const ctxWeekly = document.getElementById('weeklyProdChart')?.getContext('2d');
    if (ctxWeekly) {
      weeklyChart = new Chart(ctxWeekly, {
        type: 'bar',
        data: {
          labels: appData.charts.weeklyProduction.labels,
          datasets: [{
            label: 'Weekly Total (kg)',
            data: appData.charts.weeklyProduction.data,
            backgroundColor: '#16a34a',
            borderRadius: 4
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Inter', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
          }
        }
      });
    }

    // Monthly Waste Chart
    const ctxWaste = document.getElementById('monthlyWasteChart')?.getContext('2d');
    if (ctxWaste) {
      wasteChart = new Chart(ctxWaste, {
        type: 'line',
        data: {
          labels: appData.charts.monthlyWaste.labels,
          datasets: [{
            label: 'Waste (kg)',
            data: appData.charts.monthlyWaste.data,
            borderColor: '#ef4444',
            backgroundColor: 'rgba(239, 68, 68, 0.1)',
            fill: true,
            tension: 0.3,
            pointRadius: 4,
            pointBackgroundColor: '#ef4444'
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          plugins: { legend: { display: false } },
          scales: {
            y: { grid: { color: '#e2e8f0' }, ticks: { font: { family: 'Inter', size: 11 } } },
            x: { grid: { display: false }, ticks: { font: { family: 'Inter', size: 11 } } }
          }
        }
      });
    }
  }

  function updateCharts() {
    if (dailyChart) dailyChart.update();
    if (weeklyChart) weeklyChart.update();
    if (wasteChart) wasteChart.update();
  }

  /* ==========================================================================
     3. FISH ARRIVAL NOTE MODULE
     ========================================================================== */
  function initFishArrivalModule() {
    const calcInputs = document.querySelectorAll('.calc-weight');
    calcInputs.forEach(input => {
      input.addEventListener('input', calculateFishNetWeight);
    });

    document.getElementById('btnFanClear')?.addEventListener('click', clearFishForm);
    document.getElementById('btnFanSave')?.addEventListener('click', saveFishArrivalNote);
  }

  function calculateFishNetWeight() {
    const supplier = parseFloat(document.getElementById('fanSupplierWeight').value) || 0;
    const reject = parseFloat(document.getElementById('fanRejectWeight').value) || 0;
    const loss = parseFloat(document.getElementById('fanLossWeight').value) || 0;
    const net = Math.max(0, supplier - reject - loss);
    document.getElementById('fanNetWeight').value = net;
  }

  function clearFishForm() {
    document.getElementById('fanSupplier').value = '';
    document.getElementById('fanVehicle').value = '';
    document.getElementById('fanDriver').value = '';
    document.getElementById('fanNoBoxes').value = '0';
    document.getElementById('fanSupplierWeight').value = '0';
    document.getElementById('fanRejectWeight').value = '0';
    document.getElementById('fanLossWeight').value = '0';
    document.getElementById('fanNetWeight').value = '0';
    document.getElementById('fanRemarks').value = '';
  }

  function saveFishArrivalNote() {
    const supplierName = document.getElementById('fanSupplier').value.trim();
    const netWeight = parseFloat(document.getElementById('fanNetWeight').value) || 0;
    const species = document.getElementById('fanSpecies').value;

    if (!supplierName) {
      showToast('Please enter Supplier Name', 'info');
      return;
    }

    if (netWeight <= 0) {
      showToast('Net Weight must be greater than 0', 'info');
      return;
    }

    const note = {
      id: `FAN-${new Date().toISOString().slice(0, 10).replace(/-/g, '')}-${Math.floor(Math.random() * 900 + 100)}`,
      date: document.getElementById('fanDate').value,
      time: document.getElementById('fanTime').value,
      supplierName,
      vehicleNo: document.getElementById('fanVehicle').value,
      driverName: document.getElementById('fanDriver').value,
      fishSpecies: species,
      boxType: document.getElementById('fanBoxType').value,
      noOfBoxes: parseInt(document.getElementById('fanNoBoxes').value) || 0,
      cansPerBox: parseInt(document.getElementById('fanCansPerBox').value) || 0,
      supplierWeight: parseFloat(document.getElementById('fanSupplierWeight').value) || 0,
      rejectWeight: parseFloat(document.getElementById('fanRejectWeight').value) || 0,
      lossWeight: parseFloat(document.getElementById('fanLossWeight').value) || 0,
      netWeight,
      remarks: document.getElementById('fanRemarks').value
    };

    appData.fishArrivals.unshift(note);
    appData.stockSummary.rawFish += netWeight;
    
    const existing = appData.rawMaterialsStock.find(item => item.category === 'Raw Fish' && item.name.includes(species));
    if (existing) {
      existing.receivedQty += netWeight;
      existing.balance += netWeight;
    } else {
      appData.rawMaterialsStock.push({
        id: `RM-${Date.now()}`,
        name: `Frozen ${species} Grade A`,
        category: 'Raw Fish',
        supplier: supplierName,
        lotBatch: `FISH-${note.date}-NEW`,
        receivedQty: netWeight,
        issuedQty: 0,
        balance: netWeight,
        unit: 'kg',
        expiry: '2025-12-31'
      });
    }

    saveStoredData(appData);
    renderDashboardMetrics();
    renderAllStockTables();
    showToast(`Fish Arrival Note saved! Net Weight: ${netWeight.toLocaleString()} kg added to stock.`, 'success');
    clearFishForm();
  }

  /* ==========================================================================
     4. RAW MATERIAL GRN MODULE
     ========================================================================== */
  function initGrnModule() {
    renderGrnRows();

    document.getElementById('btnAddGrnRow')?.addEventListener('click', () => {
      addGrnRow({ type: 'Raw Fish (Mackerel)', name: '', unit: 'kg', quantity: 100, unitPrice: 300 });
      calculateGrnGrandTotal();
    });

    document.getElementById('btnGrnClear')?.addEventListener('click', () => {
      document.getElementById('grnSupplier').value = '';
      document.getElementById('grnVehicle').value = '';
      document.getElementById('grnDriver').value = '';
      renderGrnRows();
    });

    document.getElementById('btnGrnSaveDraft')?.addEventListener('click', () => {
      showToast('GRN saved as Draft!', 'info');
    });

    document.getElementById('btnGrnSave')?.addEventListener('click', saveGrnRecord);
  }

  function renderGrnRows() {
    const tbody = document.getElementById('grnItemsBody');
    if (!tbody) return;

    const sampleItems = appData.grnRecords[0]?.items || [
      { type: 'Raw Fish (Mackerel)', name: 'Frozen Mackerel Grade A', unit: 'kg', quantity: 3300, unitPrice: 300, total: 990000 },
      { type: 'Empty Cans (Rigiform)', name: '425g Tin Cans Standard', unit: 'Nos', quantity: 2000, unitPrice: 25, total: 50000 },
      { type: 'Salt', name: 'Iodized Industrial Salt', unit: 'kg', quantity: 500, unitPrice: 120, total: 60000 },
      { type: 'Oil', name: 'Refined Palm Oil', unit: 'L', quantity: 300, unitPrice: 350, total: 105000 }
    ];

    tbody.innerHTML = '';
    sampleItems.forEach(item => addGrnRow(item));
    calculateGrnGrandTotal();
  }

  function addGrnRow(item) {
    const tbody = document.getElementById('grnItemsBody');
    const tr = document.createElement('tr');

    const total = (item.quantity || 0) * (item.unitPrice || 0);

    tr.innerHTML = `
      <td>
        <select class="form-control grn-type">
          <option value="Local Fish (Chill Fish)" ${item.type.includes('Local') ? 'selected' : ''}>Local Fish (Chill Fish) - Cool Room</option>
          <option value="Frozen Pacific Mackerel" ${item.type.includes('Mackerel') ? 'selected' : ''}>Frozen Pacific Mackerel - Cool Room</option>
          <option value="Salt (1 kg Packets)" ${item.type.includes('1 kg') ? 'selected' : ''}>Salt (1 kg Packets)</option>
          <option value="Salt (25 kg Sacks)" ${item.type.includes('25 kg') ? 'selected' : ''}>Salt (25 kg Sacks)</option>
          <option value="Empty Cans (Rigiform)" ${item.type.includes('Rigiform') ? 'selected' : ''}>Empty Cans (Rigiform)</option>
          <option value="Oil" ${item.type.includes('Oil') ? 'selected' : ''}>Oil</option>
        </select>
      </td>
      <td><input type="text" class="form-control grn-name" value="${item.name || ''}" placeholder="Material Name"></td>
      <td><input type="text" class="form-control grn-unit" value="${item.unit || 'kg'}"></td>
      <td><input type="number" class="form-control grn-qty" value="${item.quantity || 0}"></td>
      <td><input type="number" class="form-control grn-price" value="${item.unitPrice || 0}"></td>
      <td style="font-weight:700" class="grn-row-total">${total.toLocaleString('en-US', {minimumFractionDigits:2})}</td>
      <td style="text-align:center">
        <button type="button" class="btn-remove-row" style="background:none; border:none; color:#ef4444; cursor:pointer">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    const qtyInput = tr.querySelector('.grn-qty');
    const priceInput = tr.querySelector('.grn-price');
    const rowTotal = tr.querySelector('.grn-row-total');
    const removeBtn = tr.querySelector('.btn-remove-row');

    const updateRowTotal = () => {
      const q = parseFloat(qtyInput.value) || 0;
      const p = parseFloat(priceInput.value) || 0;
      const tot = q * p;
      rowTotal.textContent = tot.toLocaleString('en-US', {minimumFractionDigits: 2});
      calculateGrnGrandTotal();
    };

    qtyInput.addEventListener('input', updateRowTotal);
    priceInput.addEventListener('input', updateRowTotal);

    removeBtn.addEventListener('click', () => {
      tr.remove();
      calculateGrnGrandTotal();
    });

    tbody.appendChild(tr);
  }

  function calculateGrnGrandTotal() {
    let grandTotal = 0;
    const rows = document.querySelectorAll('#grnItemsBody tr');
    rows.forEach(tr => {
      const qty = parseFloat(tr.querySelector('.grn-qty').value) || 0;
      const price = parseFloat(tr.querySelector('.grn-price').value) || 0;
      grandTotal += (qty * price);
    });

    const display = document.getElementById('grnGrandTotal');
    if (display) {
      display.textContent = grandTotal.toLocaleString('en-US', {minimumFractionDigits: 2, maximumFractionDigits: 2});
    }
  }

  function saveGrnRecord() {
    const supplier = document.getElementById('grnSupplier').value.trim();
    if (!supplier) {
      showToast('Please specify Supplier Name for GRN', 'info');
      return;
    }

    const grnRecord = {
      grnNo: document.getElementById('grnNo').value,
      date: document.getElementById('grnDate').value,
      supplierName: supplier,
      vehicleNo: document.getElementById('grnVehicle').value,
      driverName: document.getElementById('grnDriver').value,
      receivedBy: document.getElementById('grnReceivedBy').value,
      totalAmount: parseFloat(document.getElementById('grnGrandTotal').textContent.replace(/,/g, '')) || 0,
      status: 'Saved',
      items: []
    };

    const rows = document.querySelectorAll('#grnItemsBody tr');
    rows.forEach(tr => {
      const type = tr.querySelector('.grn-type').value;
      const name = tr.querySelector('.grn-name').value;
      const unit = tr.querySelector('.grn-unit').value;
      const quantity = parseFloat(tr.querySelector('.grn-qty').value) || 0;
      const unitPrice = parseFloat(tr.querySelector('.grn-price').value) || 0;

      grnRecord.items.push({ type, name, unit, quantity, unitPrice, total: quantity * unitPrice });

      if (type.includes('Salt')) appData.stockSummary.saltStock += quantity;
      if (type.includes('Oil')) appData.stockSummary.oilStock += quantity;
      if (type.includes('Rigiform')) {
        appData.stockSummary.rigiformCans += quantity;
        appData.stockSummary.emptyCans += quantity;
      }
      if (type.includes('Plastic')) {
        appData.stockSummary.plasticBoxes += quantity;
        appData.stockSummary.emptyCans += quantity;
      }

      // Automatically prepend to Stock Inventory tables
      if (type.includes('Fish') || type.includes('Salt') || type.includes('Oil')) {
        appData.rawMaterialsStock.unshift({
          id: `RM-${Date.now()}`,
          name: name || type,
          category: type.includes('Fish') ? 'Raw Fish' : (type.includes('Salt') ? 'Ingredients' : 'Oil'),
          supplier: supplier,
          lotBatch: `GRN-${grnRecord.grnNo.slice(-4)}-${Date.now().toString().slice(-3)}`,
          receivedQty: quantity,
          issuedQty: 0,
          balance: quantity,
          unit: unit,
          expiry: '2026-12-31'
        });
      } else {
        appData.packagingMaterialsStock.unshift({
          materialCode: `PKG-${Date.now().toString().slice(-4)}`,
          name: name || type,
          received: quantity,
          issued: 0,
          balance: quantity,
          unit: unit
        });
      }
    });

    appData.grnRecords = appData.grnRecords || [];
    appData.grnRecords.unshift(grnRecord);
    saveStoredData(appData);

    renderDashboardMetrics();
    renderAllStockTables();
    showToast('Goods Receipt Note (GRN) saved & added to Stock Inventory!', 'success');
  }

  /* ==========================================================================
     5. STOCK ISSUING MODULE
     ========================================================================== */
  function initStockIssueModule() {
    renderIssueRows();

    document.getElementById('btnAddIssueRow')?.addEventListener('click', () => {
      addIssueRow({ type: 'Empty Cans (Rigiform)', batchNo: 'CAN-2025-05-10-NEW', unit: 'Nos', quantity: 1000, remarks: '' });
    });

    document.getElementById('btnIssueClear')?.addEventListener('click', renderIssueRows);
    document.getElementById('btnIssueSave')?.addEventListener('click', saveStockIssueRecord);
  }

  function renderIssueRows() {
    const tbody = document.getElementById('issueItemsBody');
    if (!tbody) return;

    const sampleItems = appData.issueRecords[0]?.items || [
      { type: 'Raw Fish (Mackerel)', batchNo: 'FISH-2025-05-18-01', unit: 'kg', quantity: 2000, remarks: 'For Production' },
      { type: 'Empty Cans (Rigiform)', batchNo: 'CAN-2025-05-10-02', unit: 'Nos', quantity: 10000, remarks: '' },
      { type: 'Lids (For Cans)', batchNo: 'LID-2025-05-10-03', unit: 'Nos', quantity: 10000, remarks: '' },
      { type: 'Salt', batchNo: 'SALT-2025-05-12-01', unit: 'kg', quantity: 150, remarks: '' },
      { type: 'Oil', batchNo: 'OIL-2025-05-12-01', unit: 'L', quantity: 100, remarks: '' }
    ];

    tbody.innerHTML = '';
    sampleItems.forEach(item => addIssueRow(item));
  }

  function addIssueRow(item) {
    const tbody = document.getElementById('issueItemsBody');
    const tr = document.createElement('tr');

    tr.innerHTML = `
      <td>
        <select class="form-control issue-type">
          <option value="Raw Fish (Mackerel)" ${item.type.includes('Mackerel') ? 'selected' : ''}>Raw Fish (Mackerel)</option>
          <option value="Empty Cans (Rigiform)" ${item.type.includes('Rigiform') ? 'selected' : ''}>Empty Cans (Rigiform)</option>
          <option value="Lids (For Cans)" ${item.type.includes('Lids') ? 'selected' : ''}>Lids (For Cans)</option>
          <option value="Salt" ${item.type.includes('Salt') ? 'selected' : ''}>Salt</option>
          <option value="Oil" ${item.type.includes('Oil') ? 'selected' : ''}>Oil</option>
        </select>
      </td>
      <td><input type="text" class="form-control issue-batch" value="${item.batchNo || ''}"></td>
      <td><input type="text" class="form-control issue-unit" value="${item.unit || 'kg'}"></td>
      <td><input type="number" class="form-control issue-qty" value="${item.quantity || 0}"></td>
      <td><input type="text" class="form-control issue-remarks" value="${item.remarks || ''}"></td>
      <td style="text-align:center">
        <button type="button" class="btn-remove-row" style="background:none; border:none; color:#ef4444; cursor:pointer">
          <i class="fa-solid fa-trash-can"></i>
        </button>
      </td>
    `;

    tr.querySelector('.btn-remove-row').addEventListener('click', () => tr.remove());
    tbody.appendChild(tr);
  }

  function saveStockIssueRecord() {
    const issueRecord = {
      issueNo: document.getElementById('issueNo').value,
      date: document.getElementById('issueDate').value,
      department: document.getElementById('issueDept').value,
      issuedBy: document.getElementById('issueIssuedBy').value,
      authorizedBy: document.getElementById('issueAuthBy').value,
      remarks: document.getElementById('issueRemarks').value,
      items: []
    };

    const rows = document.querySelectorAll('#issueItemsBody tr');
    let totalCansProduced = 0;
    let fishIssued = 0;

    rows.forEach(tr => {
      const type = tr.querySelector('.issue-type').value;
      const batchNo = tr.querySelector('.issue-batch').value;
      const unit = tr.querySelector('.issue-unit').value;
      const quantity = parseFloat(tr.querySelector('.issue-qty').value) || 0;
      const remarks = tr.querySelector('.issue-remarks').value;

      issueRecord.items.push({ type, batchNo, unit, quantity, remarks });

      if (type.includes('Mackerel')) {
        appData.stockSummary.rawFish = Math.max(0, appData.stockSummary.rawFish - quantity);
        fishIssued += quantity;
      }
      if (type.includes('Salt')) appData.stockSummary.saltStock = Math.max(0, appData.stockSummary.saltStock - quantity);
      if (type.includes('Oil')) appData.stockSummary.oilStock = Math.max(0, appData.stockSummary.oilStock - quantity);
      if (type.includes('Rigiform')) {
        appData.stockSummary.rigiformCans = Math.max(0, appData.stockSummary.rigiformCans - quantity);
        appData.stockSummary.emptyCans = Math.max(0, appData.stockSummary.emptyCans - quantity);
        totalCansProduced += quantity;
      }
    });

    // Automatically add WIP Production record to WIP Stock table!
    if (fishIssued > 0 || totalCansProduced > 0) {
      appData.wipStock.unshift({
        productionDate: issueRecord.date,
        batchNo: `BATCH-${issueRecord.issueNo.slice(-4)}-${Date.now().toString().slice(-3)}`,
        retortLot: `RETORT-${Date.now().toString().slice(-4)}`,
        fishIssuedKg: fishIssued || 2000,
        brineOilUsage: 'Standard Brine (2% Salt)',
        cansProduced: totalCansProduced || 5000,
        status: 'In Retort'
      });
    }

    appData.issueRecords = appData.issueRecords || [];
    appData.issueRecords.unshift(issueRecord);
    saveStoredData(appData);

    renderDashboardMetrics();
    renderAllStockTables();
    showToast('Stock Issued to Production & WIP Stock updated!', 'success');
  }

  /* ==========================================================================
     6. STOCK INVENTORY TABS & TABLES
     ========================================================================== */
  function initStockInventoryTabs() {
    const tabBtns = document.querySelectorAll('.tab-btn');
    const tabContents = document.querySelectorAll('.tab-content');

    tabBtns.forEach(btn => {
      btn.addEventListener('click', () => {
        const targetTab = btn.getAttribute('data-tab');

        tabBtns.forEach(b => b.classList.remove('active'));
        tabContents.forEach(c => c.classList.remove('active'));

        btn.classList.add('active');
        document.getElementById(targetTab)?.classList.add('active');
      });
    });
  }

  function renderAllStockTables() {
    const rawBody = document.getElementById('rawStockBody');
    if (rawBody) {
      rawBody.innerHTML = appData.rawMaterialsStock.map((item, idx) => `
        <tr>
          <td data-label="Item Name" style="font-weight:600">${item.name}</td>
          <td data-label="Category">${item.category}</td>
          <td data-label="Supplier">${item.supplier}</td>
          <td data-label="Lot/Batch"><code>${item.lotBatch}</code></td>
          <td data-label="Received Qty">${item.receivedQty.toLocaleString()}</td>
          <td data-label="Issued Qty">${item.issuedQty.toLocaleString()}</td>
          <td data-label="Balance" style="font-weight:700; color:var(--accent-blue)">${item.balance.toLocaleString()}</td>
          <td data-label="Unit">${item.unit}</td>
          <td data-label="Expiry Date">${item.expiry}</td>
          <td data-label="Action" style="text-align:center">
            <div style="display:flex; gap:6px; justify-content:center">
              <button type="button" class="btn-outline-blue btn-edit-stock" data-cat="raw" data-index="${idx}" style="padding:3px 8px; font-size:11px" title="Edit Item">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn-outline-blue btn-del-stock" data-cat="raw" data-index="${idx}" style="padding:3px 8px; font-size:11px; color:#ef4444; border-color:#f87171" title="Delete Item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const pkgBody = document.getElementById('packagingStockBody');
    if (pkgBody) {
      pkgBody.innerHTML = appData.packagingMaterialsStock.map((item, idx) => `
        <tr>
          <td data-label="Material Code"><code>${item.materialCode}</code></td>
          <td data-label="Description" style="font-weight:600">${item.name}</td>
          <td data-label="Total Received">${item.received.toLocaleString()}</td>
          <td data-label="Total Issued">${item.issued.toLocaleString()}</td>
          <td data-label="Current Balance" style="font-weight:700; color:var(--accent-green)">${item.balance.toLocaleString()}</td>
          <td data-label="Unit">${item.unit}</td>
          <td data-label="Action" style="text-align:center">
            <div style="display:flex; gap:6px; justify-content:center">
              <button type="button" class="btn-outline-blue btn-edit-stock" data-cat="pkg" data-index="${idx}" style="padding:3px 8px; font-size:11px" title="Edit Item">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn-outline-blue btn-del-stock" data-cat="pkg" data-index="${idx}" style="padding:3px 8px; font-size:11px; color:#ef4444; border-color:#f87171" title="Delete Item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const wipBody = document.getElementById('wipStockBody');
    if (wipBody) {
      wipBody.innerHTML = appData.wipStock.map((item, idx) => `
        <tr>
          <td data-label="Production Date">${item.productionDate}</td>
          <td data-label="Batch No."><code>${item.batchNo}</code></td>
          <td data-label="Retort Lot"><code>${item.retortLot}</code></td>
          <td data-label="Fish Issued">${item.fishIssuedKg.toLocaleString()} kg</td>
          <td data-label="Usage">${item.brineOilUsage}</td>
          <td data-label="Cans Produced" style="font-weight:700">${item.cansProduced.toLocaleString()}</td>
          <td data-label="Status"><span class="badge badge-good">${item.status}</span></td>
          <td data-label="Action" style="text-align:center">
            <div style="display:flex; gap:6px; justify-content:center">
              <button type="button" class="btn-outline-blue btn-edit-stock" data-cat="wip" data-index="${idx}" style="padding:3px 8px; font-size:11px" title="Edit Item">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn-outline-blue btn-del-stock" data-cat="wip" data-index="${idx}" style="padding:3px 8px; font-size:11px; color:#ef4444; border-color:#f87171" title="Delete Item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    const fgBody = document.getElementById('fgStockBody');
    if (fgBody) {
      fgBody.innerHTML = appData.finishedGoodsStock.map((item, idx) => `
        <tr>
          <td data-label="Product" style="font-weight:600">${item.brandProduct}</td>
          <td data-label="Batch No."><code>${item.batchNo}</code></td>
          <td data-label="QC Disposition">
            <span class="badge ${item.qualityStatus && item.qualityStatus.includes('HOLD') ? 'badge-expired' : 'badge-good'}" style="font-size:10px; padding:4px 8px">
              ${item.qualityStatus || 'MAIN BATCH 🟢'}
            </span>
          </td>
          <td data-label="Mfg Date">${item.prodDate}</td>
          <td data-label="Expiry Date">${item.expiryDate}</td>
          <td data-label="Total Cartons">${item.totalCartons.toLocaleString()}</td>
          <td data-label="Total Cans">${item.totalCans.toLocaleString()}</td>
          <td data-label="Dispatched">${item.dispatchedQty.toLocaleString()}</td>
          <td data-label="Balance Cartons" style="font-weight:700; color:var(--accent-purple)">${item.balanceCartons.toLocaleString()}</td>
          <td data-label="Balance Cans" style="font-weight:700; color:var(--accent-blue)">${item.balanceCans.toLocaleString()}</td>
          <td data-label="Action" style="text-align:center">
            <div style="display:flex; gap:6px; justify-content:center">
              <button type="button" class="btn-outline-blue btn-edit-stock" data-cat="fg" data-index="${idx}" style="padding:3px 8px; font-size:11px" title="Edit Item">
                <i class="fa-solid fa-pen"></i>
              </button>
              <button type="button" class="btn-outline-blue btn-del-stock" data-cat="fg" data-index="${idx}" style="padding:3px 8px; font-size:11px; color:#ef4444; border-color:#f87171" title="Delete Item">
                <i class="fa-solid fa-trash"></i>
              </button>
            </div>
          </td>
        </tr>
      `).join('');
    }

    // Attach Edit & Delete Click Listeners
    document.querySelectorAll('.btn-del-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        const idx = parseInt(btn.getAttribute('data-index'));
        if (cat === 'raw') appData.rawMaterialsStock.splice(idx, 1);
        if (cat === 'pkg') appData.packagingMaterialsStock.splice(idx, 1);
        if (cat === 'wip') appData.wipStock.splice(idx, 1);
        if (cat === 'fg') appData.finishedGoodsStock.splice(idx, 1);
        saveStoredData(appData);
        renderAllStockTables();
        showToast('Item deleted successfully from inventory!', 'info');
      });
    });

    document.querySelectorAll('.btn-edit-stock').forEach(btn => {
      btn.addEventListener('click', () => {
        const cat = btn.getAttribute('data-cat');
        const idx = parseInt(btn.getAttribute('data-index'));
        let targetItem;
        if (cat === 'raw') targetItem = appData.rawMaterialsStock[idx];
        if (cat === 'pkg') targetItem = appData.packagingMaterialsStock[idx];
        if (cat === 'wip') targetItem = appData.wipStock[idx];
        if (cat === 'fg') targetItem = appData.finishedGoodsStock[idx];

        if (targetItem) {
          const newName = prompt('Edit Item Name / Description:', targetItem.name || targetItem.brandProduct);
          if (newName && newName.trim()) {
            if (targetItem.name) targetItem.name = newName.trim();
            if (targetItem.brandProduct) targetItem.brandProduct = newName.trim();
            saveStoredData(appData);
            renderAllStockTables();
            showToast('Item updated successfully!', 'success');
          }
        }
      });
    });
  }

  /* ==========================================================================
     7. RE-ORDER ALERTS & EXPIRY TRACKING
     ========================================================================== */
  function renderReorderAlerts() {
    const tbody = document.getElementById('reorderAlertsBody');
    if (!tbody) return;

    tbody.innerHTML = appData.reorderAlerts.map(item => `
      <tr>
        <td data-label="Item Type">${item.itemType}</td>
        <td data-label="Item Name" style="font-weight:600">${item.itemName}</td>
        <td data-label="Current Stock" style="font-weight:700; color:#dc2626">${item.currentStock}</td>
        <td data-label="Re-order Level">${item.reorderLevel}</td>
        <td data-label="Status"><span class="badge badge-low-stock"><i class="fa-solid fa-triangle-exclamation"></i> Low Stock</span></td>
        <td data-label="Action" style="text-align:center">
          <button type="button" class="btn-outline-blue btn-reorder-action" data-item="${item.itemName}" style="padding:4px 12px; font-size:12px">
            Re-order
          </button>
        </td>
      </tr>
    `).join('');

    document.querySelectorAll('.btn-reorder-action').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const name = e.target.getAttribute('data-item');
        showToast(`Re-order purchase draft created for ${name}!`, 'info');
      });
    });
  }

  function renderExpiryTracking() {
    const tbody = document.getElementById('expiryTrackingBody');
    if (!tbody) return;

    tbody.innerHTML = appData.expiryItems.map(item => {
      let badgeClass = 'badge-good';
      if (item.daysLeft <= 0 || item.status === 'Expired') badgeClass = 'badge-expired';
      else if (item.daysLeft <= 30 || item.status === 'Expiring Soon') badgeClass = 'badge-expiring-soon';

      return `
        <tr>
          <td data-label="Item Type">${item.itemType}</td>
          <td data-label="Item Name" style="font-weight:600">${item.itemName}</td>
          <td data-label="Batch No."><code>${item.batchNo}</code></td>
          <td data-label="Mfg Date">${item.mfgDate}</td>
          <td data-label="Expiry Date">${item.expiryDate}</td>
          <td data-label="Days Left" style="font-weight:700">${item.daysLeft} days</td>
          <td data-label="Status"><span class="badge ${badgeClass}">${item.status}</span></td>
        </tr>
      `;
    }).join('');
  }

  /* ==========================================================================
     8. DOUBLE SEAM QC INSPECTION MODULE (HACCP QUALITY CONTROL)
     ========================================================================== */
  function initSeamQcModule() {
    const dateInput = document.getElementById('seamDate');
    if (dateInput && !dateInput.value) {
      dateInput.value = new Date().toISOString().split('T')[0];
    }

    let currentTinIndex = 0; // 0 to 3 for Tins #1..#4
    const sampleTinsData = [
      { topSL: [2.83, 2.90, 2.93, 2.85], topBH: [2.09, 2.09, 2.09, 2.07], topCH: [1.70, 1.70, 1.70, 1.63], botSL: [2.98, 2.94, 3.00, 3.00], botBH: [2.13, 2.10, 2.08, 2.12], botCH: [1.85, 1.86, 1.82, 1.89], completed: true },
      { topSL: [2.84, 2.80, 2.80, 2.75], topBH: [1.91, 2.03, 1.99, 1.99], topCH: [1.83, 1.88, 2.00, 1.82], botSL: [2.90, 2.85, 2.88, 2.82], botBH: [2.05, 2.08, 2.01, 2.04], botCH: [1.80, 1.85, 1.83, 1.81], completed: true },
      { topSL: [2.85, 2.84, 2.85, 2.90], topBH: [2.08, 2.07, 2.05, 2.02], topCH: [1.74, 1.70, 1.71, 1.74], botSL: [2.92, 2.90, 2.94, 2.88], botBH: [2.10, 2.08, 2.06, 2.12], botCH: [1.86, 1.82, 1.84, 1.85], completed: true },
      { topSL: [2.78, 2.84, 2.92, 2.78], topBH: [1.94, 2.12, 2.06, 2.03], topCH: [1.91, 1.95, 1.94, 1.96], botSL: [2.86, 2.88, 2.90, 2.84], botBH: [2.04, 2.10, 2.08, 2.06], botCH: [1.84, 1.88, 1.86, 1.87], completed: true }
    ];

    const EPT = 0.20, BPT = 0.17;

    const loadTinToInputs = (index) => {
      const data = sampleTinsData[index];
      const topSLs = document.querySelectorAll('.seam-top-sl');
      const topBHs = document.querySelectorAll('.seam-top-bh');
      const topCHs = document.querySelectorAll('.seam-top-ch');
      const botSLs = document.querySelectorAll('.seam-bot-sl');
      const botBHs = document.querySelectorAll('.seam-bot-bh');
      const botCHs = document.querySelectorAll('.seam-bot-ch');

      for (let i = 0; i < 4; i++) {
        if (topSLs[i]) topSLs[i].value = data.topSL[i] > 0 ? data.topSL[i] : '';
        if (topBHs[i]) topBHs[i].value = data.topBH[i] > 0 ? data.topBH[i] : '';
        if (topCHs[i]) topCHs[i].value = data.topCH[i] > 0 ? data.topCH[i] : '';
        if (botSLs[i]) botSLs[i].value = data.botSL[i] > 0 ? data.botSL[i] : '';
        if (botBHs[i]) botBHs[i].value = data.botBH[i] > 0 ? data.botBH[i] : '';
        if (botCHs[i]) botCHs[i].value = data.botCH[i] > 0 ? data.botCH[i] : '';
      }

      updateStepperUI(index);
      updateSeamCalculations();
    };

    const resetAllSeamInputs = () => {
      currentTinIndex = 0;
      for (let t = 0; t < 4; t++) {
        sampleTinsData[t] = {
          topSL: [0, 0, 0, 0], topBH: [0, 0, 0, 0], topCH: [0, 0, 0, 0],
          botSL: [0, 0, 0, 0], botBH: [0, 0, 0, 0], botCH: [0, 0, 0, 0],
          completed: false
        };
      }
      document.querySelectorAll('.seam-top-sl, .seam-top-bh, .seam-top-ch, .seam-bot-sl, .seam-bot-bh, .seam-bot-ch').forEach(input => {
        input.value = '';
      });
      updateStepperUI(0);
      document.getElementById('resTopOverlapPercent').textContent = '-- %';
      document.getElementById('resBottomOverlapPercent').textContent = '-- %';
      document.getElementById('resSeamStatus').innerHTML = '<span class="badge" style="font-size:14px; padding:6px 16px; background:#e2e8f0; color:#475569">READY FOR INPUT ⚪</span>';
      showToast('All 4 Tins Seam Matrix cleared & reset for new inspection!', 'info');
    };

    document.getElementById('btnClearSeamSessionQC')?.addEventListener('click', resetAllSeamInputs);

    const readInputsToTin = (index) => {
      const data = sampleTinsData[index];
      const topSLs = document.querySelectorAll('.seam-top-sl');
      const topBHs = document.querySelectorAll('.seam-top-bh');
      const topCHs = document.querySelectorAll('.seam-top-ch');
      const botSLs = document.querySelectorAll('.seam-bot-sl');
      const botBHs = document.querySelectorAll('.seam-bot-bh');
      const botCHs = document.querySelectorAll('.seam-bot-ch');

      for (let i = 0; i < 4; i++) {
        if (topSLs[i]) data.topSL[i] = parseFloat(topSLs[i].value) || 0;
        if (topBHs[i]) data.topBH[i] = parseFloat(topBHs[i].value) || 0;
        if (topCHs[i]) data.topCH[i] = parseFloat(topCHs[i].value) || 0;
        if (botSLs[i]) data.botSL[i] = parseFloat(botSLs[i].value) || 0;
        if (botBHs[i]) data.botBH[i] = parseFloat(botBHs[i].value) || 0;
        if (botCHs[i]) data.botCH[i] = parseFloat(botCHs[i].value) || 0;
      }
      data.completed = true;
    };

    const updateStepperUI = (activeIndex) => {
      for (let i = 0; i < 4; i++) {
        const btn = document.getElementById(`tinStep${i}Btn`);
        const badge = document.getElementById(`tin${i}Badge`);
        if (!btn || !badge) continue;

        if (i === activeIndex) {
          btn.classList.add('active');
          badge.textContent = 'Active 🔵';
          badge.className = 'badge badge-good';
          badge.style.background = '#2563eb';
          badge.style.color = '#fff';
        } else if (sampleTinsData[i] && sampleTinsData[i].completed) {
          btn.classList.remove('active');
          badge.textContent = 'Done ✅';
          badge.className = 'badge badge-good';
          badge.style.background = '#16a34a';
          badge.style.color = '#fff';
        } else {
          btn.classList.remove('active');
          badge.textContent = 'Pending ⚪';
          badge.className = 'badge';
          badge.style.background = '#e2e8f0';
          badge.style.color = '#475569';
        }
      }

      // Dynamic Next Tin Button Text Update
      const nextTinBtn = document.getElementById('btnNextTinQC');
      const nextTinNumSpan = document.getElementById('nextTinNumSpan');
      if (nextTinBtn) {
        if (activeIndex < 3) {
          const nextNum = activeIndex + 2;
          if (nextTinNumSpan) nextTinNumSpan.textContent = nextNum.toString();
          nextTinBtn.innerHTML = `<i class="fa-solid fa-arrow-right"></i> Next Tin (Tin #${nextNum}) ➔`;
        } else {
          if (nextTinNumSpan) nextTinNumSpan.textContent = '1';
          nextTinBtn.innerHTML = `<i class="fa-solid fa-rotate-left"></i> Loop to Tin #1 ➔`;
        }
      }

      // Dynamic Active Tin Header Title Update
      const activeTinTitle = document.getElementById('activeTinTitle');
      if (activeTinTitle) {
        activeTinTitle.innerHTML = `<i class="fa-solid fa-flask" style="color:#2563eb"></i> Inspecting: <strong>Tin #${activeIndex + 1}</strong> <span style="font-size:12px; font-weight:600; color:var(--text-secondary); margin-left:6px">(Sample ${activeIndex + 1} of 4)</span>`;
      }
    };

    for (let i = 0; i < 4; i++) {
      document.getElementById(`tinStep${i}Btn`)?.addEventListener('click', () => {
        readInputsToTin(currentTinIndex);
        currentTinIndex = i;
        loadTinToInputs(currentTinIndex);
      });
    }

    const calcSingleTin = (topSL, topBH, topCH, botSL, botBH, botCH) => {
      const avgTopSL = topSL.reduce((a,b)=>a+b,0)/4;
      const avgTopBH = topBH.reduce((a,b)=>a+b,0)/4;
      const avgTopCH = topCH.reduce((a,b)=>a+b,0)/4;

      const avgBotSL = botSL.reduce((a,b)=>a+b,0)/4;
      const avgBotBH = botBH.reduce((a,b)=>a+b,0)/4;
      const avgBotCH = botCH.reduce((a,b)=>a+b,0)/4;

      const topOL = (avgTopCH + avgTopBH + EPT) - avgTopSL;
      const topDen = avgTopSL - ((2*EPT) + BPT);
      const topPct = topDen > 0 ? (topOL / topDen) * 100 : 0;

      const botOL = (avgBotCH + avgBotBH + EPT) - avgBotSL;
      const botDen = avgBotSL - ((2*EPT) + BPT);
      const botPct = botDen > 0 ? (botOL / botDen) * 100 : 0;

      return { topPct, botPct };
    };

    const validateFieldTolerance = (selector, minVal, maxVal) => {
      document.querySelectorAll(selector).forEach(inp => {
        const val = parseFloat(inp.value);
        if (!isNaN(val) && val > 0) {
          if (val < minVal || val > maxVal) {
            inp.classList.add('input-out-of-spec');
          } else {
            inp.classList.remove('input-out-of-spec');
          }
        } else {
          inp.classList.remove('input-out-of-spec');
        }
      });
    };

    const updateSeamCalculations = () => {
      validateFieldTolerance('.seam-top-sl, .seam-bot-sl', 2.60, 3.00);
      validateFieldTolerance('.seam-top-bh, .seam-bot-bh', 1.80, 2.20);
      validateFieldTolerance('.seam-top-ch, .seam-bot-ch', 1.80, 2.20);

      const topSLs = Array.from(document.querySelectorAll('.seam-top-sl')).map(i => parseFloat(i.value) || 0);
      const topBHs = Array.from(document.querySelectorAll('.seam-top-bh')).map(i => parseFloat(i.value) || 0);
      const topCHs = Array.from(document.querySelectorAll('.seam-top-ch')).map(i => parseFloat(i.value) || 0);

      const botSLs = Array.from(document.querySelectorAll('.seam-bot-sl')).map(i => parseFloat(i.value) || 0);
      const botBHs = Array.from(document.querySelectorAll('.seam-bot-bh')).map(i => parseFloat(i.value) || 0);
      const botCHs = Array.from(document.querySelectorAll('.seam-bot-ch')).map(i => parseFloat(i.value) || 0);

      const res = calcSingleTin(topSLs, topBHs, topCHs, botSLs, botBHs, botCHs);

      document.getElementById('resTopOverlapPercent').textContent = res.topPct.toFixed(2) + ' %';
      document.getElementById('resBottomOverlapPercent').textContent = res.botPct.toFixed(2) + ' %';

      const targetThreshold = parseFloat(appData.haccpTargetOverlapThreshold) || 50.0;

      // Point-by-Point Inside-Table Overlap % Calculation
      for (let pt = 0; pt < 4; pt++) {
        // Top Seam Point
        const slTop = topSLs[pt], bhTop = topBHs[pt], chTop = topCHs[pt];
        const olTop = (chTop + bhTop + EPT) - slTop;
        const denTop = slTop - ((2 * EPT) + BPT);
        const pctTop = (denTop > 0 && slTop > 0) ? (olTop / denTop) * 100 : 0;

        const elTopOL = document.getElementById(`topOLPt${pt + 1}`);
        if (elTopOL) {
          if (pctTop > 0) {
            const isPtPass = pctTop >= targetThreshold;
            elTopOL.textContent = pctTop.toFixed(1) + '%';
            elTopOL.className = `overlap-val-badge ${isPtPass ? 'badge-pass' : 'badge-fail'}`;
          } else {
            elTopOL.textContent = '--%';
            elTopOL.className = 'overlap-val-badge';
          }
        }

        // Bottom Seam Point
        const slBot = botSLs[pt], bhBot = botBHs[pt], chBot = botCHs[pt];
        const olBot = (chBot + bhBot + EPT) - slBot;
        const denBot = slBot - ((2 * EPT) + BPT);
        const pctBot = (denBot > 0 && slBot > 0) ? (olBot / denBot) * 100 : 0;

        const elBotOL = document.getElementById(`botOLPt${pt + 1}`);
        if (elBotOL) {
          if (pctBot > 0) {
            const isPtPass = pctBot >= targetThreshold;
            elBotOL.textContent = pctBot.toFixed(1) + '%';
            elBotOL.className = `overlap-val-badge ${isPtPass ? 'badge-pass' : 'badge-fail'}`;
          } else {
            elBotOL.textContent = '--%';
            elBotOL.className = 'overlap-val-badge';
          }
        }
      }

      const isPass = (res.topPct >= targetThreshold) && (res.botPct >= targetThreshold);
      const statusText = isPass ? `PASS ✅ (Tin #${currentTinIndex + 1} Comply &ge; ${targetThreshold.toFixed(1)}%)` : `FAIL ❌ (Tin #${currentTinIndex + 1} Defect &lt; ${targetThreshold.toFixed(1)}%)`;

      document.getElementById('resSeamStatus').innerHTML = isPass
        ? `<span class="badge badge-good" style="font-size:14px; padding:6px 16px"><i class="fa-solid fa-circle-check"></i> ${statusText}</span>`
        : `<span class="badge badge-expired" style="font-size:14px; padding:6px 16px"><i class="fa-solid fa-triangle-exclamation"></i> ${statusText}</span>`;
    };

    document.querySelectorAll('.seam-top-sl, .seam-top-bh, .seam-top-ch, .seam-bot-sl, .seam-bot-bh, .seam-bot-ch').forEach(input => {
      input.addEventListener('input', updateSeamCalculations);
    });

    // Next Tin Button Handler
    document.getElementById('btnNextTinQC')?.addEventListener('click', () => {
      readInputsToTin(currentTinIndex);
      if (currentTinIndex < 3) {
        currentTinIndex++;
        loadTinToInputs(currentTinIndex);
        showToast(`Advanced to Tin #${currentTinIndex + 1}.`, 'info');
      } else {
        currentTinIndex = 0;
        loadTinToInputs(0);
        showToast(`Returned to Tin #1.`, 'info');
      }
    });

    // Target Overlap Threshold Setup
    appData.haccpTargetOverlapThreshold = appData.haccpTargetOverlapThreshold || 50.0;
    const targetInput = document.getElementById('targetOverlapThresholdInput');
    if (targetInput) {
      targetInput.value = appData.haccpTargetOverlapThreshold;
    }

    const saveTargetThreshold = () => {
      const val = parseFloat(targetInput.value) || 50.0;
      appData.haccpTargetOverlapThreshold = val;
      saveStoredData(appData);
      updateSeamCalculations();
      showToast(`HACCP Target Pass Overlap % Threshold saved as ${val.toFixed(1)}%!`, 'success');
    };

    document.getElementById('btnSaveOverlapThreshold')?.addEventListener('click', saveTargetThreshold);
    targetInput?.addEventListener('change', saveTargetThreshold);

    // Save Complete 4-Tin QC Session Record to History Table Handler
    document.getElementById('btnSaveSeamSessionQC')?.addEventListener('click', () => {
      readInputsToTin(currentTinIndex);

      let totalTopPct = 0, totalBotPct = 0;
      let overallPass = true;

      for (let t = 0; t < 4; t++) {
        const res = calcSingleTin(
          sampleTinsData[t].topSL, sampleTinsData[t].topBH, sampleTinsData[t].topCH,
          sampleTinsData[t].botSL, sampleTinsData[t].botBH, sampleTinsData[t].botCH
        );
        totalTopPct += res.topPct;
        totalBotPct += res.botPct;
        if (res.topPct < 50.0 || res.botPct < 50.0) {
          overallPass = false;
        }
      }

      const avgTopPct = totalTopPct / 4;
      const avgBotPct = totalBotPct / 4;

      const dateEl = document.getElementById('seamDate');
      const batchEl = document.getElementById('seamBatchNo');
      const sizeEl = document.getElementById('seamCanSize');

      const dateVal = (dateEl && dateEl.value) ? dateEl.value : new Date().toISOString().split('T')[0];
      const batchNo = (batchEl && batchEl.value) ? batchEl.value : 'EX502329';
      const canSize = (sizeEl && sizeEl.value) ? sizeEl.value : '425g A1 Tin';

      const masterRecord = {
        id: 'SEAM-' + Date.now().toString().slice(-4),
        date: dateVal,
        batchNo: batchNo,
        canSize: canSize,
        seamLocation: '4 Tins (8 Seam Matrices)',
        topOverlapPercent: avgTopPct.toFixed(2) + ' %',
        botOverlapPercent: avgBotPct.toFixed(2) + ' %',
        status: overallPass ? 'PASS ✅' : 'FAIL ❌ (Defect Found)',
        allTinsData: JSON.parse(JSON.stringify(sampleTinsData))
      };

      appData.seamQcRecords = appData.seamQcRecords || [];
      appData.seamQcRecords.unshift(masterRecord);
      saveStoredData(appData);

      renderSeamQcHistory();
      showToast(`Full 4-Tin Inspection Document for Batch ${batchNo} saved to History Table below!`, 'success');
    });

    const populatePrintSheetWithData = (record) => {
      document.getElementById('printDate').textContent = record.date;
      document.getElementById('printCanSize').textContent = record.canSize;
      document.getElementById('printBatchNo').textContent = record.batchNo;

      const tins = record.allTinsData || sampleTinsData;
      for (let t = 0; t < 4; t++) {
        const data = tins[t];
        if (!data) continue;
        for (let pt = 1; pt <= 4; pt++) {
          const slTop = data.topSL[pt - 1] || 2.80, bhTop = data.topBH[pt - 1] || 2.00, chTop = data.topCH[pt - 1] || 2.00;
          const olTop = (chTop + bhTop + EPT) - slTop;
          const olPctTop = slTop - ((2*EPT) + BPT) > 0 ? (olTop / (slTop - ((2*EPT) + BPT))) * 100 : 0;

          const slBot = data.botSL[pt - 1] || 2.80, bhBot = data.botBH[pt - 1] || 2.00, chBot = data.botCH[pt - 1] || 2.00;
          const olBot = (chBot + bhBot + EPT) - slBot;
          const olPctBot = slBot - ((2*EPT) + BPT) > 0 ? (olBot / (slBot - ((2*EPT) + BPT))) * 100 : 0;

          if (t === 0) {
            const elSLTop = document.getElementById(`fpTopSL${pt}`); if (elSLTop) elSLTop.textContent = slTop.toFixed(2);
            const elBHTop = document.getElementById(`fpTopBH${pt}`); if (elBHTop) elBHTop.textContent = bhTop.toFixed(2);
            const elCHTop = document.getElementById(`fpTopCH${pt}`); if (elCHTop) elCHTop.textContent = chTop.toFixed(2);
            const elOLTop = document.getElementById(`fpTopOL${pt}`); if (elOLTop) elOLTop.textContent = olTop.toFixed(2);
            const elPctTop = document.getElementById(`fpTopPct${pt}`); if (elPctTop) elPctTop.textContent = olPctTop.toFixed(0) + '%';

            const elSLBot = document.getElementById(`fpBotSL${pt}`); if (elSLBot) elSLBot.textContent = slBot.toFixed(2);
            const elBHBot = document.getElementById(`fpBotBH${pt}`); if (elBHBot) elBHBot.textContent = bhBot.toFixed(2);
            const elCHBot = document.getElementById(`fpBotCH${pt}`); if (elCHBot) elCHBot.textContent = chBot.toFixed(2);
            const elOLBot = document.getElementById(`fpBotOL${pt}`); if (elOLBot) elOLBot.textContent = olBot.toFixed(2);
            const elPctBot = document.getElementById(`fpBotPct${pt}`); if (elPctBot) elPctBot.textContent = olPctBot.toFixed(0) + '%';
          }
        }
      }
    };

    document.getElementById('btnPrintSeamQC')?.addEventListener('click', () => {
      populatePrintSheetWithData({
        date: document.getElementById('seamDate').value || new Date().toISOString().split('T')[0],
        canSize: document.getElementById('seamCanSize').value,
        batchNo: document.getElementById('seamBatchNo').value,
        allTinsData: sampleTinsData
      });

      window.print();
    });

    // Close Modal Handler
    document.getElementById('btnCloseSeamModal')?.addEventListener('click', () => {
      document.getElementById('seamQcViewModal').style.display = 'none';
    });

    document.getElementById('btnModalPrintSheet')?.addEventListener('click', () => {
      document.getElementById('seamQcViewModal').style.display = 'none';
      window.print();
    });

    setupSeamHistoryFilters();
    loadTinToInputs(0);
    renderSeamQcHistory();
  }

  let activeSeamFilter = 'all';

  function setupSeamHistoryFilters() {
    const filterTabs = document.getElementById('seamHistoryFilterTabs');
    const pickerWrap = document.getElementById('seamFilterPickerWrap');
    const datePicker = document.getElementById('seamFilterDatePicker');
    const monthPicker = document.getElementById('seamFilterMonthPicker');
    const yearPicker = document.getElementById('seamFilterYearPicker');

    if (!filterTabs) return;

    filterTabs.querySelectorAll('.seam-filter-btn').forEach(btn => {
      btn.addEventListener('click', () => {
        filterTabs.querySelectorAll('.seam-filter-btn').forEach(b => b.classList.remove('active'));
        btn.classList.add('active');

        activeSeamFilter = btn.getAttribute('data-filter');

        if (pickerWrap) {
          if (activeSeamFilter === 'custom') {
            pickerWrap.style.display = 'flex';
            if (datePicker) { datePicker.style.display = 'inline-block'; datePicker.value = new Date().toISOString().split('T')[0]; }
            if (monthPicker) monthPicker.style.display = 'none';
            if (yearPicker) yearPicker.style.display = 'none';
          } else if (activeSeamFilter === 'monthly') {
            pickerWrap.style.display = 'flex';
            if (datePicker) datePicker.style.display = 'none';
            if (monthPicker) { monthPicker.style.display = 'inline-block'; monthPicker.value = new Date().toISOString().slice(0, 7); }
            if (yearPicker) yearPicker.style.display = 'none';
          } else if (activeSeamFilter === 'yearly') {
            pickerWrap.style.display = 'flex';
            if (datePicker) datePicker.style.display = 'none';
            if (monthPicker) monthPicker.style.display = 'none';
            if (yearPicker) { yearPicker.style.display = 'inline-block'; yearPicker.value = new Date().getFullYear().toString(); }
          } else {
            pickerWrap.style.display = 'none';
          }
        }

        renderSeamQcHistory();
      });
    });

    datePicker?.addEventListener('change', renderSeamQcHistory);
    monthPicker?.addEventListener('change', renderSeamQcHistory);
    yearPicker?.addEventListener('change', renderSeamQcHistory);
  }

  function renderSeamQcHistory() {
    const tbody = document.getElementById('seamHistoryBody');
    const badge = document.getElementById('seamRecordCountBadge');
    if (!tbody || !appData.seamQcRecords) return;

    const todayStr = new Date().toISOString().split('T')[0];
    const currentMonthStr = todayStr.slice(0, 7);
    const currentYearStr = todayStr.slice(0, 4);

    const datePicker = document.getElementById('seamFilterDatePicker');
    const monthPicker = document.getElementById('seamFilterMonthPicker');
    const yearPicker = document.getElementById('seamFilterYearPicker');

    let filteredRecords = appData.seamQcRecords.map((item, originalIndex) => ({ item, originalIndex }));

    if (activeSeamFilter === 'daily') {
      filteredRecords = filteredRecords.filter(r => r.item.date === todayStr);
      if (badge) badge.textContent = `Showing Today (${todayStr}) • ${filteredRecords.length} Records`;
    } else if (activeSeamFilter === 'monthly') {
      const selectedMonth = (monthPicker && monthPicker.value) ? monthPicker.value : currentMonthStr;
      filteredRecords = filteredRecords.filter(r => r.item.date && r.item.date.startsWith(selectedMonth));
      if (badge) badge.textContent = `Showing Month (${selectedMonth}) • ${filteredRecords.length} Records`;
    } else if (activeSeamFilter === 'yearly') {
      const selectedYear = (yearPicker && yearPicker.value) ? yearPicker.value : currentYearStr;
      filteredRecords = filteredRecords.filter(r => r.item.date && r.item.date.startsWith(selectedYear));
      if (badge) badge.textContent = `Showing Year (${selectedYear}) • ${filteredRecords.length} Records`;
    } else if (activeSeamFilter === 'custom') {
      const selectedDate = (datePicker && datePicker.value) ? datePicker.value : todayStr;
      filteredRecords = filteredRecords.filter(r => r.item.date === selectedDate);
      if (badge) badge.textContent = `Showing Date (${selectedDate}) • ${filteredRecords.length} Records`;
    } else {
      if (badge) badge.textContent = `Showing All (${appData.seamQcRecords.length} Records)`;
    }

    if (filteredRecords.length === 0) {
      tbody.innerHTML = `
        <tr>
          <td colspan="8" style="text-align:center; padding:32px; color:var(--text-secondary)">
            <i class="fa-solid fa-folder-open" style="font-size:28px; color:#cbd5e1; margin-bottom:8px"></i><br>
            <strong>No inspection records found for the selected filter period.</strong>
          </td>
        </tr>
      `;
      return;
    }

    tbody.innerHTML = filteredRecords.map(({ item, originalIndex }) => `
      <tr>
        <td data-label="Date">${item.date}</td>
        <td data-label="Batch No."><code>${item.batchNo}</code></td>
        <td data-label="Can Size">${item.canSize}</td>
        <td data-label="Samples"><strong>${item.seamLocation || '4 Tins (8 Matrices)'}</strong></td>
        <td data-label="Top Overlap %" style="font-weight:700; color:var(--accent-blue)">${item.topOverlapPercent || 'N/A'}</td>
        <td data-label="Bottom Overlap %" style="font-weight:700; color:var(--accent-green)">${item.botOverlapPercent || 'N/A'}</td>
        <td data-label="Status"><span class="badge ${item.status.includes('PASS') ? 'badge-good' : 'badge-expired'}">${item.status}</span></td>
        <td data-label="Action" style="text-align:center">
          <div style="display:flex; gap:6px; justify-content:center; flex-wrap:nowrap">
            <button type="button" class="btn-outline-blue btn-view-seam-rec" data-index="${originalIndex}" style="padding:5px 9px; font-size:11px; white-space:nowrap; flex-shrink:0" title="View Full 4-Tin Document Details (👁️)">
              <i class="fa-solid fa-eye"></i> View
            </button>
            <button type="button" class="btn-outline-blue btn-edit-seam-rec" data-index="${originalIndex}" style="padding:5px 9px; font-size:11px; color:#2563eb; white-space:nowrap; flex-shrink:0" title="Edit Master Record (✏️)">
              <i class="fa-solid fa-pen-to-square"></i> Edit
            </button>
            <button type="button" class="btn-outline-blue btn-print-seam-rec" data-index="${originalIndex}" style="padding:5px 9px; font-size:11px; color:#059669; border-color:#34d399; white-space:nowrap; flex-shrink:0" title="Print / Download PDF Sheet (🖨️)">
              <i class="fa-solid fa-file-pdf"></i> PDF Sheet
            </button>
            <button type="button" class="btn-outline-blue btn-delete-seam-rec" data-index="${originalIndex}" style="padding:5px 9px; font-size:11px; color:#ef4444; border-color:#f87171; white-space:nowrap; flex-shrink:0" title="Delete Record">
              <i class="fa-solid fa-trash"></i>
            </button>
          </div>
        </td>
      </tr>
    `).join('');

    // View Modal Trigger
    tbody.querySelectorAll('.btn-view-seam-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const item = appData.seamQcRecords[idx];
        document.getElementById('modalBatchTitle').textContent = `HACCP QC Full Document: ${item.batchNo}`;
        
        document.getElementById('modalSeamContent').innerHTML = `
          <div style="display:grid; grid-template-columns:1fr 1fr; gap:16px; margin-bottom:20px; font-size:13px; background:#f8fafc; padding:12px; border-radius:8px">
            <div><strong>Inspection Date:</strong> ${item.date}</div>
            <div><strong>Can Size:</strong> ${item.canSize}</div>
            <div><strong>Top Avg Overlap %:</strong> <span style="font-weight:800; color:#2563eb">${item.topOverlapPercent}</span></div>
            <div><strong>Bottom Avg Overlap %:</strong> <span style="font-weight:800; color:#059669">${item.botOverlapPercent}</span></div>
            <div><strong>HACCP Decision:</strong> <span class="badge ${item.status.includes('PASS') ? 'badge-good' : 'badge-expired'}">${item.status}</span></div>
            <div><strong>Document Standard:</strong> SC&E REG 06 12</div>
          </div>
          <div style="font-size:13px; font-weight:700; color:var(--primary-navy); margin-bottom:8px">Full 4-Tin Circumferential Measurements (Top &amp; Bottom)</div>
          <div style="font-size:12px; color:var(--text-secondary)">All 4 sampled tins verified. Click 'Print / Download PDF Sheet' below to output the official physical sheet replica.</div>
        `;
        document.getElementById('seamQcViewModal').style.display = 'flex';
      });
    });

    // Edit Handler
    tbody.querySelectorAll('.btn-edit-seam-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const item = appData.seamQcRecords[idx];
        document.getElementById('seamDate').value = item.date;
        document.getElementById('seamBatchNo').value = item.batchNo;
        document.getElementById('seamCanSize').value = item.canSize;
        showToast(`Loaded ${item.batchNo} master session into form for editing.`, 'info');
      });
    });

    // PDF Print Handler
    tbody.querySelectorAll('.btn-print-seam-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const item = appData.seamQcRecords[idx];
        
        document.getElementById('printDate').textContent = item.date;
        document.getElementById('printCanSize').textContent = item.canSize;
        document.getElementById('printBatchNo').textContent = item.batchNo;

        window.print();
      });
    });

    // Delete Handler
    tbody.querySelectorAll('.btn-delete-seam-rec').forEach(btn => {
      btn.addEventListener('click', () => {
        const idx = parseInt(btn.getAttribute('data-index'));
        appData.seamQcRecords.splice(idx, 1);
        saveStoredData(appData);
        renderSeamQcHistory();
        showToast('Full QC Session Record deleted.', 'info');
      });
    });
  }

  // Universal Excel (.xlsx) Export Handler
  document.querySelectorAll('.btn-export-excel').forEach(btn => {
    btn.addEventListener('click', () => {
      const targetTableId = btn.getAttribute('data-target');
      const filename = btn.getAttribute('data-name') || 'Sakwa_Stock_Export.xlsx';
      const tableEl = document.getElementById(targetTableId);
      
      if (tableEl && window.XLSX) {
        const wb = XLSX.utils.table_to_book(tableEl, { sheet: "Sakwa Stock Report" });
        XLSX.writeFile(wb, filename);
        showToast(`Exported ${filename} successfully!`, 'success');
      } else {
        showToast('Unable to export table. SheetJS engine ready.', 'info');
      }
    });
  });

  // Real-Time Copeland Dixell XR06CX Telemetry Stream Simulator
  setInterval(() => {
    const liveTempEl = document.getElementById('liveColdRoomTemp');
    const roomTempEl = document.getElementById('telemetryRoomTemp');
    const evapTempEl = document.getElementById('telemetryEvapTemp');

    // Smooth fluctuation around -18.4 °C and -22.1 °C
    const baseRoom = -18.4 + ((Math.random() - 0.5) * 0.4);
    const baseEvap = -22.1 + ((Math.random() - 0.5) * 0.5);

    if (liveTempEl) liveTempEl.textContent = baseRoom.toFixed(1);
    if (roomTempEl) roomTempEl.textContent = baseRoom.toFixed(1);
    if (evapTempEl) evapTempEl.textContent = baseEvap.toFixed(1);
  }, 2500);

  // Step 2: Instant Live Search Filter across all active tables
  const globalSearchInput = document.getElementById('globalTableSearch');
  globalSearchInput?.addEventListener('input', (e) => {
    const query = e.target.value.toLowerCase().trim();
    const activeTables = document.querySelectorAll('.view-panel.active table, .tab-content.active table');
    
    activeTables.forEach(table => {
      const rows = table.querySelectorAll('tbody tr');
      rows.forEach(tr => {
        const text = tr.textContent.toLowerCase();
        tr.style.display = text.includes(query) ? '' : 'none';
      });
    });
  });

  // Step 4: Dark / Light Theme Toggle Handler
  const btnThemeToggle = document.getElementById('btnThemeToggle');
  const themeIcon = document.getElementById('themeIcon');
  const savedTheme = localStorage.getItem('SAKWA_THEME_MODE') || 'light';

  const applyTheme = (theme) => {
    if (theme === 'dark') {
      document.body.classList.add('dark-theme');
      if (themeIcon) themeIcon.className = 'fa-solid fa-sun';
    } else {
      document.body.classList.remove('dark-theme');
      if (themeIcon) themeIcon.className = 'fa-solid fa-moon';
    }
  };

  applyTheme(savedTheme);

  btnThemeToggle?.addEventListener('click', () => {
    const isDark = document.body.classList.contains('dark-theme');
    const newTheme = isDark ? 'light' : 'dark';
    localStorage.setItem('SAKWA_THEME_MODE', newTheme);
    applyTheme(newTheme);
    showToast(`Switched to ${newTheme.toUpperCase()} theme mode!`, 'info');
  });

  /* ==========================================================================
     9. MASTER SETTINGS & DYNAMIC DROPDOWN MANAGER MODULE
     ========================================================================== */
  function initMasterSettingsModule() {
    const tabs = document.querySelectorAll('#masterCategoryTabs .tab-btn');
    tabs.forEach(tab => {
      tab.addEventListener('click', () => {
        tabs.forEach(t => t.classList.remove('active'));
        tab.classList.add('active');
        activeMasterCategory = tab.getAttribute('data-cat');
        renderMasterOptionsTable();
      });
    });

    const inputEl = document.getElementById('newMasterOptionName');
    const addOptHandler = () => {
      const val = inputEl ? inputEl.value.trim() : '';
      if (!val) {
        showToast('Please enter an option name.', 'info');
        return;
      }

      masterDropdowns[activeMasterCategory] = masterDropdowns[activeMasterCategory] || [];
      if (masterDropdowns[activeMasterCategory].includes(val)) {
        showToast('This option already exists!', 'info');
        return;
      }

      masterDropdowns[activeMasterCategory].push(val);
      saveMasterDropdowns();
      if (inputEl) inputEl.value = '';
      renderMasterOptionsTable();
      syncAllFormDropdowns();
      showToast(`Added "${val}" to dropdown lists successfully!`, 'success');
    };

    document.getElementById('btnAddMasterOption')?.addEventListener('click', addOptHandler);
    inputEl?.addEventListener('keypress', (e) => {
      if (e.key === 'Enter') addOptHandler();
    });

    renderMasterOptionsTable();
    syncAllFormDropdowns();
  }

  function saveMasterDropdowns() {
    localStorage.setItem('SAKWA_MASTER_DROPDOWNS', JSON.stringify(masterDropdowns));
  }

  function renderMasterOptionsTable() {
    const tbody = document.getElementById('masterOptionsBody');
    if (!tbody) return;

    const list = masterDropdowns[activeMasterCategory] || [];
    tbody.innerHTML = list.map((item, idx) => `
      <tr>
        <td data-label="#">${idx + 1}</td>
        <td data-label="Option Name" style="font-weight:600">${item}</td>
        <td data-label="Action" style="text-align:center">
          <button type="button" class="btn-outline-blue btn-delete-master-opt" data-index="${idx}" style="padding:3px 10px; font-size:11px; color:#ef4444; border-color:#f87171">
            <i class="fa-solid fa-trash"></i> Remove
          </button>
        </td>
      </tr>
    `).join('');

    tbody.querySelectorAll('.btn-delete-master-opt').forEach(btn => {
      btn.addEventListener('click', (e) => {
        const idx = parseInt(btn.getAttribute('data-index'));
        const removed = masterDropdowns[activeMasterCategory].splice(idx, 1);
        saveMasterDropdowns();
        renderMasterOptionsTable();
        syncAllFormDropdowns();
        showToast(`Removed "${removed[0]}" from list.`, 'info');
      });
    });
  }

  function syncAllFormDropdowns() {
    populateSelectOptions('fanFishSpecies', masterDropdowns.fishSpecies);
    populateSelectOptions('fanBoxType', masterDropdowns.boxTypes);
    populateSelectOptions('grnSupplier', masterDropdowns.suppliers);
    populateSelectOptions('fanSupplier', masterDropdowns.suppliers);
    populateSelectOptions('issueDept', masterDropdowns.departments);
    populateSelectOptions('seamInspector', masterDropdowns.inspectors);
    populateSelectOptions('grnReceivedBy', masterDropdowns.inspectors);
    populateSelectOptions('issueIssuedBy', masterDropdowns.inspectors);
  }

  function populateSelectOptions(selectId, items) {
    const select = document.getElementById(selectId);
    if (!select || !items) return;
    const currentVal = select.value;
    select.innerHTML = items.map(item => `<option value="${item}">${item}</option>`).join('');
    if (items.includes(currentVal)) {
      select.value = currentVal;
    }
  }

  /* ==========================================================================
     HELPER: TOAST NOTIFICATIONS
     ========================================================================== */
  function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    const icon = type === 'success' ? 'fa-circle-check' : 'fa-circle-info';
    toast.innerHTML = `<i class="fa-solid ${icon}"></i> <span>${message}</span>`;

    toastContainer.appendChild(toast);

    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.3s ease';
      setTimeout(() => toast.remove(), 300);
    }, 3500);
  }

});
