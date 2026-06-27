import { Card, Col, Row, Space, Tag, Typography } from "antd";

const catalogPlaceholders = [
  "Barras de banana",
  "Frutas desidratadas",
  "Chas artesanais",
  "Kits e combos",
];

export function CatalogoPage() {
  return (
    <Space direction="vertical" size={24} className="store-page">
      <div>
        <Tag color="gold">Catalogo placeholder</Tag>
        <Typography.Title level={2} className="store-section-title">
          Catalogo da loja
        </Typography.Title>
        <Typography.Paragraph className="store-description">
          Esta rota ja existe para receber a migracao futura do catalogo publico sem misturar a interface da loja com a do admin.
        </Typography.Paragraph>
      </div>

      <Row gutter={[24, 24]}>
        {catalogPlaceholders.map((item) => (
          <Col xs={24} md={12} xl={6} key={item}>
            <Card className="catalog-card">
              <Tag color="green">Em preparacao</Tag>
              <Typography.Title level={4}>{item}</Typography.Title>
              <Typography.Paragraph>
                Espaco reservado para dados reais quando o modulo de produtos for conectado.
              </Typography.Paragraph>
            </Card>
          </Col>
        ))}
      </Row>
    </Space>
  );
}
