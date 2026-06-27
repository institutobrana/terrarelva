import type { AdminModuleNavigation } from "@/types/navigation";

export function getAdminModuleFromPath(pathname: string, modules: AdminModuleNavigation[]) {
  const sorted = [...modules].sort((left, right) => right.path.length - left.path.length);

  return sorted.find((module) => pathname === module.path || pathname.startsWith(`${module.path}/`)) ?? null;
}

export function getPageTitleFromPath(pathname: string, modules: AdminModuleNavigation[]) {
  const currentModule = getAdminModuleFromPath(pathname, modules);

  if (!currentModule) {
    return "Terra Relva";
  }

  const currentTopbarItem = currentModule.topbarItems?.find(
    (item) => pathname === item.path || pathname.startsWith(`${item.path}/`),
  );

  return currentTopbarItem ? `${currentModule.label} · ${currentTopbarItem.label}` : currentModule.label;
}
