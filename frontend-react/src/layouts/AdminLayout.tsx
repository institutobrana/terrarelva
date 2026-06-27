import { Layout } from "antd";
import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";

import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { AdminTopbar } from "@/components/admin/AdminTopbar";
import type { AdminModuleNavigation } from "@/types/navigation";
import { getAdminModuleFromPath } from "@/utils/navigation";

const { Header, Sider, Content } = Layout;

type AdminLayoutProps = {
  modules: AdminModuleNavigation[];
};

export function AdminLayout({ modules }: AdminLayoutProps) {
  const [collapsed, setCollapsed] = useState(false);
  const location = useLocation();
  const currentModule = getAdminModuleFromPath(location.pathname, modules);

  return (
    <Layout className="admin-shell">
      <Sider
        breakpoint="lg"
        collapsed={collapsed}
        collapsedWidth={88}
        onCollapse={setCollapsed}
        theme="light"
        width={280}
        className="admin-sider"
      >
        <AdminSidebar collapsed={collapsed} currentPath={location.pathname} modules={modules} />
      </Sider>

      <Layout className="admin-main-shell">
        <Header className="admin-layout-header">
          <AdminTopbar
            collapsed={collapsed}
            currentPath={location.pathname}
            currentModule={currentModule}
            onToggleSidebar={() => setCollapsed((current) => !current)}
          />
        </Header>
        <Content className="admin-content">
          <div className="page-frame">
            <Outlet />
          </div>
        </Content>
      </Layout>
    </Layout>
  );
}
