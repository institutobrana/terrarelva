import { legacyRepository } from "@/services/repositories/legacyRepository";

import { buildProductionModuleSnapshot } from "@/modules/production/selectors";

export class ProductionRepository {
  getSnapshot() {
    const snapshot = legacyRepository.getSnapshot();

    return {
      legacy: snapshot,
      production: buildProductionModuleSnapshot(snapshot),
    };
  }
}

export const productionRepository = new ProductionRepository();
