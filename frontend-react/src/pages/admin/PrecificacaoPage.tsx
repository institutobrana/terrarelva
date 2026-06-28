import { CalculatorOutlined, ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { PageHero } from "@/components/ui/PageHero";
import { PricingProductSummary } from "@/modules/pricing/PricingProductSummary";
import { PricingProductsTable } from "@/modules/pricing/PricingProductsTable";
import { usePricingModule } from "@/modules/pricing/usePricingModule";

type PrecificacaoPageProps = {
  view?: "overview" | "with-recipe" | "incomplete" | "parameters" | "simulation";
};

function formatCurrency(value: number) {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function PrecificacaoPage({ view = "overview" }: PrecificacaoPageProps) {
  const {
    legacySnapshot,
    pricingSnapshot,
    filteredProducts,
    selectedProduct,
    search,
    setSearch,
    selectedCode,
    setSelectedCode,
    simulatedPriceInput,
    setSimulatedPriceInput,
    simulation,
  } = usePricingModule();

  const visibleProducts =
    view === "with-recipe"
      ? filteredProducts.filter((item) => item.recipe)
      : view === "incomplete"
        ? filteredProducts.filter(
            (item) =>
              item.status !== "completo" || ["divergentes", "base-insuficiente"].includes(item.hybridCost.confidenceStatus),
          )
        : filteredProducts;

  const visibleSelectedProduct =
    visibleProducts.find((item) => item.product.code === selectedProduct?.product.code) ?? visibleProducts[0] ?? null;

  const pageDescription =
    view === "with-recipe"
      ? "Lista focada nos produtos que ja possuem ficha tecnica encontrada no legado."
      : view === "incomplete"
        ? "Lista focada nos produtos com base fraca, divergente ou ainda incompleta para custo."
        : view === "parameters"
          ? "Tela focada nos parametros globais e na forma como eles entram na comparacao entre teoria e pratica."
          : view === "simulation"
            ? "Tela focada na simulacao visual de preco, usando a melhor base segura disponivel."
            : "Precificacao com base hibrida: custo teorico por receita, custo observado por producao e comparacao entre os dois quando houver base suficiente.";

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PageHero
          eyebrow="Leitura estruturada de precificacao"
          title="Precificacao"
          description={pageDescription}
          tag={legacySnapshot.hasPersistedState ? "Leitura do legado habilitada" : "Sem estado legado persistido"}
          metrics={[
            { label: "Produtos visiveis", value: String(visibleProducts.length) },
            { label: "Receitas encontradas", value: String(pricingSnapshot.productsWithRecipe.length) },
            { label: "Divergencias", value: String(pricingSnapshot.divergentProducts.length) },
            { label: "Ultima leitura", value: new Date(legacySnapshot.loadedAt).toLocaleString("pt-BR") },
          ]}
          actions={
            <Space wrap>
              <Button type="primary" size="large" icon={<CalculatorOutlined />}>
                Somente leitura
              </Button>
              <Button size="large" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
                Recarregar pagina
              </Button>
            </Space>
          }
        />
      </Col>

      {legacySnapshot.warnings.length ? (
        <Col span={24}>
          <Alert
            type="warning"
            showIcon
            message="Leitura do legado com observacoes"
            description={legacySnapshot.warnings.join(" ")}
          />
        </Col>
      ) : null}

      <Col xs={24} md={6}>
        <Card className="module-card">
          <Statistic title="Produtos com receita" value={pricingSnapshot.productsWithRecipe.length} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Statistic title="Produtos incompletos" value={pricingSnapshot.incompleteProducts.length} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Statistic title="Bases divergentes" value={pricingSnapshot.divergentProducts.length} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">Parametros globais</Typography.Text>
            <Typography.Text>Hora: {formatCurrency(pricingSnapshot.settings.hourRate)}</Typography.Text>
            <Typography.Text>
              Imposto: {pricingSnapshot.settings.taxPercent}% · Margem: {pricingSnapshot.settings.profitPercent}%
            </Typography.Text>
          </Space>
        </Card>
      </Col>

      <Col span={24}>
        <Card className="module-card">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Base de precificacao hibrida
              </Typography.Title>
              <Typography.Text type="secondary">
                Comparacao entre custo teorico da receita e custo observado da producao quando houver base segura.
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">Somente leitura</Tag>
                <Tag color="green">Custo teorico + observado</Tag>
                <Tag color="gold">Transparencia de divergencia</Tag>
              </div>
            </div>

            <PricingProductsTable
              products={visibleProducts}
              search={search}
              onSearchChange={setSearch}
              selectedCode={selectedCode ?? visibleSelectedProduct?.product.code ?? null}
              onSelectProduct={setSelectedCode}
            />
          </Space>
        </Card>
      </Col>

      <Col span={24}>
        <PricingProductSummary
          productView={visibleSelectedProduct}
          hourRate={pricingSnapshot.settings.hourRate}
          simulatedPriceInput={simulatedPriceInput}
          onSimulatedPriceChange={setSimulatedPriceInput}
          simulation={simulation}
        />
      </Col>
    </Row>
  );
}
