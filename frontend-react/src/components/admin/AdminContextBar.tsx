import { Breadcrumb, Input, Tag, Typography } from "antd";
import { SearchOutlined } from "@ant-design/icons";
import { Link } from "react-router-dom";

import type { AdminModuleNavigation } from "@/types/navigation";

type AdminContextBarProps = {
  currentPath: string;
  currentModule: AdminModuleNavigation | null;
};

export function AdminContextBar({ currentPath, currentModule }: AdminContextBarProps) {
  const topbarItems = currentModule?.topbarItems ?? [];
  const currentTopbarItem =
    topbarItems.find((item) => currentPath === item.path || currentPath.startsWith(`${item.path}/`)) ?? null;

  return (
    <div className="admin-context-shell">
      <div className="admin-context-meta">
        <Breadcrumb
          items={[
            { title: <Link to="/admin">Admin</Link> },
            ...(currentModule ? [{ title: currentModule.label }] : []),
            ...(currentTopbarItem && currentTopbarItem.path !== currentModule?.path
              ? [{ title: currentTopbarItem.label }]
              : []),
          ]}
          className="page-breadcrumb"
        />
        <Typography.Text className="toolbar-description">
          {currentModule?.description ?? "Base estrutural do novo shell administrativo."}
        </Typography.Text>
      </div>

      <div className="admin-context-actions">
        <Input
          className="admin-search"
          size="large"
          prefix={<SearchOutlined />}
          placeholder="Buscar modulo, produto ou atalho"
          disabled
        />
        <Tag className="admin-context-tag">Busca futura</Tag>
      </div>

      <div className="toolbar-tabs" role="tablist" aria-label="Navegacao secundaria do modulo">
        {topbarItems.map((item) => {
          const isActive = currentPath === item.path || currentPath.startsWith(`${item.path}/`);

          return (
            <Link
              key={item.key}
              to={item.path}
              className={`toolbar-tab${isActive ? " active" : ""}${item.accent === "primary" ? " primary" : ""}`}
            >
              {item.label}
            </Link>
          );
        })}
      </div>
    </div>
  );
}
