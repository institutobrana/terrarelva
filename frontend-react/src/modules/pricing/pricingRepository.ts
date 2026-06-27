import { legacyRepository } from "@/services/repositories/legacyRepository";

import { buildPricingModuleSnapshot } from "@/modules/pricing/selectors";

export class PricingRepository {
  getSnapshot() {
    const snapshot = legacyRepository.getSnapshot();

    return {
      legacy: snapshot,
      pricing: buildPricingModuleSnapshot(snapshot),
    };
  }
}

export const pricingRepository = new PricingRepository();
