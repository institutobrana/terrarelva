import { Typography } from "antd";
import type { ReactNode } from "react";

type ModuleSummaryCardProps = {
  label: string;
  value: ReactNode;
  hint?: ReactNode;
  tone?: "default" | "success" | "warning" | "danger";
};

export function ModuleSummaryCard({ label, value, hint, tone = "default" }: ModuleSummaryCardProps) {
  return (
    <div className={`module-summary-card tone-${tone}`}>
      <Typography.Text className="module-summary-label">{label}</Typography.Text>
      <Typography.Title level={3} className="module-summary-value">
        {value}
      </Typography.Title>
      {hint ? <Typography.Paragraph className="module-summary-hint">{hint}</Typography.Paragraph> : null}
    </div>
  );
}
