import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Breadcrumb, Button, Space, Tag, Typography } from "antd";
import { Link } from "react-router-dom";

import type { AdminModuleNavigation } from "@/types/navigation";

type AdminTopbarProps = {
  collapsed: boolean;
  currentPath: string;
  currentModule: AdminModuleNavigation | null;
  onToggleSidebar: () => void;
};

export function AdminTopbar({ collapsed, currentPath, currentModule, onToggleSidebar }: AdminTopbarProps) {
  const topbarItems = currentModule?.topbarItems ?? [];
  const currentTopbarItem =
    topbarItems.find((item) => currentPath === item.path || currentPath.startsWith(`${item.path}/`)) ?? null;

  return (
    <div className="admin-topbar-shell">
      <div className="admin-header">
        <Space size="middle">
          <Button
            type="text"
            size="large"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
          />
          <div>
            <Typography.Text className="page-kicker">Area administrativa</Typography.Text>
            <Typography.Title level={3} className="page-title">
              {currentModule?.label ?? "Terra Relva"}
            </Typography.Title>
          </div>
        </Space>

        <Space size="middle">
          <Tag color="green-inverse">Fase 2</Tag>
          <Button icon={<BellOutlined />} />
          <Avatar style={{ backgroundColor: "#1f4d3c" }}>TR</Avatar>
        </Space>
      </div>

      <div className="admin-toolbar">
        <div>
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
    </div>
  );
}
