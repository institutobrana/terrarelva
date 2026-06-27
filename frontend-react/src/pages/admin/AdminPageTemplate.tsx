import { Button, Col, Row } from "antd";
import type { ReactNode } from "react";

import { PageHero } from "@/components/ui/PageHero";
import { PlaceholderModuleCard } from "@/components/ui/PlaceholderModuleCard";

type AdminPageTemplateProps = {
  eyebrow: string;
  title: string;
  description: string;
  tag: string;
  metrics: { label: string; value: string }[];
  cards: {
    title: string;
    description: string;
    bullets: string[];
    icon?: ReactNode;
  }[];
};

export function AdminPageTemplate({ eyebrow, title, description, tag, metrics, cards }: AdminPageTemplateProps) {
  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PageHero
          eyebrow={eyebrow}
          title={title}
          description={description}
          tag={tag}
          metrics={metrics}
          actions={
            <Button type="primary" size="large">
              Placeholder preparado
            </Button>
          }
        />
      </Col>
      {cards.map((card) => (
        <Col xs={24} md={12} xl={8} key={card.title}>
          <PlaceholderModuleCard {...card} />
        </Col>
      ))}
    </Row>
  );
}
