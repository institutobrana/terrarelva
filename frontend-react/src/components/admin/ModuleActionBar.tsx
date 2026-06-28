import { Space, Typography } from "antd";
import type { ReactNode } from "react";

type ModuleActionBarProps = {
  title: string;
  description: string;
  controls?: ReactNode;
  tags?: ReactNode;
};

export function ModuleActionBar({ title, description, controls, tags }: ModuleActionBarProps) {
  return (
    <div className="module-action-bar">
      <div className="module-action-copy">
        <Typography.Title level={4} className="module-section-title">
          {title}
        </Typography.Title>
        <Typography.Paragraph className="module-section-description">{description}</Typography.Paragraph>
        {tags ? (
          <Space wrap className="module-action-tags">
            {tags}
          </Space>
        ) : null}
      </div>

      {controls ? <div className="module-action-controls">{controls}</div> : null}
    </div>
  );
}
