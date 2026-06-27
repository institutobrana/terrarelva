import { Card, Space, Typography } from "antd";
import type { ReactNode } from "react";

type PlaceholderModuleCardProps = {
  title: string;
  description: string;
  bullets: string[];
  icon?: ReactNode;
};

export function PlaceholderModuleCard({ title, description, bullets, icon }: PlaceholderModuleCardProps) {
  return (
    <Card className="module-card">
      <Space direction="vertical" size={12}>
        <Space size="middle">
          <div className="module-icon">{icon}</div>
          <Typography.Title level={4} className="module-title">
            {title}
          </Typography.Title>
        </Space>
        <Typography.Paragraph className="module-description">{description}</Typography.Paragraph>
        <ul className="module-bullets">
          {bullets.map((bullet) => (
            <li key={bullet}>{bullet}</li>
          ))}
        </ul>
      </Space>
    </Card>
  );
}
