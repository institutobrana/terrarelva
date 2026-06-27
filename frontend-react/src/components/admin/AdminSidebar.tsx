import { Menu, Typography } from "antd";
import { useMemo } from "react";
import { useNavigate } from "react-router-dom";

import type { AdminModuleNavigation } from "@/types/navigation";

type AdminSidebarProps = {
  collapsed: boolean;
  currentPath: string;
  modules: AdminModuleNavigation[];
};

export function AdminSidebar({ collapsed, currentPath, modules }: AdminSidebarProps) {
  const navigate = useNavigate();

  const items = useMemo(
    () =>
      modules
        .filter((module) => module.section === "principal")
        .map((module) => ({
          key: module.path,
          icon: module.icon,
          label: module.label,
        })),
    [modules],
  );

  const selectedKey =
    items.find((item) => currentPath === item.key || currentPath.startsWith(`${item.key}/`))?.key ?? "/admin/mais";

  return (
    <>
      <div className="brand-block">
        <span className="brand-mark">TR</span>
        {!collapsed && (
          <div>
            <Typography.Title level={4} className="brand-title">
              Terra Relva
            </Typography.Title>
            <Typography.Text className="brand-subtitle">Shell administrativo React</Typography.Text>
          </div>
        )}
      </div>

      {!collapsed && (
        <div className="sider-section-label">
          <Typography.Text>Navegacao principal</Typography.Text>
        </div>
      )}

      <Menu
        mode="inline"
        selectedKeys={[selectedKey]}
        items={items}
        onClick={({ key }) => navigate(String(key))}
        className="admin-menu"
      />
    </>
  );
}
