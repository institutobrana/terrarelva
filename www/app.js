const STORAGE_KEY = "terra-relva-app-state-v5";
const DEFAULT_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbxE6ORoI_nvNg1wbWAv7ShHrk8F_Csoqcc6nA_P1E7StlXzrRzUVaP7AZfDpZKgsmbU0A/exec";

const fallbackCustomers = [
  {
    id: "avulso",
    name: "Cliente avulso",
    phone: "",
    instagram: "",
    notes: "",
    lastPurchaseDate: "",
    totalSpent: 0,
    favoriteProducts: []
  }
];

const productionFruits = [
  "Banana",
  "Abacaxi",
  "Manga",
  "Maracuja",
  "Kiwi",
  "Morango",
  "Pitaya",
  "Maca",
  "Laranja",
  "Limao Tahiti",
  "Limao Siciliano",
  "Melancia",
  "Caju",
  "Jaca"
];

const rawToDriedMap = {
  Banana: "Banana desidratada",
  Abacaxi: "Abacaxi desidratado",
  Manga: "Manga desidratada",
  Maracuja: "Maracuja desidratado",
  Kiwi: "Kiwi desidratado",
  Morango: "Morango desidratado",
  Pitaya: "Pitaya desidratada",
  Maca: "Maca desidratada",
  Laranja: "Laranja desidratada",
  "Limao Tahiti": "Limao Tahiti desidratado",
  "Limao Siciliano": "Limao Siciliano desidratado",
  Melancia: "Melancia desidratada",
  Caju: "Caju desidratado",
  Jaca: "Jaca desidratada"
};

let saleDraftItems = [];
let selectedCustomerId = "";
let deferredInstallPrompt = null;

const state = loadState();

function normalizeText(value) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^\w\s/+.-]/g, "")
    .trim();
}

function slugify(value) {
  return normalizeText(value)
    .toLowerCase()
    .replace(/\s+/g, "-");
}

function parseNumber(value) {
  return Number(value || 0);
}

function loadState() {
  const savedState = localStorage.getItem(STORAGE_KEY) || localStorage.getItem("terra-relva-app-state-v4");
  if (!savedState) {
    return createEmptyState();
  }

  try {
    const parsed = JSON.parse(savedState);
    const migrated = {
      products: parsed.products ?? [],
      customers: parsed.customers?.length ? parsed.customers : fallbackCustomers,
      productions: parsed.productions ?? [],
      sales: [],
      saleItems: parsed.saleItems ?? [],
      purchases: parsed.purchases ?? [],
      supplies: parsed.supplies ?? [],
      recipes: parsed.recipes ?? [],
      cashEntries: parsed.cashEntries ?? [],
      stockMovements: parsed.stockMovements ?? [],
      syncConfig: parsed.syncConfig ?? { appsScriptUrl: DEFAULT_APPS_SCRIPT_URL, storeName: "Terra Relva" },
      syncQueue: parsed.syncQueue ?? [],
      lastSyncAt: parsed.lastSyncAt ?? "",
      lastSyncStatus: parsed.lastSyncStatus ?? "offline",
      lastSyncMessage: parsed.lastSyncMessage ?? "sem configuracao",
      settings: {
        hourRate: parseNumber(parsed.settings?.hourRate ?? 18),
        taxPercent: parseNumber(parsed.settings?.taxPercent ?? 10),
        profitPercent: parseNumber(parsed.settings?.profitPercent ?? 20)
      }
    };

    const oldSales = Array.isArray(parsed.sales) ? parsed.sales : [];
    oldSales.forEach((sale) => {
      const headerId = sale.id || crypto.randomUUID();
      migrated.sales.push({
        id: headerId,
        date: String(sale.date || ""),
        customerId: sale.customerId || "avulso",
        customerName: sale.customerName || "Cliente avulso",
        paymentMethod: sale.paymentMethod || "Pix",
        total: parseNumber(sale.total),
        totalItems: parseNumber(sale.quantity),
        receivableMonth: sale.receivableMonth || ""
      });

      if (Array.isArray(sale.items) && sale.items.length) {
        sale.items.forEach((item) => {
          migrated.saleItems.push({
            id: crypto.randomUUID(),
            saleId: headerId,
            date: String(sale.date || ""),
            customerId: sale.customerId || "avulso",
            customerName: sale.customerName || "Cliente avulso",
            productCode: item.productCode,
            productName: item.productName,
            quantity: parseNumber(item.quantity),
            price: parseNumber(item.price),
            total: parseNumber(item.total)
          });
        });
      } else {
        migrated.saleItems.push({
          id: crypto.randomUUID(),
          saleId: headerId,
          date: String(sale.date || ""),
          customerId: sale.customerId || "avulso",
          customerName: sale.customerName || "Cliente avulso",
          productCode: sale.productCode || "",
          productName: sale.productName || "",
          quantity: parseNumber(sale.quantity),
          price: parseNumber(sale.total) / Math.max(parseNumber(sale.quantity), 1),
          total: parseNumber(sale.total)
        });
      }
    });

    return migrated;
  } catch {
    return createEmptyState();
  }
}

function createEmptyState() {
  return {
    products: [],
    customers: fallbackCustomers,
    productions: [],
    sales: [],
    saleItems: [],
    purchases: [],
    supplies: [],
    recipes: [],
    cashEntries: [],
    stockMovements: [],
    syncConfig: { appsScriptUrl: DEFAULT_APPS_SCRIPT_URL, storeName: "Terra Relva" },
    syncQueue: [],
    lastSyncAt: "",
    lastSyncStatus: "offline",
    lastSyncMessage: "sem configuracao",
    settings: {
      hourRate: 18,
      taxPercent: 10,
      profitPercent: 20
    }
  };
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

async function loadProductsCatalog() {
  if (Array.isArray(window.TERRA_RELVA_PRODUCTS) && window.TERRA_RELVA_PRODUCTS.length) {
    return window.TERRA_RELVA_PRODUCTS.map((product) => ({
      ...product,
      name: normalizeText(product.name),
      category: normalizeText(product.category),
      presentation: normalizeText(product.presentation),
      recipe: normalizeText(product.recipe),
      weight: parseNumber(product.weight),
      price: parseNumber(product.price),
      stock: parseNumber(product.stock),
      minimumStock: parseNumber(product.minimumStock)
    }));
  }

  return [];
}

function createDefaultSupplies() {
  return [
    { id: slugify("Embalagem segura"), name: "Embalagem segura", category: "Embalagem", unit: "un", stock: 0, unitCost: 0.55 },
    { id: slugify("Adesivo"), name: "Adesivo", category: "Embalagem", unit: "un", stock: 0, unitCost: 0.15 },
    { id: slugify("Sacola"), name: "Sacola", category: "Embalagem", unit: "un", stock: 0, unitCost: 0.45 },
    { id: slugify("Sanitizante"), name: "Sanitizante", category: "Higiene", unit: "ml", stock: 0, unitCost: 0.03 },
    { id: slugify("Papel antiaderente"), name: "Papel antiaderente", category: "Papel", unit: "m", stock: 0, unitCost: 1.2 }
  ];
}

function ensureSupply(name, category = "Insumo", unit = "un") {
  const normalized = normalizeText(name);
  let supply = state.supplies.find((item) => item.name === normalized);
  if (!supply) {
    supply = {
      id: slugify(normalized),
      name: normalized,
      category,
      unit,
      stock: 0,
      unitCost: 0
    };
    state.supplies.push(supply);
  }
  return supply;
}

function mergeDefaultSupplies() {
  const defaults = createDefaultSupplies();
  defaults.forEach((item) => {
    const existing = state.supplies.find((entry) => entry.name === item.name);
    if (!existing) {
      state.supplies.push({ ...item });
    }
  });

  Object.values(rawToDriedMap).forEach((name) => {
    ensureSupply(name, "Fruta base", "g");
  });
}

function productDisplayName(product) {
  return `${product.name} - ${product.presentation}`;
}

function splitProductName(product) {
  const text = normalizeText(`${product.name} ${product.presentation}`.replace(/\bMix\b/gi, ""));
  return text
    .split(/\+/)
    .map((item) => normalizeText(item))
    .filter(Boolean);
}

function packagingItems(includeBag = true) {
  const items = [
    { supplyName: "Embalagem segura", quantity: 1, unit: "un" },
    { supplyName: "Adesivo", quantity: 1, unit: "un" },
    { supplyName: "Sanitizante", quantity: 4, unit: "ml" },
    { supplyName: "Papel antiaderente", quantity: 0.05, unit: "m" }
  ];

  if (includeBag) {
    items.push({ supplyName: "Sacola", quantity: 1, unit: "un" });
  }

  return items;
}

function supplyNameFromIngredient(name) {
  const normalized = normalizeText(name);
  if (rawToDriedMap[normalized]) return rawToDriedMap[normalized];
  if (/blend/i.test(normalized)) return normalized;
  if (/flores/i.test(normalized)) return normalized;
  if (/petalas/i.test(normalized)) return normalized;
  if (/mini rosas/i.test(normalized)) return normalized;
  if (/lavanda/i.test(normalized)) return normalized;
  if (/hortela/i.test(normalized)) return normalized;
  if (/erva cidreira/i.test(normalized)) return normalized;
  if (/capim limao/i.test(normalized)) return normalized;
  if (/pitaya em po/i.test(normalized)) return normalized;
  if (/curcuma/i.test(normalized)) return normalized;
  if (/gengibre/i.test(normalized)) return normalized;
  if (/cafe/i.test(normalized)) return normalized;
  if (/cacau/i.test(normalized)) return normalized;
  if (/amendoim/i.test(normalized)) return normalized;
  if (/amendoas de cacau/i.test(normalized)) return normalized;
  if (/tamara/i.test(normalized)) return normalized;
  if (/coco/i.test(normalized)) return normalized;
  if (/canela/i.test(normalized)) return normalized;
  if (/cardamomo/i.test(normalized)) return normalized;
  return `${normalized} desidratado`;
}

function buildRecipeForProduct(product) {
  const category = normalizeText(product.category).toLowerCase();
  const baseName = normalizeText(product.recipe || product.name);
  const recipe = {
    productCode: product.code,
    productName: productDisplayName(product),
    taxPercent: state.settings.taxPercent,
    profitPercent: state.settings.profitPercent,
    laborMinutes: 4,
    items: []
  };

  const names = splitProductName(product);
  const add = (name, quantity, unit = "g") => {
    recipe.items.push({
      supplyName: supplyNameFromIngredient(name),
      quantity,
      unit
    });
  };

  if (category.includes("frutas")) {
    add(product.name, product.weight);
    recipe.items.push(...packagingItems(true));
    recipe.laborMinutes = 2;
    return recipe;
  }

  if (category.includes("mix")) {
    const fruits = names.length ? names : [baseName];
    const part = product.weight / Math.max(fruits.length, 1);
    fruits.forEach((fruit) => add(fruit, part));
    recipe.items.push(...packagingItems(true));
    recipe.laborMinutes = 3;
    return recipe;
  }

  if (category.includes("barra")) {
    const others = names.filter((item) => !/banana/i.test(item));
    add("Banana", product.weight * 0.65);
    if (!others.length) {
      add(baseName, product.weight * 0.2);
    } else {
      const part = (product.weight * 0.25) / others.length;
      others.forEach((item) => add(item, part));
    }
    recipe.items.push(...packagingItems(true));
    recipe.laborMinutes = 6;
    return recipe;
  }

  if (category.includes("rolinhos")) {
    const fruits = names.length ? names : [baseName];
    const part = (product.weight || 30) / Math.max(fruits.length, 1);
    fruits.forEach((fruit) => add(fruit, part));
    recipe.items.push(...packagingItems(true));
    recipe.laborMinutes = 5;
    return recipe;
  }

  if (category.includes("chas")) {
    add(baseName, product.weight || 20);
    recipe.items.push(...packagingItems(false));
    recipe.laborMinutes = 2;
    return recipe;
  }

  if (category.includes("flores") || category.includes("ervas") || category.includes("especiarias")) {
    add(baseName, product.weight || 20);
    recipe.items.push(...packagingItems(false));
    recipe.laborMinutes = 2;
    return recipe;
  }

  if (category.includes("mexedores")) {
    recipe.items.push(
      { supplyName: normalizeText(baseName || product.name), quantity: 1, unit: "un" },
      { supplyName: "Embalagem segura", quantity: 1, unit: "un" },
      { supplyName: "Adesivo", quantity: 1, unit: "un" }
    );
    recipe.laborMinutes = 3;
    return recipe;
  }

  add(baseName, product.weight || 1, "g");
  recipe.items.push(...packagingItems(true));
  return recipe;
}

function ensureRecipes() {
  state.products.forEach((product) => {
    const existing = state.recipes.find((item) => item.productCode === product.code);
    if (!existing) {
      state.recipes.push(buildRecipeForProduct(product));
    }
  });
}

function ensureBaseData() {
  mergeDefaultSupplies();
  ensureRecipes();
  state.customers = state.customers?.length ? state.customers : fallbackCustomers;
  state.customers = state.customers.map((customer) => ({
    ...customer,
    favoriteProducts: Array.isArray(customer.favoriteProducts) ? customer.favoriteProducts : []
  }));
}

function formatCurrency(value) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(parseNumber(value));
}

function today() {
  return new Date().toISOString().slice(0, 10);
}

function currentMonthValue() {
  return today().slice(0, 7);
}

function byNewest(a, b) {
  return String(b.date || "").localeCompare(String(a.date || ""));
}

function daysSince(dateString) {
  if (!dateString) return 0;
  const date = new Date(`${dateString}T00:00:00`);
  const now = new Date();
  return Math.floor((now - date) / (1000 * 60 * 60 * 24));
}

function escapeCsv(value) {
  const text = String(value ?? "");
  if (/[",\n]/.test(text)) {
    return `"${text.replace(/"/g, '""')}"`;
  }
  return text;
}

function toCsv(rows) {
  if (!rows.length) {
    return "";
  }
  const headers = Object.keys(rows[0]);
  const lines = [headers.join(",")];
  rows.forEach((row) => {
    lines.push(headers.map((header) => escapeCsv(row[header])).join(","));
  });
  return lines.join("\n");
}

function downloadFile(filename, content, type = "text/csv;charset=utf-8;") {
  const blob = new Blob([content], { type });
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement("a");
  anchor.href = url;
  anchor.download = filename;
  anchor.click();
  URL.revokeObjectURL(url);
}

function queueSync(sheet, action, payload) {
  state.syncQueue.push({
    id: crypto.randomUUID(),
    createdAt: new Date().toISOString(),
    sheet,
    action,
    payload
  });
}

async function syncQueueNow() {
  const url = String(state.syncConfig.appsScriptUrl || "").trim();
  if (!url) {
    state.lastSyncStatus = "offline";
    state.lastSyncMessage = "sem configuracao";
    saveState();
    renderSyncStatus();
    showSyncFeedback("info", "Configuracao pendente", "Salve a URL da nuvem antes de sincronizar.");
    return;
  }

  if (!state.syncQueue.length) {
    state.lastSyncStatus = "ok";
    state.lastSyncMessage = state.lastSyncAt ? `ultima sincronizacao ${state.lastSyncAt}` : "sem pendencias";
    saveState();
    renderSyncStatus();
    showSyncFeedback("info", "Nada para enviar", "Nao havia novos itens pendentes na fila.");
    return;
  }

  const pendingBefore = state.syncQueue.length;
  const payload = {
    storeName: state.syncConfig.storeName || "Terra Relva",
    sentAt: new Date().toISOString(),
    events: state.syncQueue.map((event) => ({
      ...event,
      payload: JSON.stringify(event.payload)
    }))
  };

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "text/plain;charset=utf-8" },
      body: JSON.stringify(payload)
    });

    const responseText = await response.text();
    if (!response.ok) {
      throw new Error(`HTTP ${response.status}`);
    }

    state.syncQueue = [];
    state.lastSyncAt = new Date().toLocaleString("pt-BR");
    state.lastSyncStatus = "ok";
    state.lastSyncMessage = responseText ? `fila enviada em ${state.lastSyncAt}` : `sincronizado em ${state.lastSyncAt}`;
    showSyncFeedback("success", "Sincronizado com sucesso", `${pendingBefore} item(ns) enviados para a nuvem.`);
  } catch {
    state.lastSyncStatus = "erro";
    state.lastSyncMessage = `pendente: ${state.syncQueue.length} itens`;
    showSyncFeedback("error", "Erro ao sincronizar", `${state.syncQueue.length} item(ns) continuam pendentes.`);
  }

  saveState();
  renderSyncStatus();
}

function recordStockMovement({ date, productCode, productName, quantity, movementType, reason }) {
  const movement = {
    id: crypto.randomUUID(),
    date,
    productCode,
    productName,
    quantity,
    movementType,
    reason
  };
  state.stockMovements.unshift(movement);
  queueSync("Estoque", "append", movement);
}

function monthFilter(entries, month) {
  return entries.filter((entry) => String(entry.date || "").startsWith(month));
}

function getCashBalance(account, month = null) {
  const source = month ? monthFilter(state.cashEntries, month) : state.cashEntries;
  return source
    .filter((entry) => entry.account === account)
    .reduce((sum, entry) => sum + (entry.type === "entrada" ? parseNumber(entry.amount) : -parseNumber(entry.amount)), 0);
}

function getRecipeByProductCode(productCode) {
  return state.recipes.find((item) => item.productCode === productCode);
}

function getSupplyCost(name) {
  return state.supplies.find((item) => item.name === name)?.unitCost || 0;
}

function calculateRecipeCost(recipe) {
  if (!recipe) {
    return {
      materialCost: 0,
      laborCost: 0,
      totalCost: 0,
      suggestedPrice: 0,
      marginAmount: 0
    };
  }

  const materialCost = recipe.items.reduce(
    (sum, item) => sum + parseNumber(item.quantity) * parseNumber(getSupplyCost(item.supplyName)),
    0
  );
  const laborCost = (parseNumber(recipe.laborMinutes) / 60) * parseNumber(state.settings.hourRate);
  const totalCost = materialCost + laborCost;
  const suggestedPrice =
    totalCost *
    (1 + parseNumber(recipe.taxPercent ?? state.settings.taxPercent) / 100 + parseNumber(recipe.profitPercent ?? state.settings.profitPercent) / 100);
  return {
    materialCost,
    laborCost,
    totalCost,
    suggestedPrice,
    marginAmount: suggestedPrice - totalCost
  };
}

function getProductCostSummary(product) {
  const recipe = getRecipeByProductCode(product.code);
  const cost = calculateRecipeCost(recipe);
  return {
    ...cost,
    price: parseNumber(product.price),
    actualMargin: parseNumber(product.price) - cost.totalCost
  };
}

function updateCustomerFavorites(customerId, saleItemsForCustomer) {
  const customer = state.customers.find((item) => item.id === customerId);
  if (!customer || customer.id === "avulso") return;
  const totals = {};
  const allItems = state.saleItems.filter((item) => item.customerId === customerId).concat(saleItemsForCustomer);
  allItems.forEach((item) => {
    totals[item.productCode] = (totals[item.productCode] || 0) + parseNumber(item.quantity);
  });
  customer.favoriteProducts = Object.entries(totals)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([productCode]) => productCode);
}

function toWhatsappLink(phone) {
  const digits = String(phone || "").replace(/\D/g, "");
  if (!digits) return "";
  const withCountry = digits.startsWith("55") ? digits : `55${digits}`;
  return `https://wa.me/${withCountry}`;
}

function getCustomerHistory(customerId) {
  const sales = state.sales.filter((item) => item.customerId === customerId);
  const items = state.saleItems.filter((item) => item.customerId === customerId);
  return {
    sales,
    items,
    totalSpent: sales.reduce((sum, item) => sum + parseNumber(item.total), 0),
    lastPurchaseDate: sales.length ? sales.slice().sort(byNewest)[0].date : ""
  };
}

function getMonthlySummary(month) {
  const sales = monthFilter(state.sales, month);
  const saleItems = monthFilter(state.saleItems, month);
  const cash = monthFilter(state.cashEntries, month);
  const productions = monthFilter(state.productions, month);
  const purchases = monthFilter(state.purchases, month);
  const stockMovements = monthFilter(state.stockMovements, month);
  const receivables = state.cashEntries.filter((item) => item.account === "recebiveis" && String(item.expectedMonth || "") === month);
  const salesTotal = sales.reduce((sum, item) => sum + parseNumber(item.total), 0);
  const lojaEntries = cash.filter((item) => item.account === "loja" && item.type === "entrada").reduce((sum, item) => sum + parseNumber(item.amount), 0);
  const lojaExits = cash.filter((item) => item.account === "loja" && item.type === "saida").reduce((sum, item) => sum + parseNumber(item.amount), 0);
  const pessoalEntries = cash.filter((item) => item.account === "pessoal" && item.type === "entrada").reduce((sum, item) => sum + parseNumber(item.amount), 0);
  const pessoalExits = cash.filter((item) => item.account === "pessoal" && item.type === "saida").reduce((sum, item) => sum + parseNumber(item.amount), 0);
  const stockIn = stockMovements.filter((item) => item.movementType === "entrada").reduce((sum, item) => sum + parseNumber(item.quantity), 0);
  const stockOut = stockMovements.filter((item) => item.movementType === "saida").reduce((sum, item) => sum + parseNumber(item.quantity), 0);

  return {
    month,
    salesCount: sales.length,
    saleItemsCount: saleItems.length,
    salesTotal,
    productionsCount: productions.length,
    purchasesCount: purchases.length,
    lojaEntries,
    lojaExits,
    lojaBalance: lojaEntries - lojaExits,
    pessoalEntries,
    pessoalExits,
    pessoalBalance: pessoalEntries - pessoalExits,
    stockIn,
    stockOut,
    receivablesTotal: receivables.reduce((sum, item) => sum + parseNumber(item.amount), 0)
  };
}

function renderProducts(search = "") {
  const list = document.getElementById("product-list");
  const term = normalizeText(search).toLowerCase();
  const filtered = state.products.filter((product) =>
    [product.code, product.category, product.name, product.presentation].join(" ").toLowerCase().includes(term)
  );

  if (!filtered.length) {
    list.innerHTML = `<div class="empty-state">Nenhum produto encontrado.</div>`;
    return;
  }

  list.innerHTML = filtered
    .map((product) => {
      const lowStock = parseNumber(product.stock) <= parseNumber(product.minimumStock);
      const cost = getProductCostSummary(product);
      return `
        <article class="product-card">
          <header>
            <div>
              <strong>${product.name}</strong>
              <p>${product.presentation} - ${product.code}</p>
            </div>
            <strong>${formatCurrency(product.price)}</strong>
          </header>
          <div class="tag-row">
            <span class="pill">${product.category}</span>
            <span class="${lowStock ? "warn-pill" : "ok-pill"}">Estoque: ${product.stock}</span>
            <span class="pill">Minimo: ${product.minimumStock}</span>
          </div>
          <div class="meta-row">
            <span class="pill">Receita: ${product.recipe}</span>
            <span class="pill">Custo: ${formatCurrency(cost.totalCost)}</span>
            <span class="${cost.actualMargin >= 0 ? "ok-pill" : "warn-pill"}">Margem atual: ${formatCurrency(cost.actualMargin)}</span>
          </div>
        </article>
      `;
    })
    .join("");
}

function renderSupplyOptions() {
  const options = state.supplies
    .slice()
    .sort((a, b) => a.name.localeCompare(b.name))
    .map((supply) => `<option value="${supply.name}">${supply.name}</option>`)
    .join("");
  const purchaseName = document.querySelector('#purchase-form [name="itemName"]');
  if (purchaseName && !purchaseName.dataset.linked) {
    purchaseName.setAttribute("list", "supply-names");
  }
  let datalist = document.getElementById("supply-names");
  if (!datalist) {
    datalist = document.createElement("datalist");
    datalist.id = "supply-names";
    document.body.appendChild(datalist);
  }
  datalist.innerHTML = options;
}

function renderIngredientOptions() {
  const select = document.getElementById("production-ingredient");
  select.innerHTML = productionFruits.map((name) => `<option value="${name}">${name}</option>`).join("");
}

function renderProductOptions() {
  const stockSelect = document.getElementById("stock-product");
  const saleSelect = document.getElementById("sale-product");
  const options = state.products
    .map((product) => `<option value="${product.code}">${product.name} - ${product.presentation} - Estoque ${product.stock}</option>`)
    .join("");
  stockSelect.innerHTML = options;
  saleSelect.innerHTML = state.products
    .map((product) => `<option value="${product.code}">${product.name} - ${product.presentation} - ${formatCurrency(product.price)}</option>`)
    .join("");
}

function renderCustomerOptions() {
  const customerSelect = document.getElementById("sale-customer");
  customerSelect.innerHTML = state.customers
    .map((customer) => `<option value="${customer.id}">${customer.name}</option>`)
    .join("");
}

function renderSaleFavorites() {
  const container = document.getElementById("sale-favorites");
  const topItems = [...state.saleItems]
    .sort((a, b) => parseNumber(b.quantity) - parseNumber(a.quantity))
    .reduce((map, item) => {
      map[item.productCode] = (map[item.productCode] || 0) + parseNumber(item.quantity);
      return map;
    }, {});
  const productCodes = Object.entries(topItems)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 4)
    .map(([code]) => code);

  const favorites = (productCodes.length ? productCodes : state.products.slice(0, 4).map((item) => item.code))
    .map((code) => state.products.find((item) => item.code === code))
    .filter(Boolean);

  container.innerHTML = favorites
    .map(
      (product) => `
        <button class="favorite-button" type="button" data-favorite-product="${product.code}">
          <strong>${product.name}</strong>
          <small>${product.presentation}</small>
        </button>
      `
    )
    .join("");

  document.querySelectorAll("[data-favorite-product]").forEach((button) => {
    button.addEventListener("click", () => addSaleItemByCode(button.dataset.favoriteProduct, 1));
  });
}

function renderSaleDraft() {
  const list = document.getElementById("sale-items-list");
  const totalNode = document.getElementById("sale-total");
  const total = saleDraftItems.reduce((sum, item) => sum + parseNumber(item.total), 0);
  totalNode.textContent = formatCurrency(total);

  if (!saleDraftItems.length) {
    list.innerHTML = `<div class="empty-state">Nenhum item adicionado ainda.</div>`;
    return;
  }

  list.innerHTML = saleDraftItems
    .map(
      (item, index) => `
        <div class="sale-item-row">
          <div class="sale-item-main">
            <strong>${item.productName}</strong>
            <span>${item.quantity} x ${formatCurrency(item.price)} = ${formatCurrency(item.total)}</span>
          </div>
          <button class="sale-item-remove" type="button" data-sale-remove="${index}">Remover</button>
        </div>
      `
    )
    .join("");

  document.querySelectorAll("[data-sale-remove]").forEach((button) => {
    button.addEventListener("click", () => {
      saleDraftItems.splice(parseNumber(button.dataset.saleRemove), 1);
      renderSaleDraft();
    });
  });
}

function renderProductions() {
  const list = document.getElementById("production-list");
  const entries = [...state.productions].sort(byNewest);

  if (!entries.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma producao registrada ainda.</div>`;
    return;
  }

  list.innerHTML = entries
    .map((entry) => {
      const yieldPercent = entry.rawWeight > 0 ? (entry.finalWeight / entry.rawWeight) * 100 : 0;
      const finalCostPerGram = entry.finalWeight > 0 ? entry.paidValue / entry.finalWeight : 0;
      return `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${entry.ingredient}</strong>
              <p>${entry.date}</p>
            </div>
            <strong>${yieldPercent.toFixed(1)}%</strong>
          </header>
          <div class="tag-row">
            <span class="pill">Pago: ${formatCurrency(entry.paidValue)}</span>
            <span class="pill">Bruto: ${entry.rawWeight}g</span>
            <span class="pill">Final: ${entry.finalWeight}g</span>
            <span class="ok-pill">Custo/g: ${formatCurrency(finalCostPerGram)}</span>
          </div>
          ${entry.notes ? `<p>${entry.notes}</p>` : ""}
        </article>
      `;
    })
    .join("");
}

function renderPurchases() {
  const list = document.getElementById("purchase-list");
  const entries = [...state.purchases].sort(byNewest);

  if (!entries.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma compra registrada ainda.</div>`;
    return;
  }

  list.innerHTML = entries
    .map(
      (entry) => `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${entry.itemName}</strong>
              <p>${entry.kind} - ${entry.date}</p>
            </div>
            <strong>${formatCurrency(entry.amount)}</strong>
          </header>
          <div class="tag-row">
            <span class="pill">${entry.quantity} ${entry.unit}</span>
            <span class="pill">${entry.supplier || "Fornecedor nao informado"}</span>
          </div>
          ${entry.notes ? `<p>${entry.notes}</p>` : ""}
        </article>
      `
    )
    .join("");
}

function renderSales() {
  const list = document.getElementById("sales-list");
  const entries = [...state.sales].sort(byNewest);

  if (!entries.length) {
    list.innerHTML = `<div class="empty-state">Nenhuma venda registrada ainda.</div>`;
    return;
  }

  list.innerHTML = entries
    .map((entry) => {
      const items = state.saleItems.filter((item) => item.saleId === entry.id);
      return `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${entry.customerName}</strong>
              <p>${entry.date} - ${items.length} item(ns)</p>
            </div>
            <strong>${formatCurrency(entry.total)}</strong>
          </header>
          <div class="tag-row">
            <span class="pill">${entry.paymentMethod}</span>
            <span class="pill">Qtd total: ${entry.totalItems}</span>
            ${entry.receivableMonth ? `<span class="pill">Recebe em ${entry.receivableMonth}</span>` : ""}
          </div>
          <div class="meta-row">
            ${items
              .slice(0, 5)
              .map((item) => `<span class="pill">${item.productName} x ${item.quantity}</span>`)
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderCustomerDetail() {
  const panel = document.getElementById("customer-detail");
  const customer = state.customers.find((item) => item.id === selectedCustomerId);
  if (!customer || customer.id === "avulso") {
    panel.classList.add("hidden-field");
    panel.innerHTML = "";
    return;
  }

  const history = getCustomerHistory(customer.id);
  const favoriteNames = (customer.favoriteProducts || [])
    .map((code) => state.products.find((item) => item.code === code))
    .filter(Boolean)
    .map((item) => item.name)
    .join(", ");
  const whatsappLink = toWhatsappLink(customer.phone);
  const inactiveDays = history.lastPurchaseDate ? daysSince(history.lastPurchaseDate) : 0;
  panel.classList.remove("hidden-field");
  panel.innerHTML = `
    <div class="customer-highlight">
      <div>
        <p class="eyebrow">Cliente selecionado</p>
        <h3>${customer.name}</h3>
        <p>${customer.phone || "Sem telefone"}${customer.instagram ? ` - ${customer.instagram}` : ""}</p>
      </div>
      <div>
        <strong>${formatCurrency(history.totalSpent)}</strong>
        <p>${history.lastPurchaseDate ? `Ultima compra em ${history.lastPurchaseDate}` : "Sem compra registrada"}</p>
      </div>
    </div>
    <div class="tag-row">
      <span class="${inactiveDays >= 30 ? "warn-pill" : "ok-pill"}">${inactiveDays || 0} dia(s) sem comprar</span>
      <span class="pill">Favoritos: ${favoriteNames || "Ainda sem favoritos"}</span>
    </div>
    ${customer.notes ? `<p>${customer.notes}</p>` : ""}
    <div class="customer-actions">
      ${whatsappLink ? `<a href="${whatsappLink}" target="_blank" rel="noreferrer">Abrir WhatsApp</a>` : ""}
      <button type="button" data-customer-clear="1">Fechar</button>
    </div>
  `;

  panel.querySelector("[data-customer-clear]")?.addEventListener("click", () => {
    selectedCustomerId = "";
    renderCustomerDetail();
  });
}

function renderCustomers(search = "") {
  const list = document.getElementById("customer-list");
  const term = normalizeText(search).toLowerCase();
  const customers = state.customers.filter((customer) => {
    if (customer.id === "avulso") return false;
    return [customer.name, customer.phone, customer.instagram].join(" ").toLowerCase().includes(term);
  });

  if (!customers.length) {
    list.innerHTML = `<div class="empty-state">Nenhum cliente cadastrado ainda.</div>`;
    return;
  }

  list.innerHTML = customers
    .map((customer) => {
      const lastPurchase = customer.lastPurchaseDate ? `Ultima compra: ${customer.lastPurchaseDate}` : "Sem compra registrada";
      const inactiveDays = customer.lastPurchaseDate ? daysSince(customer.lastPurchaseDate) : 0;
      return `
        <article class="timeline-card customer-card ${inactiveDays >= 30 ? "inactive" : ""}">
          <header>
            <div>
              <strong>${customer.name}</strong>
              <p>${customer.phone || "Sem telefone"}${customer.instagram ? ` - ${customer.instagram}` : ""}</p>
            </div>
            <strong>${formatCurrency(customer.totalSpent || 0)}</strong>
          </header>
          <div class="tag-row">
            <span class="${inactiveDays >= 30 ? "warn-pill" : "pill"}">${lastPurchase}</span>
            ${inactiveDays >= 30 ? `<span class="warn-pill">${inactiveDays} dias sem comprar</span>` : ""}
          </div>
          ${customer.notes ? `<p>${customer.notes}</p>` : ""}
          <div class="customer-actions">
            <button type="button" data-customer-open="${customer.id}">Ver historico</button>
            ${toWhatsappLink(customer.phone) ? `<a href="${toWhatsappLink(customer.phone)}" target="_blank" rel="noreferrer">Enviar WhatsApp</a>` : ""}
          </div>
        </article>
      `;
    })
    .join("");

  document.querySelectorAll("[data-customer-open]").forEach((button) => {
    button.addEventListener("click", () => {
      selectedCustomerId = button.dataset.customerOpen;
      renderCustomerDetail();
    });
  });
}

function renderCash() {
  const list = document.getElementById("cash-list");
  const entries = [...state.cashEntries].sort(byNewest);

  if (!entries.length) {
    list.innerHTML = `<div class="empty-state">Nenhum lancamento de caixa ainda.</div>`;
    return;
  }

  list.innerHTML = entries
    .map(
      (entry) => `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${entry.category}</strong>
              <p>${entry.account} - ${entry.date}</p>
            </div>
            <strong>${entry.type === "saida" ? "-" : "+"}${formatCurrency(entry.amount)}</strong>
          </header>
          <div class="tag-row">
            <span class="${entry.type === "saida" ? "warn-pill" : "ok-pill"}">${entry.type}</span>
            ${entry.expectedMonth ? `<span class="pill">Recebe em ${entry.expectedMonth}</span>` : ""}
          </div>
          ${entry.notes ? `<p>${entry.notes}</p>` : ""}
        </article>
      `
    )
    .join("");
}

function renderCashSummary() {
  const month = currentMonthValue();
  const summary = getMonthlySummary(month);
  document.getElementById("cash-summary").innerHTML = `
    <article class="cash-summary-card">
      <div>
        <strong>${formatCurrency(summary.lojaBalance)}</strong>
        <p>Saldo da loja</p>
      </div>
    </article>
    <article class="cash-summary-card">
      <div>
        <strong>${formatCurrency(summary.pessoalBalance)}</strong>
        <p>Saldo pessoal</p>
      </div>
    </article>
    <article class="cash-summary-card">
      <div>
        <strong>${formatCurrency(summary.receivablesTotal)}</strong>
        <p>Recebiveis do mes</p>
      </div>
    </article>
  `;
}

function renderSupplies() {
  const list = document.getElementById("supply-list");
  const sorted = [...state.supplies].sort((a, b) => a.name.localeCompare(b.name));
  list.innerHTML = sorted
    .map(
      (supply) => `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${supply.name}</strong>
              <p>${supply.category}</p>
            </div>
            <strong>${formatCurrency(supply.unitCost)}</strong>
          </header>
          <div class="tag-row">
            <span class="pill">Estoque: ${supply.stock} ${supply.unit}</span>
            <span class="pill">Unidade: ${supply.unit}</span>
          </div>
        </article>
      `
    )
    .join("");
}

function renderRecipes() {
  const list = document.getElementById("recipe-list");
  list.innerHTML = state.recipes
    .slice()
    .sort((a, b) => a.productName.localeCompare(b.productName))
    .map((recipe) => {
      const product = state.products.find((item) => item.code === recipe.productCode);
      const cost = calculateRecipeCost(recipe);
      const salePrice = product ? parseNumber(product.price) : 0;
      return `
        <article class="timeline-card">
          <header>
            <div>
              <strong>${recipe.productName}</strong>
              <p>${recipe.items.length} item(ns) na ficha tecnica</p>
            </div>
            <strong class="recipe-price">${formatCurrency(cost.totalCost)}</strong>
          </header>
          <div class="tag-row">
            <span class="pill">Preco atual: ${formatCurrency(salePrice)}</span>
            <span class="pill">Preco sugerido: ${formatCurrency(cost.suggestedPrice)}</span>
            <span class="${salePrice - cost.totalCost >= 0 ? "ok-pill" : "warn-pill"}">Margem: ${formatCurrency(salePrice - cost.totalCost)}</span>
          </div>
          <div class="meta-row">
            ${recipe.items
              .slice(0, 6)
              .map((item) => `<span class="pill">${item.supplyName}: ${item.quantity} ${item.unit}</span>`)
              .join("")}
          </div>
        </article>
      `;
    })
    .join("");
}

function renderReports() {
  const restock = state.products.filter((product) => parseNumber(product.stock) <= parseNumber(product.minimumStock));
  const inactiveCustomers = state.customers.filter(
    (customer) => customer.id !== "avulso" && customer.lastPurchaseDate && daysSince(customer.lastPurchaseDate) >= 30
  );
  const salesTotal = state.sales.reduce((sum, sale) => sum + parseNumber(sale.total), 0);
  const topProductsMap = {};

  state.saleItems.forEach((item) => {
    topProductsMap[item.productName] = (topProductsMap[item.productName] || 0) + parseNumber(item.quantity);
  });

  document.getElementById("inactive-customers").innerHTML = inactiveCustomers.length
    ? inactiveCustomers
        .slice(0, 5)
        .map((customer) => `<p><strong>${customer.name}</strong><br />${daysSince(customer.lastPurchaseDate)} dias sem comprar</p>`)
        .join("")
    : `<div class="empty-state">Nenhum cliente parado por 30 dias.</div>`;

  document.getElementById("restock-products").innerHTML = restock.length
    ? restock
        .slice(0, 10)
        .map((product) => `<p><strong>${product.name}</strong><br />Estoque ${product.stock} - Minimo ${product.minimumStock}</p>`)
        .join("")
    : `<div class="empty-state">Nenhum produto em alerta.</div>`;

  document.getElementById("operation-summary").innerHTML = `
    <p><strong>Vendas registradas:</strong><br />${formatCurrency(salesTotal)}</p>
    <p><strong>Caixa loja:</strong><br />${formatCurrency(getCashBalance("loja"))}</p>
    <p><strong>Caixa pessoal:</strong><br />${formatCurrency(getCashBalance("pessoal"))}</p>
    <p><strong>Compras:</strong><br />${state.purchases.length} lancamentos</p>
  `;

  const topProducts = Object.entries(topProductsMap).sort((a, b) => b[1] - a[1]).slice(0, 5);
  document.getElementById("top-products").innerHTML = topProducts.length
    ? topProducts.map(([name, quantity]) => `<p><strong>${name}</strong><br />${quantity} unidade(s) vendidas</p>`).join("")
    : `<div class="empty-state">Ainda sem vendas suficientes.</div>`;

  renderMonthlySummary();
}

function renderMonthlySummary() {
  const month = document.getElementById("report-month").value || currentMonthValue();
  const summary = getMonthlySummary(month);
  document.getElementById("monthly-summary").innerHTML = `
    <p><strong>Mes:</strong><br />${summary.month}</p>
    <p><strong>Vendas:</strong><br />${summary.salesCount} vendas - ${summary.saleItemsCount} itens - ${formatCurrency(summary.salesTotal)}</p>
    <p><strong>Caixa da loja:</strong><br />Entradas ${formatCurrency(summary.lojaEntries)} - Saidas ${formatCurrency(summary.lojaExits)} - Saldo ${formatCurrency(summary.lojaBalance)}</p>
    <p><strong>Caixa pessoal:</strong><br />Entradas ${formatCurrency(summary.pessoalEntries)} - Saidas ${formatCurrency(summary.pessoalExits)} - Saldo ${formatCurrency(summary.pessoalBalance)}</p>
    <p><strong>Recebiveis previstos:</strong><br />${formatCurrency(summary.receivablesTotal)}</p>
    <p><strong>Estoque:</strong><br />Entradas ${summary.stockIn} - Saidas ${summary.stockOut}</p>
    <p><strong>Compras e producao:</strong><br />${summary.purchasesCount} compras - ${summary.productionsCount} lotes</p>
  `;
}

function renderSummary() {
  const todaySales = state.sales.filter((sale) => sale.date === today()).reduce((sum, sale) => sum + parseNumber(sale.total), 0);
  const lowStock = state.products.filter((product) => parseNumber(product.stock) <= parseNumber(product.minimumStock)).length;
  const inactive = state.customers.filter(
    (customer) => customer.id !== "avulso" && customer.lastPurchaseDate && daysSince(customer.lastPurchaseDate) >= 30
  ).length;
  document.getElementById("summary-sales").textContent = formatCurrency(todaySales);
  document.getElementById("summary-low-stock").textContent = String(lowStock);
  document.getElementById("summary-cash").textContent = formatCurrency(getCashBalance("loja"));
  document.getElementById("summary-inactive").textContent = String(inactive);
  renderDashboard();
  renderSyncStatus();
}

function renderDashboard() {
  const lowStock = state.products.filter((product) => parseNumber(product.stock) <= parseNumber(product.minimumStock)).slice(0, 5);
  const inactiveCustomers = state.customers
    .filter((customer) => customer.id !== "avulso" && customer.lastPurchaseDate && daysSince(customer.lastPurchaseDate) >= 30)
    .slice(0, 4);
  const month = currentMonthValue();
  const summary = getMonthlySummary(month);

  document.getElementById("dashboard-cash").textContent = formatCurrency(getCashBalance("loja"));
  document.getElementById("dashboard-low-stock").textContent = String(lowStock.length);
  document.getElementById("dashboard-production-count").textContent = String(state.productions.length);
  document.getElementById("dashboard-return-count").textContent = String(inactiveCustomers.length);

  const alerts = [];
  if (lowStock.length) {
    alerts.push(`<p><strong>Estoque baixo:</strong><br />${lowStock.map((item) => item.name).join(", ")}</p>`);
  }
  if (inactiveCustomers.length) {
    alerts.push(`<p><strong>Clientes sem voltar:</strong><br />${inactiveCustomers.map((item) => item.name).join(", ")}</p>`);
  }
  if (!state.sales.some((sale) => sale.date === today())) {
    alerts.push(`<p><strong>Venda do dia:</strong><br />Nenhuma venda registrada hoje ainda.</p>`);
  }
  if (!alerts.length) {
    alerts.push(`<div class="empty-state">Tudo bem por aqui. Sem alertas urgentes hoje.</div>`);
  }
  document.getElementById("dashboard-alerts").innerHTML = alerts.join("");

  document.getElementById("dashboard-month").innerHTML = `
    <p><strong>Mes atual:</strong><br />${summary.month}</p>
    <p><strong>Vendas:</strong><br />${summary.salesCount} vendas - ${formatCurrency(summary.salesTotal)}</p>
    <p><strong>Saldo loja:</strong><br />${formatCurrency(summary.lojaBalance)}</p>
    <p><strong>Recebiveis:</strong><br />${formatCurrency(summary.receivablesTotal)}</p>
    <p><strong>Compras:</strong><br />${summary.purchasesCount} lancamentos</p>
  `;
}

function renderSyncStatus() {
  const label = document.getElementById("summary-sync");
  const detail = document.getElementById("summary-sync-detail");
  const pending = state.syncQueue.length;
  const map = {
    ok: "Conectado",
    erro: "Pendente",
    offline: "Offline"
  };
  label.textContent = map[state.lastSyncStatus] || "Offline";
  detail.textContent = pending ? `${pending} itens na fila` : state.lastSyncMessage || "sem configuracao";
  document.getElementById("apps-script-url").value = state.syncConfig.appsScriptUrl || DEFAULT_APPS_SCRIPT_URL;
  document.getElementById("store-name").value = state.syncConfig.storeName || "Terra Relva";
}

function showSyncFeedback(type, title, text) {
  const box = document.getElementById("sync-feedback");
  const titleNode = document.getElementById("sync-feedback-title");
  const textNode = document.getElementById("sync-feedback-text");

  box.classList.remove("hidden-field", "success", "error", "info");
  box.classList.add(type);
  titleNode.textContent = title;
  textNode.textContent = text;
}

function showLocalOpenHint() {
  if (window.location.protocol !== "file:") return;
  showSyncFeedback(
    "info",
    "Abra pelo servidor local",
    "No celular e no computador, use o endereco http://SEU-IP:8080 em vez de abrir o arquivo direto."
  );
}

function handleInstallPrompt() {
  const button = document.getElementById("install-button");
  if (!button) return;

  window.addEventListener("beforeinstallprompt", (event) => {
    event.preventDefault();
    deferredInstallPrompt = event;
    button.classList.remove("hidden-field");
  });

  button.addEventListener("click", async () => {
    if (!deferredInstallPrompt) {
      showSyncFeedback("info", "Instalacao manual", "No celular, abra o menu do navegador e toque em Adicionar a tela inicial.");
      return;
    }

    deferredInstallPrompt.prompt();
    await deferredInstallPrompt.userChoice.catch(() => null);
    deferredInstallPrompt = null;
    button.classList.add("hidden-field");
  });

  window.addEventListener("appinstalled", () => {
    button.classList.add("hidden-field");
    showSyncFeedback("success", "App instalado", "A Terra Relva agora pode abrir direto pelo icone no celular.");
  });
}

function toggleReceivableMonthField() {
  const paymentMethod = document.getElementById("sale-payment-method").value;
  const field = document.getElementById("sale-receivable-month-field");
  const input = document.getElementById("sale-receivable-month");
  const visible = paymentMethod === "Credito";
  field.classList.toggle("hidden-field", !visible);
  input.required = visible;
  if (visible && !input.value) {
    const now = new Date();
    now.setMonth(now.getMonth() + 1);
    input.value = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, "0")}`;
  }
}

function toggleSaleCustomerMode() {
  const mode = document.getElementById("sale-customer-mode").value;
  const existingField = document.getElementById("sale-existing-customer-field");
  const nameField = document.getElementById("sale-new-customer-name-field");
  const phoneField = document.getElementById("sale-new-customer-phone-field");
  const instagramField = document.getElementById("sale-new-customer-instagram-field");
  const saleCustomer = document.getElementById("sale-customer");
  const newName = document.querySelector('[name="newCustomerName"]');

  existingField.classList.toggle("hidden-field", mode !== "existing");
  nameField.classList.toggle("hidden-field", mode !== "new");
  phoneField.classList.toggle("hidden-field", mode !== "new");
  instagramField.classList.toggle("hidden-field", mode !== "new");

  saleCustomer.required = mode === "existing";
  newName.required = mode === "new";
}

function refreshAll() {
  renderProducts(document.getElementById("product-search")?.value || "");
  renderIngredientOptions();
  renderProductOptions();
  renderCustomerOptions();
  renderSaleFavorites();
  renderSupplyOptions();
  renderProductions();
  renderPurchases();
  renderSales();
  renderCustomers(document.getElementById("customer-search")?.value || "");
  renderCustomerDetail();
  renderCash();
  renderCashSummary();
  renderSupplies();
  renderRecipes();
  renderReports();
  renderSummary();
  toggleSaleCustomerMode();
  saveState();
}

function handleNavigation() {
  const buttons = [...document.querySelectorAll(".nav-tile, .mobile-nav-item")];
  const screens = [...document.querySelectorAll(".screen")];

  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      const target = button.dataset.screen;
      buttons.forEach((item) => item.classList.toggle("active", item.dataset.screen === target));
      screens.forEach((screen) => screen.classList.toggle("active", screen.id === `screen-${target}`));
      window.scrollTo({ top: 0, behavior: "smooth" });
    });
  });
}

function goToScreen(target) {
  const buttons = [...document.querySelectorAll(".nav-tile, .mobile-nav-item")];
  const screens = [...document.querySelectorAll(".screen")];
  buttons.forEach((item) => item.classList.toggle("active", item.dataset.screen === target));
  screens.forEach((screen) => screen.classList.toggle("active", screen.id === `screen-${target}`));
  window.scrollTo({ top: 0, behavior: "smooth" });
}

function handleShortcuts() {
  const buttons = [...document.querySelectorAll("[data-screen-target]")];
  buttons.forEach((button) => {
    button.addEventListener("click", () => {
      goToScreen(button.dataset.screenTarget);
      document.getElementById("quick-action-menu")?.classList.add("hidden-field");
    });
  });
}

function handleQuickActionMenu() {
  const button = document.getElementById("quick-action-button");
  const menu = document.getElementById("quick-action-menu");
  button.addEventListener("click", () => {
    menu.classList.toggle("hidden-field");
  });
}

function addSaleItemByCode(productCode, quantity) {
  const product = state.products.find((item) => item.code === productCode);
  if (!product || quantity <= 0) return;

  if (parseNumber(product.stock) < quantity) {
    showSyncFeedback("error", "Estoque insuficiente", `O produto ${product.name} tem apenas ${product.stock} em estoque.`);
    return;
  }

  const existing = saleDraftItems.find((item) => item.productCode === product.code);
  if (existing) {
    if (parseNumber(product.stock) < existing.quantity + quantity) {
      showSyncFeedback("error", "Estoque insuficiente", `O produto ${product.name} nao tem quantidade suficiente para essa venda.`);
      return;
    }
    existing.quantity += quantity;
    existing.total = existing.quantity * existing.price;
  } else {
    saleDraftItems.push({
      productCode: product.code,
      productName: productDisplayName(product),
      quantity,
      price: parseNumber(product.price),
      total: parseNumber(product.price) * quantity
    });
  }

  renderSaleDraft();
}

function handleForms() {
  const stockForm = document.getElementById("stock-form");
  stockForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(stockForm);
    const product = state.products.find((item) => item.code === form.get("productCode"));
    if (!product) return;
    const quantity = parseNumber(form.get("quantity"));
    const movementType = String(form.get("movementType"));
    const signed = movementType === "entrada" ? quantity : -quantity;

    if (movementType === "saida" && parseNumber(product.stock) < quantity) {
      showSyncFeedback("error", "Estoque insuficiente", `O produto ${product.name} nao tem estoque suficiente.`);
      return;
    }

    product.stock = Math.max(0, parseNumber(product.stock) + signed);
    recordStockMovement({
      date: today(),
      productCode: product.code,
      productName: productDisplayName(product),
      quantity,
      movementType,
      reason: String(form.get("reason"))
    });
    queueSync("Produtos", "upsert_stock", {
      code: product.code,
      stock: product.stock,
      name: product.name,
      presentation: product.presentation
    });

    stockForm.reset();
    refreshAll();
  });

  const supplyForm = document.getElementById("supply-form");
  supplyForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(supplyForm);
    const name = normalizeText(form.get("name"));
    const supply = ensureSupply(name, normalizeText(form.get("category")), String(form.get("unit")));
    supply.category = normalizeText(form.get("category"));
    supply.unit = String(form.get("unit"));
    supply.stock = parseNumber(form.get("stock"));
    supply.unitCost = parseNumber(form.get("unitCost"));
    queueSync("Insumos", "upsert", supply);
    supplyForm.reset();
    refreshAll();
  });

  const purchaseForm = document.getElementById("purchase-form");
  purchaseForm.date.value = today();
  purchaseForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(purchaseForm);
    const purchase = {
      id: crypto.randomUUID(),
      date: String(form.get("date")),
      kind: normalizeText(form.get("kind")),
      itemName: normalizeText(form.get("itemName")),
      quantity: parseNumber(form.get("quantity")),
      unit: String(form.get("unit")),
      amount: parseNumber(form.get("amount")),
      supplier: normalizeText(form.get("supplier")),
      notes: normalizeText(form.get("notes"))
    };
    state.purchases.unshift(purchase);
    queueSync("Compras", "append", purchase);

    const supply = ensureSupply(purchase.itemName, purchase.kind, purchase.unit);
    const addedStock = purchase.unit === "kg" ? purchase.quantity * 1000 : purchase.quantity;
    supply.stock = parseNumber(supply.stock) + addedStock;
    supply.unit = purchase.unit === "kg" ? "g" : purchase.unit;
    supply.unitCost = addedStock > 0 ? purchase.amount / addedStock : supply.unitCost;
    queueSync("Insumos", "upsert", supply);

    const cashEntry = {
      id: crypto.randomUUID(),
      date: purchase.date,
      account: "loja",
      type: "saida",
      category: `Compra - ${purchase.kind}`,
      amount: purchase.amount,
      notes: `${purchase.itemName} - ${purchase.quantity} ${purchase.unit}`
    };
    state.cashEntries.unshift(cashEntry);
    queueSync("Caixa", "append", cashEntry);

    purchaseForm.reset();
    purchaseForm.date.value = today();
    refreshAll();
    syncQueueNow();
  });

  const productionForm = document.getElementById("production-form");
  productionForm.date.value = today();
  productionForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(productionForm);
    const ingredient = normalizeText(form.get("ingredient"));
    const production = {
      id: crypto.randomUUID(),
      date: String(form.get("date")),
      ingredient,
      paidValue: parseNumber(form.get("paidValue")),
      rawWeight: parseNumber(form.get("rawWeight")),
      finalWeight: parseNumber(form.get("finalWeight")),
      ovenHours: parseNumber(form.get("ovenHours") || 0),
      notes: normalizeText(form.get("notes"))
    };
    state.productions.unshift(production);
    queueSync("Producao", "append", production);

    const driedSupplyName = rawToDriedMap[ingredient] || `${ingredient} desidratado`;
    const baseSupply = ensureSupply(driedSupplyName, "Fruta base", "g");
    baseSupply.stock = parseNumber(baseSupply.stock) + production.finalWeight;
    baseSupply.unitCost = production.finalWeight > 0 ? production.paidValue / production.finalWeight : baseSupply.unitCost;
    queueSync("Insumos", "upsert", baseSupply);

    const fruitProducts = state.products.filter((product) =>
      normalizeText(product.recipe || product.name).toLowerCase() === ingredient.toLowerCase()
    );
    fruitProducts.forEach((product) => {
      const packs = Math.floor(production.finalWeight / Math.max(parseNumber(product.weight), 1));
      product.stock = parseNumber(product.stock) + packs;
      queueSync("Produtos", "upsert_stock", {
        code: product.code,
        stock: product.stock,
        name: product.name,
        presentation: product.presentation
      });
      if (packs > 0) {
        recordStockMovement({
          date: production.date,
          productCode: product.code,
          productName: productDisplayName(product),
          quantity: packs,
          movementType: "entrada",
          reason: `Lote de ${ingredient}`
        });
      }
    });

    const assistant = document.getElementById("production-assistant");
    const yieldPercent = production.rawWeight > 0 ? (production.finalWeight / production.rawWeight) * 100 : 0;
    const finalKgCost = production.finalWeight > 0 ? (production.paidValue / production.finalWeight) * 1000 : 0;
    assistant.classList.remove("hidden-field");
    assistant.innerHTML = `
      <p class="eyebrow">Assistente de producao</p>
      <h3>Producao salva</h3>
      <p>Rendimento de <strong>${yieldPercent.toFixed(1)}%</strong>.</p>
      <p>Custo final de <strong>${formatCurrency(finalKgCost)}</strong> por kg desidratado.</p>
    `;

    productionForm.reset();
    productionForm.date.value = today();
    refreshAll();
    syncQueueNow();
  });

  const saleForm = document.getElementById("sale-form");
  saleForm.date.value = today();
  renderSaleDraft();
  saleForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(saleForm);
    const customerMode = String(form.get("customerMode"));
    let customer = fallbackCustomers[0];

    if (customerMode === "existing") {
      customer = state.customers.find((item) => item.id === form.get("customerId")) ?? fallbackCustomers[0];
    }

    if (customerMode === "new") {
      const newCustomer = {
        id: crypto.randomUUID(),
        name: normalizeText(form.get("newCustomerName") || "").trim(),
        phone: normalizeText(form.get("newCustomerPhone") || "").trim(),
        instagram: normalizeText(form.get("newCustomerInstagram") || "").trim(),
        notes: "",
        lastPurchaseDate: "",
        totalSpent: 0,
        favoriteProducts: []
      };
      state.customers.push(newCustomer);
      queueSync("Clientes", "append", newCustomer);
      customer = newCustomer;
    }

    if (!saleDraftItems.length) {
      showSyncFeedback("info", "Venda vazia", "Adicione pelo menos um item antes de salvar.");
      return;
    }

    const total = saleDraftItems.reduce((sum, item) => sum + parseNumber(item.total), 0);
    const paymentMethod = String(form.get("paymentMethod"));
    const receivableMonth = String(form.get("receivableMonth") || "");
    const saleId = crypto.randomUUID();

    const saleHeader = {
      id: saleId,
      date: String(form.get("date")),
      customerId: customer.id,
      customerName: customer.name,
      paymentMethod,
      total,
      totalItems: saleDraftItems.reduce((sum, item) => sum + parseNumber(item.quantity), 0),
      receivableMonth
    };
    state.sales.unshift(saleHeader);
    queueSync("VendasCabecalho", "append", saleHeader);

    const syncedItems = [];
    for (const item of saleDraftItems) {
      const product = state.products.find((entry) => entry.code === item.productCode);
      if (!product) continue;
      if (parseNumber(product.stock) < parseNumber(item.quantity)) {
        showSyncFeedback("error", "Estoque insuficiente", `O produto ${product.name} nao tem quantidade suficiente.`);
        state.sales = state.sales.filter((sale) => sale.id !== saleId);
        return;
      }

      const saleItem = {
        id: crypto.randomUUID(),
        saleId,
        date: saleHeader.date,
        customerId: customer.id,
        customerName: customer.name,
        productCode: product.code,
        productName: productDisplayName(product),
        quantity: parseNumber(item.quantity),
        price: parseNumber(item.price),
        total: parseNumber(item.total)
      };
      state.saleItems.unshift(saleItem);
      syncedItems.push(saleItem);
      queueSync("VendasItens", "append", saleItem);

      product.stock = parseNumber(product.stock) - parseNumber(item.quantity);
      recordStockMovement({
        date: saleHeader.date,
        productCode: product.code,
        productName: productDisplayName(product),
        quantity: parseNumber(item.quantity),
        movementType: "saida",
        reason: "Venda"
      });
      queueSync("Produtos", "upsert_stock", {
        code: product.code,
        stock: product.stock,
        name: product.name,
        presentation: product.presentation
      });
    }

    const customerTarget = state.customers.find((item) => item.id === customer.id);
    if (customerTarget) {
      customerTarget.lastPurchaseDate = saleHeader.date;
      customerTarget.totalSpent = parseNumber(customerTarget.totalSpent || 0) + total;
    }
    updateCustomerFavorites(customer.id, syncedItems);

    const cashEntry = {
      id: crypto.randomUUID(),
      date: saleHeader.date,
      account: paymentMethod === "Credito" ? "recebiveis" : "loja",
      type: "entrada",
      category: paymentMethod === "Credito" ? "Recebivel de venda" : "Venda",
      amount: total,
      notes: `${saleDraftItems.length} itens (${paymentMethod})${paymentMethod === "Credito" ? ` - previsto ${receivableMonth}` : ""}`,
      expectedMonth: paymentMethod === "Credito" ? receivableMonth : ""
    };
    state.cashEntries.unshift(cashEntry);
    queueSync("Caixa", "append", cashEntry);

    saleForm.reset();
    saleForm.date.value = today();
    document.getElementById("sale-customer-mode").value = "existing";
    saleDraftItems = [];
    refreshAll();
    toggleReceivableMonthField();
    syncQueueNow();
  });

  const customerForm = document.getElementById("customer-form");
  customerForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(customerForm);
    const customer = {
      id: crypto.randomUUID(),
      name: normalizeText(form.get("name")),
      phone: normalizeText(form.get("phone") || ""),
      instagram: normalizeText(form.get("instagram") || ""),
      notes: normalizeText(form.get("notes") || ""),
      lastPurchaseDate: "",
      totalSpent: 0,
      favoriteProducts: []
    };
    state.customers.push(customer);
    queueSync("Clientes", "append", customer);
    customerForm.reset();
    refreshAll();
    syncQueueNow();
  });

  const cashForm = document.getElementById("cash-form");
  cashForm.date.value = today();
  cashForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(cashForm);
    const cashEntry = {
      id: crypto.randomUUID(),
      date: String(form.get("date")),
      account: String(form.get("account")),
      type: String(form.get("type")),
      category: normalizeText(form.get("category")),
      amount: parseNumber(form.get("amount")),
      notes: normalizeText(form.get("notes") || "")
    };
    state.cashEntries.unshift(cashEntry);
    queueSync("Caixa", "append", cashEntry);
    cashForm.reset();
    cashForm.date.value = today();
    refreshAll();
    syncQueueNow();
  });

  const settingsForm = document.getElementById("settings-form");
  settingsForm.hourRate.value = state.settings.hourRate;
  settingsForm.taxPercent.value = state.settings.taxPercent;
  settingsForm.profitPercent.value = state.settings.profitPercent;
  settingsForm.addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(settingsForm);
    state.settings.hourRate = parseNumber(form.get("hourRate"));
    state.settings.taxPercent = parseNumber(form.get("taxPercent"));
    state.settings.profitPercent = parseNumber(form.get("profitPercent"));
    state.recipes = state.recipes.map((recipe) => ({
      ...recipe,
      taxPercent: state.settings.taxPercent,
      profitPercent: state.settings.profitPercent
    }));
    refreshAll();
  });
}

function handleSearch() {
  const input = document.getElementById("product-search");
  input.addEventListener("input", () => renderProducts(input.value));
  const customerInput = document.getElementById("customer-search");
  customerInput.addEventListener("input", () => renderCustomers(customerInput.value));
}

function handleSaleBuilder() {
  const addButton = document.getElementById("add-sale-item-button");
  const paymentMethod = document.getElementById("sale-payment-method");
  const quantityInput = document.getElementById("sale-quantity");
  const productSelect = document.getElementById("sale-product");

  addButton.addEventListener("click", () => {
    addSaleItemByCode(productSelect.value, parseNumber(quantityInput.value || 0));
    quantityInput.value = 1;
  });

  paymentMethod.addEventListener("change", toggleReceivableMonthField);
  toggleReceivableMonthField();
}

function handleMonthlyFilter() {
  const input = document.getElementById("report-month");
  input.value = currentMonthValue();
  input.addEventListener("change", () => renderMonthlySummary());
}

function exportBackup() {
  downloadFile(`terra-relva-backup-${today()}.json`, JSON.stringify(state, null, 2), "application/json");
}

function exportSheets(month = null) {
  const suffix = month || "completo";
  const saleHeaders = month ? monthFilter(state.sales, month) : state.sales;
  const saleItems = month ? monthFilter(state.saleItems, month) : state.saleItems;
  const salesRows = saleHeaders.map((item) => ({
    venda_id: item.id,
    data: item.date,
    cliente: item.customerName,
    pagamento: item.paymentMethod,
    total_itens: item.totalItems,
    total_venda: item.total,
    recebivel_mes: item.receivableMonth
  }));
  const saleItemRows = saleItems.map((item) => ({
    item_id: item.id,
    venda_id: item.saleId,
    data: item.date,
    cliente: item.customerName,
    produto_codigo: item.productCode,
    produto: item.productName,
    quantidade: item.quantity,
    preco_unitario: item.price,
    total_item: item.total
  }));
  const cashRows = (month ? monthFilter(state.cashEntries, month) : state.cashEntries).map((item) => ({
    data: item.date,
    caixa: item.account,
    tipo: item.type,
    categoria: item.category,
    valor: item.amount,
    observacoes: item.notes,
    mes_recebivel: item.expectedMonth || ""
  }));
  const productionRows = (month ? monthFilter(state.productions, month) : state.productions).map((item) => ({
    data: item.date,
    materia_prima: item.ingredient,
    valor_pago: item.paidValue,
    peso_bruto_g: item.rawWeight,
    peso_final_g: item.finalWeight,
    tempo_forno_horas: item.ovenHours,
    observacoes: item.notes
  }));
  const purchaseRows = (month ? monthFilter(state.purchases, month) : state.purchases).map((item) => ({
    data: item.date,
    tipo: item.kind,
    item: item.itemName,
    quantidade: item.quantity,
    unidade: item.unit,
    valor_pago: item.amount,
    fornecedor: item.supplier,
    observacoes: item.notes
  }));
  const stockRows = (month ? monthFilter(state.stockMovements, month) : state.stockMovements).map((item) => ({
    data: item.date,
    produto_codigo: item.productCode,
    produto: item.productName,
    tipo: item.movementType,
    quantidade: item.quantity,
    motivo: item.reason
  }));
  const customerRows = state.customers
    .filter((item) => item.id !== "avulso")
    .map((item) => ({
      nome: item.name,
      telefone: item.phone,
      instagram: item.instagram,
      ultima_compra: item.lastPurchaseDate,
      total_gasto: item.totalSpent,
      favoritos: (item.favoriteProducts || []).join(" | "),
      observacoes: item.notes
    }));
  const productRows = state.products.map((item) => {
    const cost = getProductCostSummary(item);
    return {
      codigo: item.code,
      categoria: item.category,
      nome: item.name,
      apresentacao: item.presentation,
      preco: item.price,
      estoque_atual: item.stock,
      estoque_minimo: item.minimumStock,
      receita_base: item.recipe,
      custo_aprox: cost.totalCost,
      margem_atual: cost.actualMargin,
      preco_sugerido: cost.suggestedPrice
    };
  });
  const supplyRows = state.supplies.map((item) => ({
    nome: item.name,
    categoria: item.category,
    unidade: item.unit,
    estoque: item.stock,
    custo_unitario: item.unitCost
  }));
  const recipeRows = state.recipes.flatMap((recipe) =>
    recipe.items.map((item) => ({
      produto_codigo: recipe.productCode,
      produto: recipe.productName,
      insumo: item.supplyName,
      quantidade: item.quantity,
      unidade: item.unit,
      minutos_mao_de_obra: recipe.laborMinutes,
      imposto_percentual: recipe.taxPercent,
      margem_percentual: recipe.profitPercent
    }))
  );
  const summaryRows = [getMonthlySummary(month || currentMonthValue())];

  downloadFile(`terra-relva-produtos-${suffix}.csv`, toCsv(productRows));
  downloadFile(`terra-relva-insumos-${suffix}.csv`, toCsv(supplyRows));
  downloadFile(`terra-relva-fichas-${suffix}.csv`, toCsv(recipeRows));
  downloadFile(`terra-relva-clientes-${suffix}.csv`, toCsv(customerRows));
  downloadFile(`terra-relva-vendas-cabecalho-${suffix}.csv`, toCsv(salesRows));
  downloadFile(`terra-relva-vendas-itens-${suffix}.csv`, toCsv(saleItemRows));
  downloadFile(`terra-relva-caixa-${suffix}.csv`, toCsv(cashRows));
  downloadFile(`terra-relva-compras-${suffix}.csv`, toCsv(purchaseRows));
  downloadFile(`terra-relva-producao-${suffix}.csv`, toCsv(productionRows));
  downloadFile(`terra-relva-estoque-${suffix}.csv`, toCsv(stockRows));
  downloadFile(`terra-relva-fechamento-${suffix}.csv`, toCsv(summaryRows));
}

function handleExportButtons() {
  document.getElementById("backup-button").addEventListener("click", exportBackup);
  document.getElementById("export-sheets-button").addEventListener("click", () => exportSheets());
  document.getElementById("sync-button").addEventListener("click", () => syncQueueNow());
  document.getElementById("export-month-button").addEventListener("click", () => {
    const month = document.getElementById("report-month").value || currentMonthValue();
    exportSheets(month);
  });
}

function handleSyncConfig() {
  const form = document.getElementById("sync-config-form");
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const data = new FormData(form);
    state.syncConfig = {
      appsScriptUrl: String(data.get("appsScriptUrl") || DEFAULT_APPS_SCRIPT_URL).trim(),
      storeName: String(data.get("storeName") || "Terra Relva").trim() || "Terra Relva"
    };
    state.lastSyncStatus = "offline";
    state.lastSyncMessage = state.syncConfig.appsScriptUrl ? "configurado, aguardando envio" : "sem configuracao";
    saveState();
    renderSyncStatus();
    showSyncFeedback("success", "Configuracao salva", "Agora voce ja pode tocar em Sincronizar nuvem.");
  });
}

function handleSaleCustomerMode() {
  const modeSelect = document.getElementById("sale-customer-mode");
  modeSelect.addEventListener("change", toggleSaleCustomerMode);
  toggleSaleCustomerMode();
}

function registerServiceWorker() {
  if ("serviceWorker" in navigator && window.location.protocol !== "file:") {
    navigator.serviceWorker.register("./sw.js").catch(() => {});
  }
}

async function bootstrap() {
  if (!state.products.length) {
    state.products = await loadProductsCatalog();
  }
  ensureBaseData();
  handleNavigation();
  handleForms();
  handleSearch();
  handleMonthlyFilter();
  handleExportButtons();
  handleSyncConfig();
  handleShortcuts();
  handleSaleCustomerMode();
  handleSaleBuilder();
  handleQuickActionMenu();
  handleInstallPrompt();
  refreshAll();
  showLocalOpenHint();
  registerServiceWorker();
}

bootstrap().catch(() => {
  ensureBaseData();
  handleNavigation();
  handleForms();
  handleSearch();
  handleMonthlyFilter();
  handleExportButtons();
  handleSyncConfig();
  handleShortcuts();
  handleSaleCustomerMode();
  handleSaleBuilder();
  handleQuickActionMenu();
  handleInstallPrompt();
  refreshAll();
  showLocalOpenHint();
});
