import { useMemo, useState } from "react";

import { filterProductionBatches } from "@/modules/production/selectors";
import { productionRepository } from "@/modules/production/productionRepository";

export function useProductionModule() {
  const [search, setSearch] = useState("");
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const snapshot = productionRepository.getSnapshot();
  const filteredBatches = useMemo(
    () => filterProductionBatches(snapshot.production.batches, search),
    [search, snapshot.production.batches],
  );

  const selectedBatch =
    filteredBatches.find((batch) => batch.record.id === selectedId) ??
    snapshot.production.batches.find((batch) => batch.record.id === selectedId) ??
    filteredBatches[0] ??
    snapshot.production.batches[0] ??
    null;

  return {
    legacySnapshot: snapshot.legacy,
    productionSnapshot: snapshot.production,
    filteredBatches,
    selectedBatch,
    search,
    setSearch,
    selectedId,
    setSelectedId,
  };
}
