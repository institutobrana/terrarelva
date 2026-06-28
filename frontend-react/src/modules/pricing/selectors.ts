import type { LegacyStorageSnapshot, Product, Recipe, Supply } from "@/types/legacy";

import { buildProductionModuleSnapshot } from "@/modules/production/selectors";
import { buildHybridCostComparison } from "@/modules/pricing/hybridCostEngine";
import type {
  PricingInput,
  PricingModuleSnapshot,
  PricingResult,
  PricingSettings,
  PricingSimulation,
  ProductPricingView,
  RecipeCompositionItem,
  RecipeCostBreakdown,
} from "@/modules/pricing/types";

function normalizeText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findRecipeByProductCode(recipes: Recipe[], productCode: string) {
  return recipes.find((recipe) => recipe.productCode === productCode) ?? null;
}

function findSupplyByName(supplies: Supply[], supplyName: string) {
  const normalized = normalizeText(supplyName);
  return supplies.find((supply) => normalizeText(supply.name) === normalized) ?? null;
}

function formatStatus(result: RecipeCostBreakdown, recipe: Recipe | null) {
  if (!recipe) {
    return { status: "sem-base" as const, label: "Sem receita" };
  }

  if (!result.calculationReady) {
    return { status: "incompleto" as const, label: "Incompleto" };
  }

  return { status: "completo" as const, label: "Completo" };
}

export function getPricingSettings(snapshot: LegacyStorageSnapshot): PricingSettings {
  return {
    hourRate: snapshot.state.settings.hourRate,
    taxPercent: snapshot.state.settings.taxPercent,
    profitPercent: snapshot.state.settings.profitPercent,
  };
}

export function buildRecipeCostBreakdown(input: PricingInput): RecipeCostBreakdown {
  const { recipe, settings, supplies } = input;

  if (!recipe) {
    return {
      materialCost: null,
      laborCost: null,
      totalCost: null,
      suggestedPrice: null,
      marginAmount: null,
      calculationReady: false,
      missingData: ["Produto sem receita vinculada no estado legado."],
      compositionItems: [],
      laborMinutes: 0,
      taxPercent: settings.taxPercent,
      profitPercent: settings.profitPercent,
    };
  }

  const compositionItems: RecipeCompositionItem[] = recipe.items.map((item) => {
    const supply = findSupplyByName(supplies, item.supplyName);
    const unitCost = supply ? supply.unitCost : null;

    return {
      supplyName: item.supplyName,
      quantity: item.quantity,
      unit: item.unit,
      unitCost,
      totalCost: unitCost !== null ? item.quantity * unitCost : null,
      supplyFound: Boolean(supply),
    };
  });

  const missingData = [
    ...compositionItems
      .filter((item) => !item.supplyFound)
      .map((item) => `Insumo nao encontrado: ${item.supplyName}.`),
    ...compositionItems
      .filter((item) => item.supplyFound && (item.unitCost === null || item.unitCost <= 0))
      .map((item) => `Insumo sem custo unitario confiavel: ${item.supplyName}.`),
  ];

  const materialCostReady = compositionItems.every((item) => item.totalCost !== null && item.totalCost >= 0);
  const materialCost = materialCostReady
    ? compositionItems.reduce((sum, item) => sum + (item.totalCost ?? 0), 0)
    : null;

  const laborMinutes = recipe.laborMinutes;
  const laborCost = materialCostReady ? (laborMinutes / 60) * settings.hourRate : null;
  const totalCost = materialCost !== null && laborCost !== null ? materialCost + laborCost : null;
  const taxPercent = recipe.taxPercent ?? settings.taxPercent;
  const profitPercent = recipe.profitPercent ?? settings.profitPercent;
  const suggestedPrice =
    totalCost !== null ? totalCost * (1 + taxPercent / 100 + profitPercent / 100) : null;
  const marginAmount = suggestedPrice !== null && totalCost !== null ? suggestedPrice - totalCost : null;

  return {
    materialCost,
    laborCost,
    totalCost,
    suggestedPrice,
    marginAmount,
    calculationReady: totalCost !== null,
    missingData,
    compositionItems,
    laborMinutes,
    taxPercent,
    profitPercent,
  };
}

export function buildProductPricingView(
  snapshot: LegacyStorageSnapshot,
  product: Product,
  recipes: Recipe[],
  supplies: Supply[],
  settings: PricingSettings,
  observedCostReferences = buildProductionModuleSnapshot(snapshot).observedCostReferences,
): PricingResult {
  const recipe = findRecipeByProductCode(recipes, product.code);
  const breakdown = buildRecipeCostBreakdown({ product, recipe, settings, supplies });
  const hybridCost = buildHybridCostComparison(observedCostReferences, snapshot, product, recipe, breakdown, settings);
  const currentPrice = product.price;
  const displayCost = hybridCost.adoptedCost ?? hybridCost.theoreticalCost ?? hybridCost.observedCost;
  const actualMargin = displayCost !== null ? currentPrice - displayCost : null;
  const actualMarginPercent = displayCost !== null && currentPrice > 0 ? (actualMargin ?? 0) / currentPrice : null;
  const statusInfo = formatStatus(breakdown, recipe);
  const notes = [
    ...(recipe ? [] : ["O produto ainda nao possui ficha tecnica no snapshot legado."]),
    ...breakdown.missingData,
    ...hybridCost.notes,
  ];

  return {
    product,
    recipe,
    breakdown,
    hybridCost,
    currentPrice,
    actualMargin,
    actualMarginPercent,
    status: statusInfo.status,
    statusLabel: statusInfo.label,
    notes,
  };
}

export function buildPricingModuleSnapshot(snapshot: LegacyStorageSnapshot): PricingModuleSnapshot {
  const settings = getPricingSettings(snapshot);
  const recipes = snapshot.state.recipes;
  const supplies = snapshot.state.supplies;
  const observedCostReferences = buildProductionModuleSnapshot(snapshot).observedCostReferences;
  const productViews = snapshot.state.products.map((product) =>
    buildProductPricingView(snapshot, product, recipes, supplies, settings, observedCostReferences),
  );

  return {
    settings,
    productViews,
    productsWithRecipe: productViews.filter((item) => item.recipe),
    incompleteProducts: productViews.filter((item) => item.status !== "completo"),
    divergentProducts: productViews.filter((item) => item.hybridCost.confidenceStatus === "divergentes"),
    recipes,
    supplies,
  };
}

export function filterPricingViews(views: ProductPricingView[], filter: string) {
  const term = filter.trim().toLowerCase();

  if (!term) {
    return views;
  }

  return views.filter((view) =>
    [
      view.product.code,
      view.product.name,
      view.product.presentation,
      view.product.category,
      view.product.recipe,
      view.statusLabel,
    ]
      .join(" ")
      .toLowerCase()
      .includes(term),
  );
}

export function simulatePricing(totalCost: number | null, simulatedPrice: number | null): PricingSimulation {
  if (totalCost === null || simulatedPrice === null || simulatedPrice <= 0) {
    return { price: simulatedPrice, marginAmount: null, marginPercent: null };
  }

  const marginAmount = simulatedPrice - totalCost;
  return {
    price: simulatedPrice,
    marginAmount,
    marginPercent: marginAmount / simulatedPrice,
  };
}
