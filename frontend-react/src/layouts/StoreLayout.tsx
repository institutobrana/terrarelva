import { ShoppingCartOutlined } from "@ant-design/icons";
import { Button, Layout, Space, Typography } from "antd";
import { Link, NavLink, Outlet } from "react-router-dom";

import type { RouteMenuItem } from "@/types/navigation";

const { Header, Content, Footer } = Layout;

type StoreLayoutProps = {
  navItems: RouteMenuItem[];
};

export function StoreLayout({ navItems }: StoreLayoutProps) {
  return (
    <Layout className="store-shell">
      <Header className="store-header">
        <Link to="/loja" className="store-brand">
          <span className="store-brand-mark">Terra Relva</span>
          <Typography.Text className="store-brand-copy">
            Produtos naturais, kits e desidratados
          </Typography.Text>
        </Link>

        <Space size="large" className="store-nav">
          {navItems.map((item) => (
            <NavLink
              key={item.key}
              to={item.key}
              className={({ isActive }) => `store-nav-link${isActive ? " active" : ""}`}
            >
              {item.label}
            </NavLink>
          ))}
          <Button type="primary" icon={<ShoppingCartOutlined />}>
            Carrinho futuro
          </Button>
        </Space>
      </Header>

      <Content className="store-content">
        <Outlet />
      </Content>

      <Footer className="store-footer">
        <Typography.Text>
          Base inicial da loja publica do Terra Relva. Checkout e integracoes entram nas proximas fases.
        </Typography.Text>
      </Footer>
    </Layout>
  );
}
