import type { Production, Product, Recipe, StockMovement, Supply } from "@/types/legacy";

export type ProductionStatus = "completo" | "incompleto" | "sem-base";

export type ProductionRecipeUsage = {
  recipe: Recipe | null;
  linkedProducts: Product[];
  recipeItemsCount: number;
};

export type ProductionCostBreakdown = {
  sourcePaidValue: number;
  costPerGram: number | null;
  estimatedMaterialCost: number | null;
  estimatedLaborCost: number | null;
  estimatedTotalCost: number | null;
  yieldPercent: number | null;
  calculationReady: boolean;
  missingData: string[];
};

export type ProductionBatchView = {
  record: Production;
  outputSupply: Supply | null;
  recipeUsage: ProductionRecipeUsage;
  stockEntries: StockMovement[];
  estimatedPackCount: number | null;
  status: ProductionStatus;
  statusLabel: string;
  breakdown: ProductionCostBreakdown;
  notes: string[];
};

export type ProductionSummary = {
  totalProductions: number;
  totalFinalWeight: number;
  totalEstimatedCost: number | null;
  recentProductions: number;
  incompleteProductions: number;
};

export type ProductionModuleSnapshot = {
  batches: ProductionBatchView[];
  recentBatches: ProductionBatchView[];
  incompleteBatches: ProductionBatchView[];
  summary: ProductionSummary;
};
