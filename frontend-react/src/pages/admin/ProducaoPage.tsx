import { ReloadOutlined, ToolOutlined } from "@ant-design/icons";
import { Button, Input, Tag } from "antd";

import { ModuleActionBar } from "@/components/admin/ModuleActionBar";
import { ModuleAlertStack } from "@/components/admin/ModuleAlertStack";
import { ModulePageHeader } from "@/components/admin/ModulePageHeader";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import { ModuleSummaryCard } from "@/components/admin/ModuleSummaryCard";
import { ModuleSummaryRow } from "@/components/admin/ModuleSummaryRow";
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

  const moduleWarnings = [
    ...legacySnapshot.warnings,
    ...productionSnapshot.incompleteBatches
      .slice(0, 3)
      .map((batch) => `${batch.record.ingredient}: ${batch.notes.join(" ") || "Base parcial para custo e rendimento."}`),
  ];

  return (
    <div className="module-page-shell">
      <ModulePageHeader
        eyebrow="Leitura estruturada de producao"
        title="Producao"
        description={pageDescription}
        statusTag={legacySnapshot.hasPersistedState ? "Leitura do legado habilitada" : "Sem estado legado persistido"}
        actions={
          <>
            <Button type="primary" size="large" icon={<ToolOutlined />}>
              Somente leitura
            </Button>
            <Button size="large" icon={<ReloadOutlined />} onClick={() => window.location.reload()}>
              Recarregar pagina
            </Button>
          </>
        }
      />

      <ModuleSummaryRow>
        <ModuleSummaryCard
          label="Producoes visiveis"
          value={visibleBatches.length}
          hint={`Ultima leitura em ${new Date(legacySnapshot.loadedAt).toLocaleString("pt-BR")}`}
        />
        <ModuleSummaryCard
          label="Producoes encontradas"
          value={productionSnapshot.summary.totalProductions}
          hint="Leitura conectando materia-prima, receita associada e movimentos de estoque."
          tone="success"
        />
        <ModuleSummaryCard
          label="Producoes incompletas"
          value={productionSnapshot.summary.incompleteProductions}
          hint="Lotes com custo parcial, rendimento nao calculavel ou vinculacao incompleta."
          tone="warning"
        />
        <ModuleSummaryCard
          label="Custo total estimado"
          value={formatCurrency(productionSnapshot.summary.totalEstimatedCost)}
          hint={`Peso final acumulado de ${productionSnapshot.summary.totalFinalWeight} g`}
        />
      </ModuleSummaryRow>

      <ModuleAlertStack title="Integridade parcial das producoes" items={moduleWarnings} type="warning" />

      <div className="module-main-grid">
        <div className="module-primary-column">
          <ModuleSectionCard>
            <div className="module-table-shell module-table">
              <ModuleActionBar
                title="Producoes do legado"
                description="Lista com rendimento, custo, produto ligado e integridade dos dados quando possivel."
                tags={
                  <>
                    <Tag color="blue">Sem gravacao</Tag>
                    <Tag color="green">Rendimento e custo quando houver base</Tag>
                    <Tag color="gold">Transparencia de lacunas</Tag>
                  </>
                }
                controls={
                  <Input
                    allowClear
                    value={search}
                    placeholder="Buscar por materia-prima, produto ligado, lote, status ou observacao"
                    onChange={(event) => setSearch(event.target.value)}
                  />
                }
              />

              <ProductionTable
                batches={visibleBatches}
                selectedId={selectedId ?? visibleSelectedBatch?.record.id ?? null}
                onSelectBatch={setSelectedId}
              />
            </div>
          </ModuleSectionCard>
        </div>

        <div className="module-secondary-column">
          <ProductionSummaryPanel batch={visibleSelectedBatch} />
        </div>
      </div>
    </div>
  );
}
