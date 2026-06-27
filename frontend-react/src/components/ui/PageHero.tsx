import { Card, Col, Row, Space, Tag, Typography } from "antd";
import type { ReactNode } from "react";

type Metric = {
  label: string;
  value: string;
};

type PageHeroProps = {
  eyebrow: string;
  title: string;
  description: string;
  tag?: string;
  actions?: ReactNode;
  metrics?: Metric[];
};

export function PageHero({ eyebrow, title, description, tag, actions, metrics = [] }: PageHeroProps) {
  return (
    <Card className="hero-card">
      <Row gutter={[24, 24]} align="middle" justify="space-between">
        <Col xs={24} xl={15}>
          <Space direction="vertical" size={10}>
            <Typography.Text className="page-eyebrow">{eyebrow}</Typography.Text>
            <Typography.Title level={2} className="hero-title">
              {title}
            </Typography.Title>
            <Typography.Paragraph className="hero-description">{description}</Typography.Paragraph>
            {tag ? <Tag color="gold">{tag}</Tag> : null}
          </Space>
        </Col>

        <Col xs={24} xl={9}>
          <Space direction="vertical" size={16} className="hero-actions-block">
            {actions}
            {metrics.length ? (
              <div className="hero-metrics-grid">
                {metrics.map((metric) => (
                  <div key={metric.label} className="hero-metric">
                    <span>{metric.label}</span>
                    <strong>{metric.value}</strong>
                  </div>
                ))}
              </div>
            ) : null}
          </Space>
        </Col>
      </Row>
    </Card>
  );
}
