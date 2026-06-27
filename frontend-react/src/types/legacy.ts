export const LEGACY_PRIMARY_STORAGE_KEY = "terra-relva-app-state-v5";
export const LEGACY_FALLBACK_STORAGE_KEY = "terra-relva-app-state-v4";

export type LegacySyncStatus = "offline" | "ok" | "erro" | string;

export interface Product {
  code: string;
  category: string;
  name: string;
  presentation: string;
  weight: number;
  price: number;
  stock: number;
  minimumStock: number;
  active?: string;
  recipe: string;
}

export interface Customer {
  id: string;
  name: string;
  phone: string;
  instagram: string;
  notes: string;
  lastPurchaseDate: string;
  totalSpent: number;
  favoriteProducts: string[];
}

export interface Production {
  id: string;
  date: string;
  ingredient: string;
  paidValue: number;
  rawWeight: number;
  finalWeight: number;
  ovenHours: number;
  notes: string;
}

export interface Sale {
  id: string;
  date: string;
  customerId: string;
  customerName: string;
  paymentMethod: string;
  total: number;
  totalItems: number;
  receivableMonth: string;
}

export interface SaleItem {
  id: string;
  saleId: string;
  date: string;
  customerId: string;
  customerName: string;
  productCode: string;
  productName: string;
  quantity: number;
  price: number;
  total: number;
}

export interface Purchase {
  id: string;
  date: string;
  kind: string;
  itemName: string;
  quantity: number;
  unit: string;
  amount: number;
  supplier: string;
  notes: string;
}

export interface Supply {
  id: string;
  name: string;
  category: string;
  unit: string;
  stock: number;
  unitCost: number;
}

export interface RecipeItem {
  supplyName: string;
  quantity: number;
  unit: string;
}

export interface Recipe {
  productCode: string;
  productName: string;
  taxPercent: number;
  profitPercent: number;
  laborMinutes: number;
  items: RecipeItem[];
}

export interface CashEntry {
  id: string;
  date: string;
  account: string;
  type: string;
  category: string;
  amount: number;
  notes: string;
  expectedMonth?: string;
}

export interface StockMovement {
  id?: string;
  date: string;
  productCode: string;
  productName: string;
  quantity: number;
  movementType: string;
  reason: string;
}

export interface AppSettings {
  hourRate: number;
  taxPercent: number;
  profitPercent: number;
}

export interface SyncConfig {
  appsScriptUrl: string;
  storeName: string;
}

export interface SyncQueueItem {
  id: string;
  createdAt: string;
  sheet: string;
  action: string;
  payload: unknown;
}

export interface LegacyAppState {
  products: Product[];
  customers: Customer[];
  productions: Production[];
  sales: Sale[];
  saleItems: SaleItem[];
  purchases: Purchase[];
  supplies: Supply[];
  recipes: Recipe[];
  cashEntries: CashEntry[];
  stockMovements: StockMovement[];
  syncConfig: SyncConfig;
  syncQueue: SyncQueueItem[];
  lastSyncAt: string;
  lastSyncStatus: LegacySyncStatus;
  lastSyncMessage: string;
  settings: AppSettings;
}

export interface LegacyStorageSnapshot {
  state: LegacyAppState;
  sourceKey: string | null;
  loadedAt: string;
  available: boolean;
  hasPersistedState: boolean;
  warnings: string[];
}

export interface LegacyDashboardSummary {
  productsCount: number;
  customersCount: number;
  salesCount: number;
  lowStockCount: number;
  lojaCashBalance: number | null;
  loadedAt: string;
  sourceKey: string | null;
  hasPersistedState: boolean;
  syncStatus: string;
  syncMessage: string;
}
