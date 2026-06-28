import { InboxOutlined } from "@ant-design/icons";
import { Button, Space, Typography } from "antd";
import type { ReactNode } from "react";

type ModuleEmptyStateProps = {
  title: string;
  description: string;
  action?: ReactNode;
};

export function ModuleEmptyState({ title, description, action }: ModuleEmptyStateProps) {
  return (
    <div className="module-empty-state">
      <Space direction="vertical" size={10} align="center">
        <div className="module-empty-icon">
          <InboxOutlined />
        </div>
        <Typography.Title level={5} className="module-empty-title">
          {title}
        </Typography.Title>
        <Typography.Paragraph className="module-empty-description">{description}</Typography.Paragraph>
        {typeof action === "string" ? <Button>{action}</Button> : action}
      </Space>
    </div>
  );
}
