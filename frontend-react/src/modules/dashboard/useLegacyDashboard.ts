import { useEffect, useState } from "react";

import { legacyRepository } from "@/services/repositories/legacyRepository";
import type { LegacyDashboardSummary, LegacyStorageSnapshot } from "@/types/legacy";

type LegacyDashboardState = {
  summary: LegacyDashboardSummary;
  snapshot: LegacyStorageSnapshot;
};

export function useLegacyDashboard() {
  const [state, setState] = useState<LegacyDashboardState>(() => {
    const snapshot = legacyRepository.getSnapshot();
    return {
      summary: legacyRepository.getDashboardSummary(),
      snapshot,
    };
  });

  const refresh = () => {
    const snapshot = legacyRepository.getSnapshot();
    setState({
      summary: legacyRepository.getDashboardSummary(),
      snapshot,
    });
  };

  useEffect(() => {
    const handleFocus = () => refresh();
    window.addEventListener("focus", handleFocus);
    return () => window.removeEventListener("focus", handleFocus);
  }, []);

  return {
    ...state,
    refresh,
  };
}
