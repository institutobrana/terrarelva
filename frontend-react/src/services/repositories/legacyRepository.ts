import type { LegacyDashboardSummary, LegacyStorageSnapshot, Product } from "@/types/legacy";
import { readLegacyStorage } from "@/services/storage/legacyStorage";

function calculateCashBalance(snapshot: LegacyStorageSnapshot, account: string) {
  const matchingEntries = snapshot.state.cashEntries.filter((entry) => entry.account === account);
  if (!matchingEntries.length) {
    return null;
  }

  return matchingEntries.reduce((sum, entry) => {
    return sum + (entry.type === "entrada" ? entry.amount : -entry.amount);
  }, 0);
}

function calculateLowStock(products: Product[]) {
  return products.filter((product) => product.stock <= product.minimumStock).length;
}

export class LegacyRepository {
  getSnapshot() {
    return readLegacyStorage();
  }

  getDashboardSummary(): LegacyDashboardSummary {
    const snapshot = this.getSnapshot();

    return {
      productsCount: snapshot.state.products.length,
      customersCount: snapshot.state.customers.filter((customer) => customer.id !== "avulso").length,
      salesCount: snapshot.state.sales.length,
      lowStockCount: calculateLowStock(snapshot.state.products),
      lojaCashBalance: calculateCashBalance(snapshot, "loja"),
      loadedAt: snapshot.loadedAt,
      sourceKey: snapshot.sourceKey,
      hasPersistedState: snapshot.hasPersistedState,
      syncStatus: snapshot.state.lastSyncStatus,
      syncMessage: snapshot.state.lastSyncMessage,
    };
  }

  getProducts() {
    return this.getSnapshot().state.products;
  }
}

export const legacyRepository = new LegacyRepository();
