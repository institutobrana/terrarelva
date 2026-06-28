import { ReloadOutlined, ToolOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { PageHero } from "@/components/ui/PageHero";
import { ProductionSummaryPanel } from "@/modules/production/ProductionSummaryPanel";
import { ProductionTable } from "@/modules/production/ProductionTable";
import { useProductionModule } from "@/modules/production/useProductionModule";

type ProducaoPageProps = {
  view?: "overview" | "recent" | "lots" | "supplies" | "costs" | "expiry";
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProducaoPage({ view = "overview" }: ProducaoPageProps) {
  const { legacySnapshot, productionSnapshot, filteredBatches, selectedBatch, search, setSearch, selectedId, setSelectedId } =
    useProductionModule();

  const visibleBatches =
    view === "recent"
      ? filteredBatches.slice(0, 5)
      : view === "lots"
        ? filteredBatches.filter((batch) => batch.stockEntries.length > 0)
        : view === "supplies"
          ? filteredBatches.filter((batch) => Boolean(batch.outputSupply))
          : view === "costs"
            ? filteredBatches.filter((batch) => batch.breakdown.calculationReady)
            : view === "expiry"
              ? filteredBatches.filter(() => false)
              : filteredBatches;

  const visibleSelectedBatch =
    visibleBatches.find((batch) => batch.record.id === selectedBatch?.record.id) ?? visibleBatches[0] ?? null;

  const pageDescription =
    view === "recent"
      ? "Recorte das producoes mais recentes encontradas no legado."
      : view === "lots"
        ? "Recorte das producoes com sinais de lote pelo motivo registrado nos movimentos de estoque."
        : view === "supplies"
          ? "Recorte focado nas producoes que ja apontam para insumo final encontrado."
          : view === "costs"
            ? "Recorte das producoes com base minima para custo e rendimento."
            : view === "expiry"
              ? "O legado atual nao traz validade estruturada; esta subtela evidencia essa lacuna sem inventar dados."
              : "Leitura estruturada das producoes do legado, conectando materia-prima, produtos ligados, custos e movimentos de estoque quando possivel.";

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PageHero
          eyebrow="Leitura estruturada de producao"
          title="Producao"
          description={pageDescription}
          tag={legacySnapshot.hasPersistedState ? "Leitura do legado habilitada" : "Sem estado legado persistido"}
          metrics={[
            { label: "Producoes visiveis", value: String(visibleBatches.length) },
            { label: "Peso final total", value: `${productionSnapshot.summary.totalFinalWeight} g` },
            { label: "Ultima leitura", value: new Date(legacySnapshot.loadedAt).toLocaleString("pt-BR") },
          ]}
          actions={
            <Space wrap>
              <Button type="primary" size="large" icon={<ToolOutlined />}>
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
          <Statistic title="Producoes encontradas" value={productionSnapshot.summary.totalProductions} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Statistic title="Producoes incompletas" value={productionSnapshot.summary.incompleteProductions} />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Statistic title="Peso final total" value={productionSnapshot.summary.totalFinalWeight} suffix="g" />
        </Card>
      </Col>
      <Col xs={24} md={6}>
        <Card className="module-card">
          <Space direction="vertical" size={4}>
            <Typography.Text type="secondary">Custo total estimado</Typography.Text>
            <Typography.Text strong>{formatCurrency(productionSnapshot.summary.totalEstimatedCost)}</Typography.Text>
            <Typography.Text type="secondary">Base parcial quando o legado nao fecha tudo.</Typography.Text>
          </Space>
        </Card>
      </Col>

      <Col span={24}>
        <Card className="module-card">
          <Space direction="vertical" size={16} style={{ width: "100%" }}>
            <div>
              <Typography.Title level={4} style={{ marginBottom: 0 }}>
                Producoes do legado
              </Typography.Title>
              <Typography.Text type="secondary">
                Lista com rendimento, custo, produto ligado e integridade dos dados quando possivel.
              </Typography.Text>
              <div style={{ marginTop: 8 }}>
                <Tag color="blue">Sem gravacao</Tag>
                <Tag color="green">Rendimento e custo quando houver base</Tag>
                <Tag color="gold">Transparencia de lacunas</Tag>
              </div>
            </div>

            <ProductionTable
              batches={visibleBatches}
              search={search}
              onSearchChange={setSearch}
              selectedId={selectedId ?? visibleSelectedBatch?.record.id ?? null}
              onSelectBatch={setSelectedId}
            />
          </Space>
        </Card>
      </Col>

      <Col span={24}>
        <ProductionSummaryPanel batch={visibleSelectedBatch} />
      </Col>
    </Row>
  );
}
