import { DatabaseOutlined, EyeOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { PageHero } from "@/components/ui/PageHero";
import { ProductTable } from "@/modules/products/ProductTable";
import { useLegacyProducts } from "@/modules/products/useLegacyProducts";

export function ProdutosPage() {
  const { snapshot, products, search, setSearch } = useLegacyProducts();
  const totalProducts = snapshot.state.products.length;
  const activeProducts = snapshot.state.products.filter((product) => product.active?.toLowerCase() === "sim").length;
  const lowStockProducts = snapshot.state.products.filter((product) => product.stock <= product.minimumStock).length;

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PageHero
          eyebrow="Catalogo legado em modo leitura"
          title="Produtos"
          description="A tela de produtos agora lista o catalogo real salvo no estado legado do navegador atual, sem escrita nem edicao."
          tag={snapshot.hasPersistedState ? "Somente leitura habilitada" : "Aguardando dados legados no navegador"}
          metrics={[
            { label: "Chave lida", value: snapshot.sourceKey ?? "Nao encontrada" },
            { label: "Produtos filtrados", value: String(products.length) },
            { label: "Ultima leitura", value: new Date(snapshot.loadedAt).toLocaleString("pt-BR") },
          ]}
          actions={
            <Space wrap>
              <Button type="primary" size="large" icon={<EyeOutlined />}>
                Modo leitura
              </Button>
              <Button size="large" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Recarregar pagina
              </Button>
            </Space>
          }
        />
      </Col>

      {snapshot.warnings.length ? (
        <Col span={24}>
          <Alert
            type="warning"
            showIcon
            message="Leitura do catalogo com observacoes"
            description={snapshot.warnings.join(" ")}
          />
        </Col>
      ) : null}

      <Col xs={24} md={8}>
        <Card className="module-card">
          <Statistic title="Produtos no estado legado" value={totalProducts} prefix={<DatabaseOutlined />} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card className="module-card">
          <Statistic title="Produtos ativos" value={activeProducts} />
        </Card>
      </Col>
      <Col xs={24} md={8}>
        <Card className="module-card">
          <Statistic title="Estoque baixo" value={lowStockProducts} />
        </Card>
      </Col>

      <Col span={24}>
        <Card className="module-card">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Catalogo legado
              </Typography.Title>
              <Typography.Text type="secondary">
                Fonte atual: {snapshot.sourceKey ?? "nenhuma chave encontrada"}.
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">Sem edicao</Tag>
                <Tag color="green">Ant Design Table</Tag>
              </div>
            </div>

            <ProductTable products={products} search={search} onSearchChange={setSearch} />
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
