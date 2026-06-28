import type { LegacyStorageSnapshot, Product, Production, Recipe, StockMovement, Supply } from "@/types/legacy";

import { buildRecipeCostBreakdown, getPricingSettings } from "@/modules/pricing/selectors";
import type {
  ProductionBatchView,
  ProductionCostBreakdown,
  ProductionModuleSnapshot,
  ProductionObservedCostReference,
  ProductionRecipeUsage,
} from "@/modules/production/types";

function normalizeText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function getOutputSupply(production: Production, supplies: Supply[]) {
  const exactName = `${production.ingredient} desidratado`;
  return (
    supplies.find((supply) => normalizeText(supply.name) === normalizeText(exactName)) ??
    supplies.find((supply) => normalizeText(supply.name).includes(normalizeText(production.ingredient))) ??
    null
  );
}

function getLinkedProducts(production: Production, products: Product[]) {
  return products.filter(
    (product) => normalizeText(product.recipe || product.name) === normalizeText(production.ingredient),
  );
}

function getRecipeUsage(production: Production, products: Product[], recipes: Recipe[]): ProductionRecipeUsage {
  const linkedProducts = getLinkedProducts(production, products);
  const recipe = linkedProducts.length
    ? recipes.find((entry) => entry.productCode === linkedProducts[0].code) ?? null
    : null;

  return {
    recipe,
    linkedProducts,
    recipeItemsCount: recipe?.items.length ?? 0,
  };
}

function getStockEntries(production: Production, movements: StockMovement[]) {
  return movements.filter(
    (movement) =>
      movement.movementType === "entrada" && normalizeText(movement.reason).includes(normalizeText(production.ingredient)),
  );
}

function buildBreakdown(
  production: Production,
  recipeUsage: ProductionRecipeUsage,
  supplies: Supply[],
  snapshot: LegacyStorageSnapshot,
): ProductionCostBreakdown {
  const missingData: string[] = [];
  const yieldPercent = production.rawWeight > 0 ? (production.finalWeight / production.rawWeight) * 100 : null;
  const costPerGram = production.finalWeight > 0 ? production.paidValue / production.finalWeight : null;

  if (!recipeUsage.recipe) {
    missingData.push("Nenhuma receita associada foi encontrada para os produtos ligados a esta producao.");
  }

  if (recipeUsage.linkedProducts.length === 0) {
    missingData.push("Nenhum produto vinculado a esta materia-prima foi encontrado.");
  }

  const baseProduct = recipeUsage.linkedProducts[0] ?? null;
  const recipeBreakdown =
    baseProduct && recipeUsage.recipe
      ? buildRecipeCostBreakdown({
          product: baseProduct,
          recipe: recipeUsage.recipe,
          settings: getPricingSettings(snapshot),
          supplies,
        })
      : null;

  if (recipeBreakdown && !recipeBreakdown.calculationReady) {
    missingData.push(...recipeBreakdown.missingData);
  }

  const estimatedMaterialCost = recipeBreakdown?.materialCost ?? null;
  const estimatedLaborCost = recipeBreakdown?.laborCost ?? null;
  const estimatedTotalCost = recipeBreakdown?.totalCost ?? null;

  return {
    sourcePaidValue: production.paidValue,
    costPerGram,
    estimatedMaterialCost,
    estimatedLaborCost,
    estimatedTotalCost,
    yieldPercent,
    calculationReady: costPerGram !== null || estimatedTotalCost !== null,
    missingData,
  };
}

function getStatus(breakdown: ProductionCostBreakdown, recipeUsage: ProductionRecipeUsage) {
  if (recipeUsage.linkedProducts.length === 0) {
    return { status: "sem-base" as const, label: "Sem base" };
  }
  if (breakdown.missingData.length) {
    return { status: "incompleto" as const, label: "Incompleto" };
  }
  return { status: "completo" as const, label: "Completo" };
}

export function buildProductionBatchView(
  production: Production,
  snapshot: LegacyStorageSnapshot,
): ProductionBatchView {
  const outputSupply = getOutputSupply(production, snapshot.state.supplies);
  const recipeUsage = getRecipeUsage(production, snapshot.state.products, snapshot.state.recipes);
  const stockEntries = getStockEntries(production, snapshot.state.stockMovements);
  const breakdown = buildBreakdown(production, recipeUsage, snapshot.state.supplies, snapshot);
  const estimatedPackCount =
    recipeUsage.linkedProducts.length && recipeUsage.linkedProducts[0].weight > 0
      ? Math.floor(production.finalWeight / recipeUsage.linkedProducts[0].weight)
      : null;
  const statusInfo = getStatus(breakdown, recipeUsage);
  const notes = [
    ...(outputSupply ? [] : ["O insumo final desidratado nao foi encontrado entre os supplies atuais."]),
    ...(stockEntries.length ? [] : ["Nenhum stockMovement de entrada foi encontrado para este lote."]),
    ...breakdown.missingData,
  ];

  return {
    record: production,
    outputSupply,
    recipeUsage,
    stockEntries,
    estimatedPackCount,
    status: statusInfo.status,
    statusLabel: statusInfo.label,
    breakdown,
    notes,
  };
}

export function buildProductionModuleSnapshot(snapshot: LegacyStorageSnapshot): ProductionModuleSnapshot {
  const batches = [...snapshot.state.productions]
    .sort((left, right) => new Date(right.date).getTime() - new Date(left.date).getTime())
    .map((production) => buildProductionBatchView(production, snapshot));

  const completeCosts = batches
    .map((batch) => batch.breakdown.estimatedTotalCost)
    .filter((value): value is number => value !== null);

  const observedCostReferences = buildObservedCostReferences(batches);

  return {
    batches,
    recentBatches: batches.slice(0, 5),
    incompleteBatches: batches.filter((batch) => batch.status !== "completo"),
    summary: {
      totalProductions: batches.length,
      totalFinalWeight: batches.reduce((sum, batch) => sum + batch.record.finalWeight, 0),
      totalEstimatedCost: completeCosts.length ? completeCosts.reduce((sum, value) => sum + value, 0) : null,
      recentProductions: Math.min(batches.length, 5),
      incompleteProductions: batches.filter((batch) => batch.status !== "completo").length,
    },
    observedCostReferences,
  };
}

function buildObservedCostReferences(batches: ProductionBatchView[]): ProductionObservedCostReference[] {
  const grouped = new Map<string, ProductionBatchView[]>();

  batches.forEach((batch) => {
    const key = normalizeText(batch.record.ingredient);
    const current = grouped.get(key) ?? [];
    current.push(batch);
    grouped.set(key, current);
  });

  return [...grouped.entries()].map(([ingredientKey, ingredientBatches]) => {
    const validCostBatches = ingredientBatches.filter(
      (batch) => batch.breakdown.costPerGram !== null && batch.record.finalWeight > 0,
    );
    const totalFinalWeight = validCostBatches.reduce((sum, batch) => sum + batch.record.finalWeight, 0);
    const weightedAverageCostPerGram =
      totalFinalWeight > 0
        ? validCostBatches.reduce(
            (sum, batch) => sum + batch.record.finalWeight * (batch.breakdown.costPerGram ?? 0),
            0,
          ) / totalFinalWeight
        : null;
    const latestBatch = ingredientBatches[0] ?? null;
    const latestCostPerGram = latestBatch?.breakdown.costPerGram ?? null;
    const latestProductionDate = latestBatch?.record.date ?? null;
    const linkedProductCodes = [
      ...new Set(
        ingredientBatches.flatMap((batch) => batch.recipeUsage.linkedProducts.map((product) => product.code)),
      ),
    ];
    const confidence =
      validCostBatches.length >= 2 && totalFinalWeight > 0
        ? "forte"
        : validCostBatches.length === 1
          ? "moderada"
          : "fraca";

    return {
      ingredient: ingredientBatches[0]?.record.ingredient ?? ingredientKey,
      outputSupplyName: ingredientBatches[0]?.outputSupply?.name ?? null,
      batchCount: ingredientBatches.length,
      totalFinalWeight,
      weightedAverageCostPerGram,
      latestCostPerGram,
      latestProductionDate,
      linkedProductCodes,
      confidence,
      notes: [
        ...(validCostBatches.length ? [] : ["Nenhum lote com custo por grama calculavel foi encontrado."]),
        ...(ingredientBatches.some((batch) => batch.recipeUsage.linkedProducts.length === 0)
          ? ["Ha lotes sem produto ligado com seguranca."]
          : []),
      ],
    };
  });
}

export function filterProductionBatches(batches: ProductionBatchView[], term: string) {
  const normalized = term.trim().toLowerCase();
  if (!normalized) {
    return batches;
  }

  return batches.filter((batch) =>
    [
      batch.record.ingredient,
      batch.record.notes,
      batch.recipeUsage.linkedProducts.map((product) => product.name).join(" "),
      batch.outputSupply?.name ?? "",
      batch.statusLabel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(normalized),
  );
}
