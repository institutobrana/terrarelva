import { Alert, Card, Col, Descriptions, Divider, InputNumber, Row, Space, Tag, Typography } from "antd";

import type { PricingSimulation, ProductPricingView } from "@/modules/pricing/types";

type PricingProductSummaryProps = {
  productView: ProductPricingView | null;
  hourRate: number;
  simulatedPriceInput: string;
  onSimulatedPriceChange: (value: string) => void;
  simulation: PricingSimulation;
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return `${(value * 100).toFixed(1)}%`;
}

function getConfidenceTagColor(productView: ProductPricingView) {
  switch (productView.hybridCost.confidenceStatus) {
    case "compativeis":
      return "green";
    case "divergentes":
      return "red";
    case "somente-receita":
      return "blue";
    case "somente-producao":
      return "gold";
    default:
      return "default";
  }
}

export function PricingProductSummary({
  productView,
  hourRate,
  simulatedPriceInput,
  onSimulatedPriceChange,
  simulation,
}: PricingProductSummaryProps) {
  if (!productView) {
    return (
      <Card className="module-card">
        <Typography.Text type="secondary">Nenhum produto disponivel para analise no navegador atual.</Typography.Text>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card className="module-card">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {productView.product.name}
            </Typography.Title>
            <Typography.Text type="secondary">
              {productView.product.presentation || "Sem apresentacao"} · {productView.product.category || "Sem categoria"}
            </Typography.Text>
          </div>

          <Space wrap>
            <Tag color={getConfidenceTagColor(productView)}>{productView.hybridCost.confidenceLabel}</Tag>
            <Tag color="blue">{productView.recipe ? "Receita encontrada" : "Receita ausente"}</Tag>
            <Tag color="purple">{productView.breakdown.compositionItems.length} insumo(s)</Tag>
          </Space>

          <Descriptions size="small" column={1} bordered>
            <Descriptions.Item label="Preco atual">{formatCurrency(productView.currentPrice)}</Descriptions.Item>
            <Descriptions.Item label="Custo teorico">{formatCurrency(productView.hybridCost.theoreticalCost)}</Descriptions.Item>
            <Descriptions.Item label="Custo observado">{formatCurrency(productView.hybridCost.observedCost)}</Descriptions.Item>
            <Descriptions.Item label="Custo adotado">{formatCurrency(productView.hybridCost.adoptedCost)}</Descriptions.Item>
            <Descriptions.Item label="Margem sobre custo adotado">{formatCurrency(productView.actualMargin)}</Descriptions.Item>
            <Descriptions.Item label="Margem sobre custo adotado (%)">
              {formatPercent(productView.actualMarginPercent)}
            </Descriptions.Item>
            <Descriptions.Item label="Margem sobre custo teorico">
              {formatCurrency(
                productView.hybridCost.theoreticalCost !== null
                  ? productView.currentPrice - productView.hybridCost.theoreticalCost
                  : null,
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Margem sobre custo observado">
              {formatCurrency(
                productView.hybridCost.observedCost !== null
                  ? productView.currentPrice - productView.hybridCost.observedCost
                  : null,
              )}
            </Descriptions.Item>
            <Descriptions.Item label="Diferenca teoria x pratica">
              {formatCurrency(productView.hybridCost.costDifference)}
            </Descriptions.Item>
            <Descriptions.Item label="Diferenca teoria x pratica (%)">
              {formatPercent(productView.hybridCost.costDifferencePercent)}
            </Descriptions.Item>
            <Descriptions.Item label="Preco sugerido">{formatCurrency(productView.breakdown.suggestedPrice)}</Descriptions.Item>
            <Descriptions.Item label="Receita usada">
              {productView.recipe?.productName || productView.product.recipe || "Nenhuma receita encontrada"}
            </Descriptions.Item>
            <Descriptions.Item label="Parametros aplicados">
              {`Hora ${formatCurrency(hourRate)} · Mao de obra ${productView.breakdown.laborMinutes} min · Imposto ${productView.breakdown.taxPercent}% · Margem ${productView.breakdown.profitPercent}%`}
            </Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {productView.notes.length ? (
        <Alert
          type={productView.status === "sem-base" ? "info" : "warning"}
          showIcon
          message="Leitura parcial da precificacao"
          description={productView.notes.join(" ")}
        />
      ) : null}

      <Card className="module-card" title="Custo teorico detalhado">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          {productView.breakdown.compositionItems.length ? (
            productView.breakdown.compositionItems.map((item) => (
              <Row key={`${item.supplyName}-${item.unit}`} gutter={[12, 12]} align="middle">
                <Col xs={24} md={8}>
                  <Typography.Text strong>{item.supplyName}</Typography.Text>
                </Col>
                <Col xs={12} md={4}>
                  <Typography.Text>
                    {item.quantity} {item.unit}
                  </Typography.Text>
                </Col>
                <Col xs={12} md={5}>
                  <Typography.Text type="secondary">Unitario: {formatCurrency(item.unitCost)}</Typography.Text>
                </Col>
                <Col xs={12} md={4}>
                  <Typography.Text>Total: {formatCurrency(item.totalCost)}</Typography.Text>
                </Col>
                <Col xs={12} md={3}>
                  <Tag color={item.supplyFound ? "green" : "default"}>{item.supplyFound ? "OK" : "Faltando"}</Tag>
                </Col>
              </Row>
            ))
          ) : (
            <Typography.Text type="secondary">Nenhum item de composicao encontrado para este produto.</Typography.Text>
          )}
        </Space>
      </Card>

      <Card className="module-card" title="Custo observado detalhado">
        <Descriptions size="small" column={1} bordered>
          <Descriptions.Item label="Base observada">
            {productView.hybridCost.observedBreakdown.basisLabel}
          </Descriptions.Item>
          <Descriptions.Item label="Custo observado por grama">
            {formatCurrency(productView.hybridCost.observedBreakdown.costPerGram)}
          </Descriptions.Item>
          <Descriptions.Item label="Material observado">
            {formatCurrency(productView.hybridCost.observedBreakdown.materialCost)}
          </Descriptions.Item>
          <Descriptions.Item label="Mao de obra mantida">
            {formatCurrency(productView.hybridCost.observedBreakdown.laborCost)}
          </Descriptions.Item>
          <Descriptions.Item label="Total observado">
            {formatCurrency(productView.hybridCost.observedBreakdown.totalCost)}
          </Descriptions.Item>
          <Descriptions.Item label="Lotes considerados">
            {productView.hybridCost.observedBreakdown.batchCount}
          </Descriptions.Item>
          <Descriptions.Item label="Peso observado acumulado">
            {productView.hybridCost.observedBreakdown.totalObservedWeight
              ? `${productView.hybridCost.observedBreakdown.totalObservedWeight} g`
              : "Nao disponivel"}
          </Descriptions.Item>
          <Descriptions.Item label="Ultima producao usada">
            {productView.hybridCost.observedBreakdown.latestProductionDate || "Nao disponivel"}
          </Descriptions.Item>
          <Descriptions.Item label="Confianca da base observada">
            {productView.hybridCost.observedBreakdown.confidence}
          </Descriptions.Item>
        </Descriptions>
      </Card>

      <Card className="module-card" title="Simulacao local">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <Typography.Text type="secondary">
            Esta simulacao e somente visual. Ela nao grava no legado nem em banco novo.
          </Typography.Text>
          <InputNumber
            style={{ width: "100%" }}
            min={0}
            step={0.5}
            value={simulatedPriceInput ? Number(simulatedPriceInput) : null}
            placeholder="Digite um preco para simular"
            onChange={(value) => onSimulatedPriceChange(value ? String(value) : "")}
          />
          <Divider style={{ margin: 0 }} />
          <Descriptions size="small" column={1}>
            <Descriptions.Item label="Preco simulado">{formatCurrency(simulation.price)}</Descriptions.Item>
            <Descriptions.Item label="Margem simulada">{formatCurrency(simulation.marginAmount)}</Descriptions.Item>
            <Descriptions.Item label="Margem simulada (%)">{formatPercent(simulation.marginPercent)}</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>
    </Space>
  );
}
