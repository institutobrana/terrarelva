import type { ReactNode } from "react";

export type RouteMenuItem = {
  key: string;
  label: string;
  icon?: ReactNode;
};

export type AdminSecondaryNavItem = {
  key: string;
  label: string;
  path: string;
  accent?: "primary" | "neutral";
};

export type AdminModuleNavigation = {
  key: string;
  label: string;
  path: string;
  icon?: ReactNode;
  description: string;
  section: "principal" | "mais";
  panelTitle?: string;
  panelKicker?: string;
  topbarItems?: AdminSecondaryNavItem[];
};
