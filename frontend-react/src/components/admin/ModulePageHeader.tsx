import { Space, Tag, Typography } from "antd";
import type { ReactNode } from "react";

type ModulePageHeaderProps = {
  eyebrow: string;
  title: string;
  description: string;
  statusTag?: string;
  actions?: ReactNode;
};

export function ModulePageHeader({ eyebrow, title, description, statusTag, actions }: ModulePageHeaderProps) {
  return (
    <div className="module-page-header">
      <div className="module-page-header-copy">
        <Typography.Text className="page-eyebrow">{eyebrow}</Typography.Text>
        <Typography.Title level={2} className="module-title">
          {title}
        </Typography.Title>
        <Typography.Paragraph className="module-description">{description}</Typography.Paragraph>
        {statusTag ? <Tag className="module-status-tag">{statusTag}</Tag> : null}
      </div>

      {actions ? (
        <div className="module-page-header-actions">
          <Space wrap>{actions}</Space>
        </div>
      ) : null}
    </div>
  );
}
