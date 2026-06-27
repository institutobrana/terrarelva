import type { RouteMenuItem } from "@/types/navigation";

export function getPageTitleFromPath(pathname: string, items: RouteMenuItem[]) {
  return items.find((item) => item.key === pathname)?.label ?? "Terra Relva";
}
