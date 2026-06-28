import { Descriptions, Space, Tag, Typography } from "antd";

import { ModuleAlertStack } from "@/components/admin/ModuleAlertStack";
import { ModuleDetailPanel } from "@/components/admin/ModuleDetailPanel";
import { ModuleEmptyState } from "@/components/admin/ModuleEmptyState";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
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
      <ModuleSectionCard>
        <div className="module-table-shell">
          <ModuleEmptyState
            title="Nenhuma producao encontrada"
            description="A selecao atual nao trouxe lotes para o painel secundario. Ajuste o filtro para inspecionar uma producao."
          />
        </div>
      </ModuleSectionCard>
    );
  }

  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <ModuleDetailPanel eyebrow="Painel secundario" title={batch.record.ingredient} description={batch.record.date}>
        <Space direction="vertical" size={12} style={{ width: "100%" }}>
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
              {batch.breakdown.yieldPercent !== null ? `${batch.breakdown.yieldPercent.toFixed(1)}%` : "Nao calculavel"}
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
      </ModuleDetailPanel>

      <ModuleAlertStack
        title="Integridade dos dados da producao"
        items={batch.notes}
        type={batch.status === "sem-base" ? "info" : "warning"}
      />

      <ModuleSectionCard>
        <div className="module-table-shell">
          <Typography.Title level={5} className="module-section-title">
            Observacoes do legado
          </Typography.Title>
          {batch.record.notes ? (
            <Typography.Paragraph style={{ marginBottom: 0 }}>{batch.record.notes}</Typography.Paragraph>
          ) : (
            <ModuleEmptyState
              title="Sem observacoes estruturadas"
              description="Esta producao nao traz anotacoes textuais no estado legado atual."
            />
          )}
        </div>
      </ModuleSectionCard>
    </Space>
  );
}
