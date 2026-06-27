import type { AppSettings, Product, Recipe, Supply } from "@/types/legacy";

export type PricingDataStatus = "completo" | "incompleto" | "sem-base";

export type PricingSettings = Pick<AppSettings, "hourRate" | "taxPercent" | "profitPercent">;

export type RecipeCompositionItem = {
  supplyName: string;
  quantity: number;
  unit: string;
  unitCost: number | null;
  totalCost: number | null;
  supplyFound: boolean;
};

export type RecipeCostBreakdown = {
  materialCost: number | null;
  laborCost: number | null;
  totalCost: number | null;
  suggestedPrice: number | null;
  marginAmount: number | null;
  calculationReady: boolean;
  missingData: string[];
  compositionItems: RecipeCompositionItem[];
  laborMinutes: number;
  taxPercent: number;
  profitPercent: number;
};

export type ProductPricingView = {
  product: Product;
  recipe: Recipe | null;
  breakdown: RecipeCostBreakdown;
  currentPrice: number;
  actualMargin: number | null;
  actualMarginPercent: number | null;
  status: PricingDataStatus;
  statusLabel: string;
  notes: string[];
};

export type PricingInput = {
  product: Product;
  recipe: Recipe | null;
  settings: PricingSettings;
  supplies: Supply[];
};

export type PricingResult = ProductPricingView;

export type PricingModuleSnapshot = {
  settings: PricingSettings;
  productViews: ProductPricingView[];
  productsWithRecipe: ProductPricingView[];
  incompleteProducts: ProductPricingView[];
  recipes: Recipe[];
  supplies: Supply[];
};

export type PricingSimulation = {
  price: number | null;
  marginAmount: number | null;
  marginPercent: number | null;
};
