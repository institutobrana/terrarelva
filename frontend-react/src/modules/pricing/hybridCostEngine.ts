import type { LegacyStorageSnapshot, Product, Recipe } from "@/types/legacy";

import type { ProductionObservedCostReference } from "@/modules/production/types";
import type {
  HybridCostComparison,
  HybridCostObservedBreakdown,
  PricingSettings,
  RecipeCostBreakdown,
  RecipeCompositionItem,
} from "@/modules/pricing/types";

function normalizeText(value: string) {
  return String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .toLowerCase();
}

function findProductionReference(product: Product, references: ProductionObservedCostReference[]) {
  return (
    references.find((reference) => reference.linkedProductCodes.includes(product.code)) ??
    references.find((reference) => normalizeText(reference.ingredient) === normalizeText(product.recipe || product.name)) ??
    null
  );
}

function buildObservedBreakdown(
  product: Product,
  recipe: Recipe | null,
  theoretical: RecipeCostBreakdown,
  reference: ProductionObservedCostReference | null,
): HybridCostObservedBreakdown {
  if (!reference) {
    return {
      available: false,
      basisLabel: "Sem producao observada",
      costPerGram: null,
      materialCost: null,
      laborCost: null,
      totalCost: null,
      batchCount: 0,
      totalObservedWeight: 0,
      latestProductionDate: null,
      confidence: "indisponivel",
      missingData: ["Nenhum lote observado compativel foi encontrado para este produto."],
    };
  }

  if (!recipe) {
    const observedOnlyCost =
      reference.weightedAverageCostPerGram !== null && product.weight > 0
        ? reference.weightedAverageCostPerGram * product.weight
        : null;

    return {
      available: observedOnlyCost !== null,
      basisLabel: "Somente producao observada",
      costPerGram: reference.weightedAverageCostPerGram,
      materialCost: observedOnlyCost,
      laborCost: null,
      totalCost: observedOnlyCost,
      batchCount: reference.batchCount,
      totalObservedWeight: reference.totalFinalWeight,
      latestProductionDate: reference.latestProductionDate,
      confidence: reference.confidence,
      missingData: ["Nao ha receita para complementar embalagem, adicionais ou mao de obra com seguranca."],
    };
  }

  const targetSupplyName = reference.outputSupplyName ? normalizeText(reference.outputSupplyName) : null;
  const hasObservedBase = targetSupplyName
    ? theoretical.compositionItems.some((item) => normalizeText(item.supplyName) === targetSupplyName)
    : false;

  if (!hasObservedBase || reference.weightedAverageCostPerGram === null) {
    return {
      available: false,
      basisLabel: "Producao sem encaixe seguro",
      costPerGram: reference.weightedAverageCostPerGram,
      materialCost: null,
      laborCost: theoretical.laborCost,
      totalCost: null,
      batchCount: reference.batchCount,
      totalObservedWeight: reference.totalFinalWeight,
      latestProductionDate: reference.latestProductionDate,
      confidence: reference.confidence,
      missingData: [
        "Existe producao observada, mas ela nao encaixa com seguranca na ficha tecnica atual do produto.",
      ],
    };
  }

  const observedCostPerGram = reference.weightedAverageCostPerGram;
  const compositionItems: RecipeCompositionItem[] = theoretical.compositionItems.map((item) => {
    if (normalizeText(item.supplyName) === targetSupplyName) {
      return {
        ...item,
        unitCost: observedCostPerGram,
        totalCost: observedCostPerGram !== null ? observedCostPerGram * item.quantity : null,
      };
    }

    return item;
  });

  const materialCostReady = compositionItems.every((item) => item.totalCost !== null);
  const materialCost = materialCostReady
    ? compositionItems.reduce((sum, item) => sum + (item.totalCost ?? 0), 0)
    : null;
  const laborCost = theoretical.laborCost;
  const totalCost = materialCost !== null && laborCost !== null ? materialCost + laborCost : null;

  return {
    available: totalCost !== null,
    basisLabel: "Receita com custo observado da producao",
    costPerGram: reference.weightedAverageCostPerGram,
    materialCost,
    laborCost,
    totalCost,
    batchCount: reference.batchCount,
    totalObservedWeight: reference.totalFinalWeight,
    latestProductionDate: reference.latestProductionDate,
    confidence: reference.confidence,
    missingData: totalCost === null ? ["A substituicao observada ainda nao fecha o custo total com seguranca."] : [],
  };
}

export function buildHybridCostComparison(
  references: ProductionObservedCostReference[],
  _snapshot: LegacyStorageSnapshot,
  product: Product,
  recipe: Recipe | null,
  theoretical: RecipeCostBreakdown,
  _settings: PricingSettings,
): HybridCostComparison {
  const reference = findProductionReference(product, references);
  const observedBreakdown = buildObservedBreakdown(product, recipe, theoretical, reference);
  const theoreticalCost = theoretical.totalCost;
  const observedCost = observedBreakdown.totalCost;
  const costDifference =
    theoreticalCost !== null && observedCost !== null ? observedCost - theoreticalCost : null;
  const costDifferencePercent =
    costDifference !== null && theoreticalCost && theoreticalCost > 0 ? costDifference / theoreticalCost : null;

  if (theoreticalCost !== null && observedCost === null) {
    return {
      theoreticalCost,
      observedCost,
      adoptedCost: theoreticalCost,
      adoptedSource: "teorico",
      costDifference,
      costDifferencePercent,
      confidenceStatus: "somente-receita",
      confidenceLabel: "Somente receita",
      observedBreakdown,
      notes: observedBreakdown.missingData,
    };
  }

  if (theoreticalCost === null && observedCost !== null) {
    return {
      theoreticalCost,
      observedCost,
      adoptedCost: observedCost,
      adoptedSource: "observado",
      costDifference,
      costDifferencePercent,
      confidenceStatus: "somente-producao",
      confidenceLabel: "Somente producao",
      observedBreakdown,
      notes: ["A base observada existe, mas a ficha teorica ainda nao esta completa."],
    };
  }

  if (theoreticalCost !== null && observedCost !== null) {
    const compatible = Math.abs(costDifferencePercent ?? 0) <= 0.15;

    return {
      theoreticalCost,
      observedCost,
      adoptedCost: compatible ? observedCost : null,
      adoptedSource: compatible ? "observado" : "nenhum",
      costDifference,
      costDifferencePercent,
      confidenceStatus: compatible ? "compativeis" : "divergentes",
      confidenceLabel: compatible ? "Receita + producao compativeis" : "Receita + producao divergentes",
      observedBreakdown,
      notes: compatible
        ? ["A base observada ficou proxima da base teorica e pode apoiar a leitura de custo."]
        : [
            "A diferenca entre teoria e pratica passou do limite seguro de comparacao automatica.",
            "Revisar ficha tecnica, rendimento e custo de insumo antes de adotar uma base unica.",
          ],
    };
  }

  return {
    theoreticalCost,
    observedCost,
    adoptedCost: null,
    adoptedSource: "nenhum",
    costDifference: null,
    costDifferencePercent: null,
    confidenceStatus: "base-insuficiente",
    confidenceLabel: "Base insuficiente",
    observedBreakdown,
    notes: [
      "Nao ha base teorica completa nem base observada suficiente para adotar um custo com seguranca.",
      ...observedBreakdown.missingData,
    ],
  };
}
