import { CalculatorOutlined, ReloadOutlined } from "@ant-design/icons";
import { Button, Input, Space, Tag } from "antd";

import { ModuleActionBar } from "@/components/admin/ModuleActionBar";
import { ModuleAlertStack } from "@/components/admin/ModuleAlertStack";
import { ModulePageHeader } from "@/components/admin/ModulePageHeader";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import { ModuleSummaryCard } from "@/components/admin/ModuleSummaryCard";
import { ModuleSummaryRow } from "@/components/admin/ModuleSummaryRow";
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

  const moduleWarnings = [
    ...legacySnapshot.warnings,
    ...pricingSnapshot.incompleteProducts
      .slice(0, 3)
      .map((item) => `${item.product.name}: ${item.notes.join(" ") || "Base parcial para custo e margem."}`),
  ];

  return (
    <div className="module-page-shell">
      <ModulePageHeader
        eyebrow="Leitura estruturada de precificacao"
        title="Precificacao"
        description={pageDescription}
        statusTag={legacySnapshot.hasPersistedState ? "Leitura do legado habilitada" : "Sem estado legado persistido"}
        actions={
          <>
            <Button type="primary" size="large" icon={<CalculatorOutlined />}>
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
          label="Produtos visiveis"
          value={visibleProducts.length}
          hint={`Ultima leitura em ${new Date(legacySnapshot.loadedAt).toLocaleString("pt-BR")}`}
        />
        <ModuleSummaryCard
          label="Receitas encontradas"
          value={pricingSnapshot.productsWithRecipe.length}
          hint="Base teorica localizada no legado para composicao e simulacao."
          tone="success"
        />
        <ModuleSummaryCard
          label="Produtos incompletos"
          value={pricingSnapshot.incompleteProducts.length}
          hint="Itens sem receita completa, sem producao observada ou com lacunas relevantes."
          tone="warning"
        />
        <ModuleSummaryCard
          label="Bases divergentes"
          value={pricingSnapshot.divergentProducts.length}
          hint={`Hora ${formatCurrency(pricingSnapshot.settings.hourRate)} · Imposto ${pricingSnapshot.settings.taxPercent}% · Margem ${pricingSnapshot.settings.profitPercent}%`}
          tone="danger"
        />
      </ModuleSummaryRow>

      <ModuleAlertStack title="Leitura parcial da precificacao" items={moduleWarnings} type="warning" />

      <div className="module-main-grid">
        <div className="module-primary-column">
          <ModuleSectionCard>
            <div className="module-table-shell module-table">
              <Space direction="vertical" size={18} style={{ width: "100%" }}>
                <ModuleActionBar
                  title="Base de precificacao hibrida"
                  description="Comparacao entre custo teorico da receita e custo observado da producao quando houver base segura."
                  tags={
                    <>
                      <Tag color="blue">Somente leitura</Tag>
                      <Tag color="green">Custo teorico + observado</Tag>
                      <Tag color="gold">Transparencia de divergencia</Tag>
                    </>
                  }
                  controls={
                    <Input
                      allowClear
                      value={search}
                      placeholder="Buscar por produto, categoria, receita, status ou base de custo"
                      onChange={(event) => setSearch(event.target.value)}
                    />
                  }
                />

                <PricingProductsTable
                  products={visibleProducts}
                  selectedCode={selectedCode ?? visibleSelectedProduct?.product.code ?? null}
                  onSelectProduct={setSelectedCode}
                />
              </Space>
            </div>
          </ModuleSectionCard>
        </div>

        <div className="module-secondary-column">
          <PricingProductSummary
            productView={visibleSelectedProduct}
            hourRate={pricingSnapshot.settings.hourRate}
            simulatedPriceInput={simulatedPriceInput}
            onSimulatedPriceChange={setSimulatedPriceInput}
            simulation={simulation}
          />
        </div>
      </div>
    </div>
  );
}
