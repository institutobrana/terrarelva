import { Alert, Card, Descriptions, Space, Tag, Typography } from "antd";

import type { ProductionBatchView } from "@/modules/production/types";

type ProductionSummaryPanelProps = {
  batch: ProductionBatchView | null;
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function ProductionSummaryPanel({ batch }: ProductionSummaryPanelProps) {
  if (!batch) {
    return (
      <Card className="module-card">
        <Typography.Text type="secondary">Nenhuma producao encontrada no navegador atual.</Typography.Text>
      </Card>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Card className="module-card">
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
          <div>
            <Typography.Title level={4} style={{ marginBottom: 0 }}>
              {batch.record.ingredient}
            </Typography.Title>
            <Typography.Text type="secondary">{batch.record.date}</Typography.Text>
          </div>

          <Space wrap>
            <Tag color={batch.status === "completo" ? "green" : batch.status === "incompleto" ? "gold" : "default"}>
              {batch.statusLabel}
            </Tag>
            <Tag color="blue">{batch.recipeUsage.recipe ? "Receita associada" : "Sem receita associada"}</Tag>
            <Tag color="purple">{batch.stockEntries.length} movimento(s) de estoque</Tag>
          </Space>

          <Descriptions bordered size="small" column={1}>
            <Descriptions.Item label="Produto(s) ligado(s)">
              {batch.recipeUsage.linkedProducts.length
                ? batch.recipeUsage.linkedProducts.map((product) => product.name).join(", ")
                : "Nenhum produto ligado"}
            </Descriptions.Item>
            <Descriptions.Item label="Receita associada">
              {batch.recipeUsage.recipe?.productName ?? "Nenhuma receita encontrada"}
            </Descriptions.Item>
            <Descriptions.Item label="Peso bruto / final">
              {`${batch.record.rawWeight} g -> ${batch.record.finalWeight} g`}
            </Descriptions.Item>
            <Descriptions.Item label="Rendimento">
              {batch.breakdown.yieldPercent !== null
                ? `${batch.breakdown.yieldPercent.toFixed(1)}%`
                : "Nao calculavel"}
            </Descriptions.Item>
            <Descriptions.Item label="Custo material estimado">
              {formatCurrency(batch.breakdown.estimatedMaterialCost)}
            </Descriptions.Item>
            <Descriptions.Item label="Custo mao de obra estimado">
              {formatCurrency(batch.breakdown.estimatedLaborCost)}
            </Descriptions.Item>
            <Descriptions.Item label="Custo total estimado">
              {formatCurrency(batch.breakdown.estimatedTotalCost)}
            </Descriptions.Item>
            <Descriptions.Item label="Valor pago no registro legado">
              {formatCurrency(batch.breakdown.sourcePaidValue)}
            </Descriptions.Item>
            <Descriptions.Item label="Custo final por grama">
              {formatCurrency(batch.breakdown.costPerGram)}
            </Descriptions.Item>
            <Descriptions.Item label="Lote / movimentos">
              {batch.stockEntries.length
                ? batch.stockEntries.map((movement) => movement.reason).join(", ")
                : "Sem lote explicito no legado"}
            </Descriptions.Item>
            <Descriptions.Item label="Validade">Nao existe campo de validade no legado atual.</Descriptions.Item>
          </Descriptions>
        </Space>
      </Card>

      {batch.notes.length ? (
        <Alert
          type={batch.status === "sem-base" ? "info" : "warning"}
          showIcon
          message="Integridade dos dados da producao"
          description={batch.notes.join(" ")}
        />
      ) : null}

      <Card className="module-card" title="Observacoes do legado">
        <Typography.Paragraph style={{ marginBottom: 0 }}>
          {batch.record.notes || "Nenhuma observacao registrada para esta producao no estado legado."}
        </Typography.Paragraph>
      </Card>
    </Space>
  );
}
