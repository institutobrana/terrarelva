import { useMemo, useState } from "react";

import { legacyRepository } from "@/services/repositories/legacyRepository";

export function useLegacyProducts() {
  const snapshot = legacyRepository.getSnapshot();
  const [search, setSearch] = useState("");

  const products = useMemo(() => {
    const term = search.trim().toLowerCase();
    if (!term) {
      return snapshot.state.products;
    }

    return snapshot.state.products.filter((product) =>
      [product.code, product.category, product.name, product.presentation, product.recipe]
        .join(" ")
        .toLowerCase()
        .includes(term),
    );
  }, [search, snapshot.state.products]);

  return {
    snapshot,
    products,
    search,
    setSearch,
  };
}
