import {
  LEGACY_FALLBACK_STORAGE_KEY,
  LEGACY_PRIMARY_STORAGE_KEY,
  type LegacyAppState,
  type LegacyStorageSnapshot,
} from "@/types/legacy";

const FALLBACK_CUSTOMER = {
  id: "avulso",
  name: "Cliente avulso",
  phone: "",
  instagram: "",
  notes: "",
  lastPurchaseDate: "",
  totalSpent: 0,
  favoriteProducts: [],
};

function asNumber(value: unknown, fallback = 0) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

function asString(value: unknown, fallback = "") {
  return typeof value === "string" ? value : fallback;
}

function asStringArray(value: unknown) {
  return Array.isArray(value) ? value.map((item) => asString(item)).filter(Boolean) : [];
}

function asRecord(value: unknown) {
  return value && typeof value === "object" ? (value as Record<string, unknown>) : {};
}

function asArray<T>(value: unknown, mapper: (entry: Record<string, unknown>) => T) {
  return Array.isArray(value) ? value.map((entry) => mapper(asRecord(entry))) : [];
}

function createEmptyState(): LegacyAppState {
  return {
    products: [],
    customers: [FALLBACK_CUSTOMER],
    productions: [],
    sales: [],
    saleItems: [],
    purchases: [],
    supplies: [],
    recipes: [],
    cashEntries: [],
    stockMovements: [],
    syncConfig: {
      appsScriptUrl: "",
      storeName: "Terra Relva",
    },
    syncQueue: [],
    lastSyncAt: "",
    lastSyncStatus: "offline",
    lastSyncMessage: "sem configuracao",
    settings: {
      hourRate: 18,
      taxPercent: 10,
      profitPercent: 20,
    },
  };
}

function normalizeLegacyState(raw: unknown): LegacyAppState {
  const parsed = asRecord(raw);
  const base = createEmptyState();

  return {
    products: asArray(parsed.products, (entry) => ({
      code: asString(entry.code),
      category: asString(entry.category),
      name: asString(entry.name),
      presentation: asString(entry.presentation),
      weight: asNumber(entry.weight),
      price: asNumber(entry.price),
      stock: asNumber(entry.stock),
      minimumStock: asNumber(entry.minimumStock),
      active: entry.active ? asString(entry.active) : undefined,
      recipe: asString(entry.recipe),
    })),
    customers: (() => {
      const customers = asArray(parsed.customers, (entry) => ({
        id: asString(entry.id),
        name: asString(entry.name),
        phone: asString(entry.phone),
        instagram: asString(entry.instagram),
        notes: asString(entry.notes),
        lastPurchaseDate: asString(entry.lastPurchaseDate),
        totalSpent: asNumber(entry.totalSpent),
        favoriteProducts: asStringArray(entry.favoriteProducts),
      })).filter((customer) => customer.id && customer.name);

      return customers.length ? customers : [FALLBACK_CUSTOMER];
    })(),
    productions: asArray(parsed.productions, (entry) => ({
      id: asString(entry.id),
      date: asString(entry.date),
      ingredient: asString(entry.ingredient),
      paidValue: asNumber(entry.paidValue),
      rawWeight: asNumber(entry.rawWeight),
      finalWeight: asNumber(entry.finalWeight),
      ovenHours: asNumber(entry.ovenHours),
      notes: asString(entry.notes),
    })),
    sales: asArray(parsed.sales, (entry) => ({
      id: asString(entry.id),
      date: asString(entry.date),
      customerId: asString(entry.customerId, "avulso"),
      customerName: asString(entry.customerName, "Cliente avulso"),
      paymentMethod: asString(entry.paymentMethod, "Pix"),
      total: asNumber(entry.total),
      totalItems: asNumber(entry.totalItems ?? entry.quantity),
      receivableMonth: asString(entry.receivableMonth),
    })),
    saleItems: asArray(parsed.saleItems, (entry) => ({
      id: asString(entry.id),
      saleId: asString(entry.saleId),
      date: asString(entry.date),
      customerId: asString(entry.customerId, "avulso"),
      customerName: asString(entry.customerName, "Cliente avulso"),
      productCode: asString(entry.productCode),
      productName: asString(entry.productName),
      quantity: asNumber(entry.quantity),
      price: asNumber(entry.price),
      total: asNumber(entry.total),
    })),
    purchases: asArray(parsed.purchases, (entry) => ({
      id: asString(entry.id),
      date: asString(entry.date),
      kind: asString(entry.kind),
      itemName: asString(entry.itemName),
      quantity: asNumber(entry.quantity),
      unit: asString(entry.unit),
      amount: asNumber(entry.amount),
      supplier: asString(entry.supplier),
      notes: asString(entry.notes),
    })),
    supplies: asArray(parsed.supplies, (entry) => ({
      id: asString(entry.id),
      name: asString(entry.name),
      category: asString(entry.category),
      unit: asString(entry.unit, "un"),
      stock: asNumber(entry.stock),
      unitCost: asNumber(entry.unitCost),
    })),
    recipes: asArray(parsed.recipes, (entry) => ({
      productCode: asString(entry.productCode),
      productName: asString(entry.productName),
      taxPercent: asNumber(entry.taxPercent, base.settings.taxPercent),
      profitPercent: asNumber(entry.profitPercent, base.settings.profitPercent),
      laborMinutes: asNumber(entry.laborMinutes),
      items: asArray(entry.items, (item) => ({
        supplyName: asString(item.supplyName),
        quantity: asNumber(item.quantity),
        unit: asString(item.unit, "g"),
      })),
    })),
    cashEntries: asArray(parsed.cashEntries, (entry) => ({
      id: asString(entry.id),
      date: asString(entry.date),
      account: asString(entry.account),
      type: asString(entry.type),
      category: asString(entry.category),
      amount: asNumber(entry.amount),
      notes: asString(entry.notes),
      expectedMonth: entry.expectedMonth ? asString(entry.expectedMonth) : undefined,
    })),
    stockMovements: asArray(parsed.stockMovements, (entry) => ({
      id: entry.id ? asString(entry.id) : undefined,
      date: asString(entry.date),
      productCode: asString(entry.productCode),
      productName: asString(entry.productName),
      quantity: asNumber(entry.quantity),
      movementType: asString(entry.movementType),
      reason: asString(entry.reason),
    })),
    syncConfig: {
      appsScriptUrl: asString(asRecord(parsed.syncConfig).appsScriptUrl),
      storeName: asString(asRecord(parsed.syncConfig).storeName, "Terra Relva"),
    },
    syncQueue: asArray(parsed.syncQueue, (entry) => ({
      id: asString(entry.id),
      createdAt: asString(entry.createdAt),
      sheet: asString(entry.sheet),
      action: asString(entry.action),
      payload: entry.payload,
    })),
    lastSyncAt: asString(parsed.lastSyncAt),
    lastSyncStatus: asString(parsed.lastSyncStatus, "offline"),
    lastSyncMessage: asString(parsed.lastSyncMessage, "sem configuracao"),
    settings: {
      hourRate: asNumber(asRecord(parsed.settings).hourRate, 18),
      taxPercent: asNumber(asRecord(parsed.settings).taxPercent, 10),
      profitPercent: asNumber(asRecord(parsed.settings).profitPercent, 20),
    },
  };
}

export function readLegacyStorage(): LegacyStorageSnapshot {
  const loadedAt = new Date().toISOString();
  const warnings: string[] = [];

  if (typeof window === "undefined" || !window.localStorage) {
    warnings.push("Leitura do legado indisponivel fora do navegador.");
    return {
      state: createEmptyState(),
      sourceKey: null,
      loadedAt,
      available: false,
      hasPersistedState: false,
      warnings,
    };
  }

  const primary = window.localStorage.getItem(LEGACY_PRIMARY_STORAGE_KEY);
  const fallback = window.localStorage.getItem(LEGACY_FALLBACK_STORAGE_KEY);
  const rawState = primary ?? fallback;
  const sourceKey = primary ? LEGACY_PRIMARY_STORAGE_KEY : fallback ? LEGACY_FALLBACK_STORAGE_KEY : null;

  if (!rawState) {
    warnings.push("Nenhum estado legado encontrado no localStorage do navegador atual.");
    return {
      state: createEmptyState(),
      sourceKey,
      loadedAt,
      available: true,
      hasPersistedState: false,
      warnings,
    };
  }

  try {
    const parsed = JSON.parse(rawState);
    return {
      state: normalizeLegacyState(parsed),
      sourceKey,
      loadedAt,
      available: true,
      hasPersistedState: true,
      warnings,
    };
  } catch {
    warnings.push("Falha ao interpretar o JSON do estado legado.");
    return {
      state: createEmptyState(),
      sourceKey,
      loadedAt,
      available: true,
      hasPersistedState: false,
      warnings,
    };
  }
}
