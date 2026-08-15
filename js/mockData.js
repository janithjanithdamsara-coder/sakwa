/**
 * Default Mock Data for Canning Factory Inventory System
 */
const DEFAULT_FACTORY_DATA = {
  stockSummary: {
    rawFish: 12450, // kg
    emptyCans: 28560, // Total (Rigiform Cans: 18,200, Plastic Boxes: 10,360)
    rigiformCans: 18200,
    plasticBoxes: 10360,
    saltStock: 2150, // kg
    oilStock: 1320 // L
  },

  charts: {
    dailyProduction: {
      labels: ['12 May', '13 May', '14 May', '15 May', '16 May', '17 May', '18 May'],
      data: [2100, 3400, 2900, 2400, 3100, 1800, 2600]
    },
    weeklyProduction: {
      labels: ['Wk 1', 'Wk 2', 'Wk 3', 'Wk 4'],
      data: [18500, 24200, 21800, 26400]
    },
    monthlyWaste: {
      labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
      data: [1800, 1200, 1600, 1100, 1500, 950]
    }
  },

  fishArrivals: [
    {
      id: 'FAN-2025-05-018',
      date: '2025-05-18',
      time: '08:45 AM',
      supplierName: 'Seagold Fisheries',
      vehicleNo: 'WP - 1234',
      driverName: 'Kamal Perera',
      fishSpecies: 'Mackerel',
      boxType: 'Rigiform',
      noOfBoxes: 120,
      cansPerBox: 50,
      supplierWeight: 3600,
      rejectWeight: 240,
      lossWeight: 60,
      netWeight: 3300,
      remarks: 'Good Quality Fish.'
    },
    {
      id: 'FAN-2025-05-017',
      date: '2025-05-16',
      time: '10:15 AM',
      supplierName: 'Ocean Deep Catch Ltd',
      vehicleNo: 'CP - 5678',
      driverName: 'Sunil Shantha',
      fishSpecies: 'Tuna',
      boxType: 'Plastic',
      noOfBoxes: 90,
      cansPerBox: 40,
      supplierWeight: 2800,
      rejectWeight: 100,
      lossWeight: 40,
      netWeight: 2660,
      remarks: 'Fresh catch, temperature verified -18C.'
    }
  ],

  grnRecords: [
    {
      grnNo: 'GRN-2025-05-018',
      date: '2025-05-18',
      supplierName: 'Seagold Fisheries',
      vehicleNo: 'WP - 1234',
      driverName: 'Kamal Perera',
      receivedBy: 'Storekeeper',
      totalAmount: 1205000,
      status: 'Saved',
      items: [
        { type: 'Raw Fish (Mackerel)', name: 'Frozen Mackerel Grade A', unit: 'kg', quantity: 3300, unitPrice: 300, total: 990000 },
        { type: 'Empty Cans (Rigiform)', name: '425g Tin Cans Standard', unit: 'Nos', quantity: 2000, unitPrice: 25, total: 50000 },
        { type: 'Salt', name: 'Iodized Industrial Salt', unit: 'kg', quantity: 500, unitPrice: 120, total: 60000 },
        { type: 'Oil', name: 'Refined Palm Oil', unit: 'L', quantity: 300, unitPrice: 350, total: 105000 }
      ]
    }
  ],

  issueRecords: [
    {
      issueNo: 'ISS-2025-06-018',
      date: '2025-05-18',
      department: 'Fish Canning Line - 1',
      issuedBy: 'Storekeeper',
      authorizedBy: 'Nimal Perera',
      remarks: 'Production Issue.',
      items: [
        { type: 'Raw Fish (Mackerel)', batchNo: 'FISH-2025-05-18-01', unit: 'kg', quantity: 2000, remarks: 'For Production' },
        { type: 'Empty Cans (Rigiform)', batchNo: 'CAN-2025-05-10-02', unit: 'Nos', quantity: 10000, remarks: '' },
        { type: 'Lids (For Cans)', batchNo: 'LID-2025-05-10-03', unit: 'Nos', quantity: 10000, remarks: '' },
        { type: 'Salt', batchNo: 'SALT-2025-05-12-01', unit: 'kg', quantity: 150, remarks: '' },
        { type: 'Oil', batchNo: 'OIL-2025-05-12-01', unit: 'L', quantity: 100, remarks: '' }
      ]
    }
  ],

  rawMaterialsStock: [
    { id: 'RM-01', name: 'Local Fish (Chill Fish) - Cool Room', category: 'Raw Fish', supplier: 'Local Harbours', lotBatch: 'FISH-LOC-2025-05-18', receivedQty: 15000, issuedQty: 2550, balance: 12450, unit: 'kg', expiry: '2025-06-18' },
    { id: 'RM-02', name: 'Frozen Pacific Mackerel - Cool Room', category: 'Raw Fish', supplier: 'Seagold Fisheries', lotBatch: 'FISH-PAC-2025-05-16', receivedQty: 18000, issuedQty: 4200, balance: 13800, unit: 'kg', expiry: '2025-11-30' },
    { id: 'RM-03', name: 'Salt (1 kg Packets)', category: 'Salt', supplier: 'Lanka Salt Ltd', lotBatch: 'SALT-1KG-2025-01', receivedQty: 5000, issuedQty: 1200, balance: 3800, unit: 'Packets (kg)', expiry: '2026-06-01' },
    { id: 'RM-04', name: 'Salt (25 kg Sacks)', category: 'Salt', supplier: 'Industrial Salt Suppliers', lotBatch: 'SALT-25KG-2025-01', receivedQty: 200, issuedQty: 45, balance: 155, unit: 'Sacks (25kg)', expiry: '2026-06-01' }
  ],

  packagingMaterialsStock: [
    { id: 'PM-01', materialCode: 'CAN-425-RIG', name: '425g Rigiform Tin Cans', received: 45000, issued: 26800, balance: 18200, unit: 'Nos' },
    { id: 'PM-02', materialCode: 'BOX-PLAST-01', name: 'Plastic Fish Storage Boxes', received: 15000, issued: 4640, balance: 10360, unit: 'Nos' },
    { id: 'PM-03', materialCode: 'LID-425-STD', name: '425g Easy-Open Lid Seals', received: 50000, issued: 24000, balance: 26000, unit: 'Nos' },
    { id: 'PM-04', materialCode: 'LBL-MAC-TOM', name: 'Mackerel in Tomato Sauce Paper Labels', received: 30000, issued: 18500, balance: 11500, unit: 'Nos' },
    { id: 'PM-05', materialCode: 'CRT-CORR-24', name: '24-Pack Master Outer Cartons', received: 5000, issued: 3200, balance: 1800, unit: 'Cartons' },
    { id: 'PM-06', materialCode: 'POLY-WRAP-HD', name: 'HDPE Polythene Liner Sheets', received: 2000, issued: 1450, balance: 550, unit: 'Rolls' },
    { id: 'PM-07', materialCode: 'TPE-SEAL-72', name: '72mm Heavy Duty Carton Sealing Tape', received: 800, issued: 610, balance: 190, unit: 'Rolls' }
  ],

  wipStock: [
    { id: 'WIP-101', productionDate: '2025-05-18', batchNo: 'BATCH-2025-05-18-A', retortLot: 'RETORT-L-04', fishIssuedKg: 2000, brineOilUsage: '150L Brine / 100L Oil', cansProduced: 9600, status: 'In Retort Sterilization' },
    { id: 'WIP-102', productionDate: '2025-05-17', batchNo: 'BATCH-2025-05-17-B', retortLot: 'RETORT-L-03', fishIssuedKg: 2400, brineOilUsage: '180L Tomato Sauce', cansProduced: 11500, status: 'Cooling & Labeling' },
    { id: 'WIP-103', productionDate: '2025-05-16', batchNo: 'BATCH-2025-05-16-C', retortLot: 'RETORT-L-02', fishIssuedKg: 1800, brineOilUsage: '120L Vegetable Oil', cansProduced: 8600, status: 'Incubation Quality Check' }
  ],

  finishedGoodsStock: [
    { id: 'FG-01', brandProduct: 'Sakwa 425g x 24 Cans (Mackerel in Tomato)', batchNo: 'BATCH-2025-05-10', prodDate: '2025-05-10', expiryDate: '2028-05-10', cansPerCarton: 24, totalCartons: 1250, totalCans: 30000, dispatchedQty: 10000, balanceCartons: 833, balanceCans: 20000, qualityStatus: 'MAIN BATCH 🟢' },
    { id: 'FG-02', brandProduct: 'Luhu 425g x 24 Cans (Mackerel in Brine)', batchNo: 'BATCH-2025-05-12', prodDate: '2025-05-12', expiryDate: '2028-05-12', cansPerCarton: 24, totalCartons: 900, totalCans: 21600, dispatchedQty: 4800, balanceCartons: 700, balanceCans: 16800, qualityStatus: 'HOLD BATCH 🟡 (Quarantine)' },
    { id: 'FG-03', brandProduct: 'Skipper 425g x 24 Cans (Tuna in Oil)', batchNo: 'BATCH-2025-05-14', prodDate: '2025-05-14', expiryDate: '2028-05-14', cansPerCarton: 24, totalCartons: 600, totalCans: 14400, dispatchedQty: 2400, balanceCartons: 500, balanceCans: 12000, qualityStatus: 'MAIN BATCH 🟢' },
    { id: 'FG-04', brandProduct: 'Calido 425g x 24 Cans (Mackerel in Sauce)', batchNo: 'BATCH-2025-05-18', prodDate: '2025-05-18', expiryDate: '2028-05-18', cansPerCarton: 24, totalCartons: 400, totalCans: 9600, dispatchedQty: 0, balanceCartons: 400, balanceCans: 9600, qualityStatus: 'HOLD BATCH 🟡 (Micro Testing)' }
  ],

  reorderAlerts: [
    { id: 'RA-01', itemType: 'Empty Cans', itemName: 'Rigiform Cans', currentStock: '2,150 Nos', reorderLevel: '5,000 Nos', status: 'Low Stock' },
    { id: 'RA-02', itemType: 'Empty Cans', itemName: 'Plastic Boxes', currentStock: '1,230 Nos', reorderLevel: '3,000 Nos', status: 'Low Stock' },
    { id: 'RA-03', itemType: 'Salt', itemName: 'Iodized Salt', currentStock: '180 kg', reorderLevel: '500 kg', status: 'Low Stock' },
    { id: 'RA-04', itemType: 'Oil', itemName: 'Palm Oil', currentStock: '90 L', reorderLevel: '200 L', status: 'Low Stock' },
    { id: 'RA-05', itemType: 'Packaging', itemName: 'Master Cartons 24s', currentStock: '320 Cartons', reorderLevel: '1,000 Cartons', status: 'Low Stock' }
  ],

  expiryItems: [
    { id: 'EXP-01', itemType: 'Salt', itemName: 'Iodized Salt', batchNo: 'SALT-2025-01-10', mfgDate: '2025-01-10', expiryDate: '2025-08-10', daysLeft: 83, status: 'Good' },
    { id: 'EXP-02', itemType: 'Oil', itemName: 'Palm Oil', batchNo: 'OIL-2025-01-15', mfgDate: '2025-01-15', expiryDate: '2025-07-15', daysLeft: 57, status: 'Expiring Soon' },
    { id: 'EXP-03', itemType: 'Salt', itemName: 'Iodized Salt', batchNo: 'SALT-2024-12-01', mfgDate: '2024-12-01', expiryDate: '2025-06-01', daysLeft: 13, status: 'Expiring Soon' },
    { id: 'EXP-04', itemType: 'Oil', itemName: 'Palm Oil', batchNo: 'OIL-2024-12-20', mfgDate: '2024-12-20', expiryDate: '2025-05-20', daysLeft: 1, status: 'Expired' }
  ],

  seamQcRecords: [
    {
      id: 'SEAM-01',
      date: '2025-09-01',
      batchNo: 'BATCH-2025-05-10',
      canSize: '425g A1 Tin (Standard)',
      inspector: 'Line #1 • HACCP Team',
      avgSL: '2.83 mm',
      avgBH: '1.90 mm',
      avgCH: '1.78 mm',
      actualOverlap: '1.10 mm',
      overlapPercent: '49.33 %',
      status: 'PASS ✅'
    },
    {
      id: 'SEAM-02',
      date: '2025-09-01',
      batchNo: 'BATCH-2025-05-12',
      canSize: '425g Easy-Open Lid',
      inspector: 'Line #2 • HACCP Team',
      avgSL: '2.91 mm',
      avgBH: '1.89 mm',
      avgCH: '1.86 mm',
      actualOverlap: '1.04 mm',
      overlapPercent: '45.57 %',
      status: 'FAIL ❌'
    }
  ],

  masterRawMaterials: [
    'Local Fish (Chill Fish) - Cool Room',
    'Frozen Pacific Mackerel - Cool Room',
    'Salt (1kg / 25kg Packets & Sacks)',
    'Water (Potable Water)'
  ],

  masterPackingMaterials: [
    '300 Ø A1 S/R Stackable Can with Ends (Primary)',
    'Label - Sakwa J.M (Secondary)',
    'Label - Sakwa M (Secondary)',
    'Label - Luhu (Secondary)',
    'Corrugated Box / Master Carton (Secondary)'
  ],

  masterFinishedGoods: [
    'Sakwa 425g x 24 Cans',
    'Luhu 425g x 24 Cans',
    'Skipper 425g x 24 Cans',
    'Calido 425g x 24 Cans'
  ],

  masterBoilerFuels: [
    'Kerosene (Industrial Grade)',
    'Diesel (Automotive Gas Oil)',
    'Industrial Oil (Furnace Fuel)'
  ],

  qualityDispositions: [
    'HOLD BATCH (Quarantine / QC Inspection Pending)',
    'MAIN BATCH (Approved for Distribution)'
  ]
};

// Initialize localStorage if not present
function getStoredData() {
  const data = localStorage.getItem('CANNING_FACTORY_DATA');
  if (!data) {
    localStorage.setItem('CANNING_FACTORY_DATA', JSON.stringify(DEFAULT_FACTORY_DATA));
    return DEFAULT_FACTORY_DATA;
  }
  return JSON.parse(data);
}

function saveStoredData(data) {
  localStorage.setItem('CANNING_FACTORY_DATA', JSON.stringify(data));
}
