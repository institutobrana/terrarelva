import {
  AppstoreOutlined,
  DollarCircleOutlined,
  HomeOutlined,
  InboxOutlined,
  SettingOutlined,
  ShopOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { AdminLayout } from "@/layouts/AdminLayout";
import { StoreLayout } from "@/layouts/StoreLayout";
import { CaixaPage } from "@/pages/admin/CaixaPage";
import { ClientesPage } from "@/pages/admin/ClientesPage";
import { ConfiguracoesPage } from "@/pages/admin/ConfiguracoesPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { EstoquePage } from "@/pages/admin/EstoquePage";
import { ProdutosPage } from "@/pages/admin/ProdutosPage";
import { VendasPage } from "@/pages/admin/VendasPage";
import { CatalogoPage } from "@/pages/loja/CatalogoPage";
import { LojaHomePage } from "@/pages/loja/LojaHomePage";
import type { RouteMenuItem } from "@/types/navigation";

export const adminNavigationItems: RouteMenuItem[] = [
  { key: "/admin/dashboard", label: "Dashboard", icon: <HomeOutlined /> },
  { key: "/admin/produtos", label: "Produtos", icon: <AppstoreOutlined /> },
  { key: "/admin/estoque", label: "Estoque", icon: <InboxOutlined /> },
  { key: "/admin/vendas", label: "Vendas", icon: <ShopOutlined /> },
  { key: "/admin/caixa", label: "Caixa", icon: <DollarCircleOutlined /> },
  { key: "/admin/clientes", label: "Clientes", icon: <TeamOutlined /> },
  { key: "/admin/configuracoes", label: "Configuracoes", icon: <SettingOutlined /> },
];

export const storeNavigationItems: RouteMenuItem[] = [
  { key: "/loja", label: "Inicio" },
  { key: "/loja/catalogo", label: "Catalogo" },
];

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin",
    element: <AdminLayout menuItems={adminNavigationItems} />,
    children: [
      { index: true, element: <Navigate to="/admin/dashboard" replace /> },
      { path: "dashboard", element: <DashboardPage /> },
      { path: "produtos", element: <ProdutosPage /> },
      { path: "estoque", element: <EstoquePage /> },
      { path: "vendas", element: <VendasPage /> },
      { path: "caixa", element: <CaixaPage /> },
      { path: "clientes", element: <ClientesPage /> },
      { path: "configuracoes", element: <ConfiguracoesPage /> },
    ],
  },
  {
    path: "/loja",
    element: <StoreLayout navItems={storeNavigationItems} />,
    children: [
      { index: true, element: <LojaHomePage /> },
      { path: "catalogo", element: <CatalogoPage /> },
    ],
  },
]);
