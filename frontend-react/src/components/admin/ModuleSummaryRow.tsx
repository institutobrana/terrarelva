import type { ReactNode } from "react";

type ModuleSummaryRowProps = {
  children: ReactNode;
};

export function ModuleSummaryRow({ children }: ModuleSummaryRowProps) {
  return <div className="module-summary-row">{children}</div>;
}
