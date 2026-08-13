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

  // Set initial mode (Public Website)
  setAppMode('public-mode');

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

  /* ==========================================================================
     MODE ROUTING ENGINE (PUBLIC vs LOGIN vs INVENTORY APP)
     ========================================================================== */
  function setAppMode(modeName) {
    appBody.className = modeName;
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
    btnBackToHome?.addEventListener('click', () => setAppMode('public-mode'));
    btnHeaderPublicWebsite?.addEventListener('click', () => {
      setAppMode('public-mode');
      showToast('Switched to Sakwa Canneries Public Website', 'info');
    });

    // Logout Button
    logoutBtn?.addEventListener('click', () => {
      setAppMode('public-mode');
      showToast('Logged out of Inventory System', 'info');
    });

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

  function executeLogin(username) {
    document.getElementById('currentUserName').textContent = username;
    setAppMode('app-mode');
    switchView('dashboard');
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
          <option value="Raw Fish (Mackerel)" ${item.type.includes('Mackerel') ? 'selected' : ''}>Raw Fish (Mackerel)</option>
          <option value="Raw Fish (Tuna)" ${item.type.includes('Tuna') ? 'selected' : ''}>Raw Fish (Tuna)</option>
          <option value="Empty Cans (Rigiform)" ${item.type.includes('Rigiform') ? 'selected' : ''}>Empty Cans (Rigiform)</option>
          <option value="Empty Cans (Plastic)" ${item.type.includes('Plastic') ? 'selected' : ''}>Empty Cans (Plastic)</option>
          <option value="Salt" ${item.type.includes('Salt') ? 'selected' : ''}>Salt</option>
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
    });

    appData.grnRecords.unshift(grnRecord);
    saveStoredData(appData);

    renderDashboardMetrics();
    showToast('Goods Receipt Note (GRN) saved successfully and stock updated!', 'success');
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
    rows.forEach(tr => {
      const type = tr.querySelector('.issue-type').value;
      const batchNo = tr.querySelector('.issue-batch').value;
      const unit = tr.querySelector('.issue-unit').value;
      const quantity = parseFloat(tr.querySelector('.issue-qty').value) || 0;
      const remarks = tr.querySelector('.issue-remarks').value;

      issueRecord.items.push({ type, batchNo, unit, quantity, remarks });

      if (type.includes('Mackerel')) appData.stockSummary.rawFish = Math.max(0, appData.stockSummary.rawFish - quantity);
      if (type.includes('Salt')) appData.stockSummary.saltStock = Math.max(0, appData.stockSummary.saltStock - quantity);
      if (type.includes('Oil')) appData.stockSummary.oilStock = Math.max(0, appData.stockSummary.oilStock - quantity);
      if (type.includes('Rigiform')) {
        appData.stockSummary.rigiformCans = Math.max(0, appData.stockSummary.rigiformCans - quantity);
        appData.stockSummary.emptyCans = Math.max(0, appData.stockSummary.emptyCans - quantity);
      }
    });

    appData.issueRecords.unshift(issueRecord);
    saveStoredData(appData);

    renderDashboardMetrics();
    showToast('Stock Issued to Production successfully! Stock balance deducted.', 'success');
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
      rawBody.innerHTML = appData.rawMaterialsStock.map(item => `
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
        </tr>
      `).join('');
    }

    const pkgBody = document.getElementById('packagingStockBody');
    if (pkgBody) {
      pkgBody.innerHTML = appData.packagingMaterialsStock.map(item => `
        <tr>
          <td data-label="Material Code"><code>${item.materialCode}</code></td>
          <td data-label="Description" style="font-weight:600">${item.name}</td>
          <td data-label="Total Received">${item.received.toLocaleString()}</td>
          <td data-label="Total Issued">${item.issued.toLocaleString()}</td>
          <td data-label="Current Balance" style="font-weight:700; color:var(--accent-green)">${item.balance.toLocaleString()}</td>
          <td data-label="Unit">${item.unit}</td>
        </tr>
      `).join('');
    }

    const wipBody = document.getElementById('wipStockBody');
    if (wipBody) {
      wipBody.innerHTML = appData.wipStock.map(item => `
        <tr>
          <td data-label="Production Date">${item.productionDate}</td>
          <td data-label="Batch No."><code>${item.batchNo}</code></td>
          <td data-label="Retort Lot"><code>${item.retortLot}</code></td>
          <td data-label="Fish Issued">${item.fishIssuedKg.toLocaleString()} kg</td>
          <td data-label="Usage">${item.brineOilUsage}</td>
          <td data-label="Cans Produced" style="font-weight:700">${item.cansProduced.toLocaleString()}</td>
          <td data-label="Status"><span class="badge badge-good">${item.status}</span></td>
        </tr>
      `).join('');
    }

    const fgBody = document.getElementById('fgStockBody');
    if (fgBody) {
      fgBody.innerHTML = appData.finishedGoodsStock.map(item => `
        <tr>
          <td data-label="Product" style="font-weight:600">${item.brandProduct}</td>
          <td data-label="Batch No."><code>${item.batchNo}</code></td>
          <td data-label="Mfg Date">${item.prodDate}</td>
          <td data-label="Expiry Date">${item.expiryDate}</td>
          <td data-label="Total Cartons">${item.totalCartons.toLocaleString()}</td>
          <td data-label="Total Cans">${item.totalCans.toLocaleString()}</td>
          <td data-label="Dispatched">${item.dispatchedQty.toLocaleString()}</td>
          <td data-label="Balance Cartons" style="font-weight:700; color:var(--accent-purple)">${item.balanceCartons.toLocaleString()}</td>
          <td data-label="Balance Cans" style="font-weight:700; color:var(--accent-blue)">${item.balanceCans.toLocaleString()}</td>
        </tr>
      `).join('');
    }
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
