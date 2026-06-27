import { BellOutlined, MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";
import { Avatar, Button, Breadcrumb, Layout, Menu, Space, Tag, Typography } from "antd";
import { useMemo, useState } from "react";
import { Link, Outlet, useLocation, useNavigate } from "react-router-dom";

import type { RouteMenuItem } from "@/types/navigation";
import { getPageTitleFromPath } from "@/utils/navigation";

const { Header, Sider, Content } = Layout;

type AdminLayoutProps = {
  menuItems: RouteMenuItem[];
};

export function AdminLayout({ menuItems }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  const pageTitle = getPageTitleFromPath(location.pathname, menuItems);
  const selectedKeys = useMemo(() => [location.pathname], [location.pathname]);

  return (
    <Layout className="admin-shell">
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        collapsedWidth={88}
        onCollapse={setCollapsed}
        theme="light"
        width={252}
        className="admin-sider"
      >
        <div className="brand-block">
          <span className="brand-mark">TR</span>
          {!collapsed && (
            <div>
              <Typography.Title level={4} className="brand-title">
                Terra Relva
              </Typography.Title>
              <Typography.Text className="brand-subtitle">
                Novo frontend administrativo
              </Typography.Text>
            </div>
          )}
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          items={menuItems}
          onClick={({ key }) => navigate(key)}
          className="admin-menu"
        />
      </Sider>

      <Layout>
        <Header className="admin-header">
          <Space size="middle">
            <Button
              type="text"
              size="large"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed((current) => !current)}
            />
            <div>
              <Typography.Text className="page-kicker">Area interna</Typography.Text>
              <Typography.Title level={3} className="page-title">
                {pageTitle}
              </Typography.Title>
            </div>
          </Space>

          <Space size="middle">
            <Tag color="green-inverse">Fase 2</Tag>
            <Button icon={<BellOutlined />} />
            <Avatar style={{ backgroundColor: "#35513d" }}>TR</Avatar>
          </Space>
        </Header>

        <Content className="admin-content">
          <div className="page-frame">
            <Breadcrumb
              items={[
                { title: <Link to="/admin">Admin</Link> },
                { title: pageTitle },
              ]}
              className="page-breadcrumb"
            />
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
