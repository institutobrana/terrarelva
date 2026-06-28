import { createContext, useContext } from "react";
import type { ReactNode } from "react";

type AdminShellBandContextValue = {
  setShellBandContent: (content: ReactNode | null) => void;
};

export const AdminShellBandContext = createContext<AdminShellBandContextValue | undefined>(undefined);

export function useAdminShellBand() {
  const context = useContext(AdminShellBandContext);
  if (!context) {
    throw new Error("useAdminShellBand must be used within AdminShellBandContext");
  }

  return context;
}
