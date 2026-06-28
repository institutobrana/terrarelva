import { AppstoreOutlined, BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Button, Space, Tag, Typography } from "antd";

import type { AdminModuleNavigation } from "@/types/navigation";
import terraRelvaLogo from "../../../../assets/LOGO_TERRA_RELVA.png";

type AdminTopbarProps = {
  collapsed: boolean;
  currentPath: string;
  currentModule: AdminModuleNavigation | null;
  onToggleSidebar: () => void;
};

export function AdminTopbar({ collapsed, currentPath, currentModule, onToggleSidebar }: AdminTopbarProps) {
  void currentPath;

  return (
    <div className="admin-header-shell">
      <div className="admin-header-left">
        <Space size="middle" align="center">
          <Button
            type="text"
            size="large"
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={onToggleSidebar}
          />
          <div className="admin-system-brand">
            <img src={terraRelvaLogo} alt="Terra Relva" className="admin-header-brand-logo" />
            <div>
              <Typography.Text className="page-kicker">Sistema Terra Relva</Typography.Text>
              <Typography.Title level={3} className="page-title">
                {currentModule?.label ?? "Terra Relva"}
              </Typography.Title>
            </div>
          </div>
        </Space>
      </div>

      <div className="admin-header-right">
        <Space size="middle" align="center">
          <Tag color="green-inverse">Fase 2</Tag>
          <Button icon={<AppstoreOutlined />} />
          <Button icon={<BellOutlined />} />
          <div className="admin-user-block">
            <Avatar style={{ backgroundColor: "#36513d" }}>TR</Avatar>
            <div>
              <Typography.Text className="admin-user-name">Terra Relva</Typography.Text>
              <Typography.Text className="admin-user-role">Painel administrativo</Typography.Text>
            </div>
          </div>
        </Space>
      </div>
    </div>
  );
}
