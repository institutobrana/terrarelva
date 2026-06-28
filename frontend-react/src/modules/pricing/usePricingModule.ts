import { useMemo, useState } from "react";

import { filterPricingViews, simulatePricing } from "@/modules/pricing/selectors";
import { pricingRepository } from "@/modules/pricing/pricingRepository";

export function usePricingModule() {
  const [search, setSearch] = useState("");
  const [selectedCode, setSelectedCode] = useState<string | null>(null);
  const [simulatedPriceInput, setSimulatedPriceInput] = useState("");

  const snapshot = pricingRepository.getSnapshot();
  const filteredProducts = useMemo(
    () => filterPricingViews(snapshot.pricing.productViews, search),
    [search, snapshot.pricing.productViews],
  );

  const selectedProduct =
    filteredProducts.find((item) => item.product.code === selectedCode) ??
    snapshot.pricing.productViews.find((item) => item.product.code === selectedCode) ??
    filteredProducts[0] ??
    snapshot.pricing.productViews[0] ??
    null;

  const simulatedPrice = simulatedPriceInput.trim() ? Number(simulatedPriceInput) : null;
  const selectedBaseCost =
    selectedProduct?.hybridCost.adoptedCost ??
    selectedProduct?.hybridCost.theoreticalCost ??
    selectedProduct?.hybridCost.observedCost ??
    null;
  const simulation = simulatePricing(selectedBaseCost, simulatedPrice);

  return {
    legacySnapshot: snapshot.legacy,
    pricingSnapshot: snapshot.pricing,
    filteredProducts,
    selectedProduct,
    search,
    setSearch,
    selectedCode,
    setSelectedCode,
    simulatedPriceInput,
    setSimulatedPriceInput,
    simulation,
  };
}
