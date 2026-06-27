import { ArrowRightOutlined, ShoppingOutlined } from "@ant-design/icons";
import { Button, Card, Col, Row, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

export function LojaHomePage() {
  return (
    <Space direction="vertical" size={24} className="store-page">
      <Card className="store-hero-card">
        <Row gutter={[32, 32]} align="middle">
          <Col xs={24} xl={13}>
            <Space direction="vertical" size={18}>
              <Tag color="green">Loja publica em preparacao</Tag>
              <Typography.Title level={1} className="store-title">
                Terra Relva em uma vitrine unica, integrada ao futuro admin.
              </Typography.Title>
              <Typography.Paragraph className="store-description">
                Esta e a base inicial da area /loja. O catalogo publico, carrinho e checkout serao conectados nas proximas
                fases sem separar o projeto em duas aplicacoes.
              </Typography.Paragraph>
              <Space wrap>
                <Button type="primary" size="large" icon={<ShoppingOutlined />}>
                  Catalogo futuro
                </Button>
                <Button size="large" icon={<ArrowRightOutlined />}>
                  Estrutura pronta para Mercado Pago
                </Button>
              </Space>
            </Space>
          </Col>
          <Col xs={24} xl={11}>
            <div className="store-hero-highlight">
              <strong>Convivencia segura</strong>
              <span>O legado continua operando enquanto a nova loja e o novo admin ganham estrutura modular.</span>
            </div>
          </Col>
        </Row>
      </Card>

      <Row gutter={[24, 24]}>
        <Col xs={24} md={12} xl={8}>
          <Card className="store-info-card" title="Catalogo">
            Produtos, combos e kits vao entrar aqui aproveitando o dominio ja validado no sistema atual.
          </Card>
        </Col>
        <Col xs={24} md={12} xl={8}>
          <Card className="store-info-card" title="Carrinho">
            A estrutura visual ja separa a experiencia publica do shell administrativo.
          </Card>
        </Col>
        <Col xs={24} md={24} xl={8}>
          <Card className="store-info-card" title="Proximo passo">
            <Link to="/loja/catalogo">Abrir a pagina de catalogo placeholder</Link>
          </Card>
        </Col>
      </Row>
    </Space>
  );
}
