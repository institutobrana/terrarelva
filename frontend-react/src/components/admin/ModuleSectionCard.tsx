import { Card } from "antd";
import type { ReactNode } from "react";

type ModuleSectionCardProps = {
  children: ReactNode;
  className?: string;
};

export function ModuleSectionCard({ children, className }: ModuleSectionCardProps) {
  return <Card className={`module-card module-section-card ${className ?? ""}`.trim()}>{children}</Card>;
}
