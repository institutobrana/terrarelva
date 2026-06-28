import { Space, Typography } from "antd";
import type { ReactNode } from "react";

import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type ModuleDetailPanelProps = {
  eyebrow: string;
  title: string;
  description: string;
  children: ReactNode;
};

export function ModuleDetailPanel({ eyebrow, title, description, children }: ModuleDetailPanelProps) {
  return (
    <ModuleSectionCard className="module-detail-panel">
      <Space direction="vertical" size={18} style={{ width: "100%" }}>
        <div className="module-detail-header">
          <Typography.Text className="page-eyebrow">{eyebrow}</Typography.Text>
          <Typography.Title level={4} className="module-section-title">
            {title}
          </Typography.Title>
          <Typography.Paragraph className="module-section-description">{description}</Typography.Paragraph>
        </div>
        {children}
      </Space>
    </ModuleSectionCard>
  );
}
