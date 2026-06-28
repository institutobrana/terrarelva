import type { ReactNode } from "react";

export function AdminWorkspace({ children }: { children: ReactNode }) {
  return (
    <section className="terra-workspace">
      <main className="terra-workspace-content">{children}</main>
    </section>
  );
}
