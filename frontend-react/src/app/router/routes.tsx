import type { ReactElement } from "react";
import { createBrowserRouter, Navigate } from "react-router-dom";

import { adminModules } from "@/app/router/adminNavigation";
import { ProtectedRoute } from "@/app/router/ProtectedRoute";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StoreLayout } from "@/layouts/StoreLayout";
import { useAuth } from "@/app/hooks/useAuth";
import { CaixaPage } from "@/pages/admin/CaixaPage";
import { CadastroFornecedoresPage } from "@/pages/admin/CadastroFornecedoresPage";
import { ClientesPage } from "@/pages/admin/ClientesPage";
import { ConfiguracoesPage } from "@/pages/admin/ConfiguracoesPage";
import { ContasBancariasPage } from "@/pages/admin/ContasBancariasPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { EstoquePage } from "@/pages/admin/EstoquePage";
import { FluxoCaixaPage } from "@/pages/admin/FluxoCaixaPage";
import { PrecificacaoPage } from "@/pages/admin/PrecificacaoPage";
import { ProducaoPage } from "@/pages/admin/ProducaoPage";
import { ProdutosPage } from "@/pages/admin/ProdutosPage";
import { PlanoContasPage } from "@/pages/admin/PlanoContasPage";
import { TabelasAuxiliaresPage } from "@/pages/admin/TabelasAuxiliaresPage";
import { UsuariosSistemaPage } from "@/pages/admin/UsuariosSistemaPage";
import { VendasPage } from "@/pages/admin/VendasPage";
import { AdminPlaceholderPage } from "@/pages/admin/AdminPlaceholderPage";
import { LoginPage } from "@/pages/auth/LoginPage";
import { CatalogoPage } from "@/pages/loja/CatalogoPage";
import { LojaHomePage } from "@/pages/loja/LojaHomePage";
import type { RouteMenuItem } from "@/types/navigation";

function AdminOnlyElement({ children }: { children: ReactElement }) {
  const { user } = useAuth();

  if (user?.role !== "admin") {
    return <Navigate to="/admin/configuracoes" replace />;
  }

  return children;
}

export const storeNavigationItems: RouteMenuItem[] = [
  { key: "/loja", label: "Inicio" },
  { key: "/loja/catalogo", label: "Catalogo" },
];

const adminRoutes = [
  { index: true, element: <Navigate to="/admin/hoje" replace /> },
  { path: "dashboard", element: <Navigate to="/admin/hoje" replace /> },
  { path: "hoje", element: <DashboardPage /> },
  {
    path: "hoje/agenda",
    element: (
      <AdminPlaceholderPage
        eyebrow="Visao operacional"
        title="Hoje - Agenda"
        description="Subtela preparada para agenda do dia, entregas combinadas e prioridades operacionais."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Hoje" },
          { label: "Funcao", value: "Planejamento diario" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Topo contextual ativo", "Pronta para widgets diarios"]}
      />
    ),
  },
  {
    path: "hoje/alertas",
    element: (
      <AdminPlaceholderPage
        eyebrow="Visao operacional"
        title="Hoje - Alertas"
        description="Espaco reservado para alertas de estoque, producao, entregas e recebimentos."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Hoje" },
          { label: "Funcao", value: "Monitoramento" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para cards prioritarios", "Mantem o legado isolado"]}
      />
    ),
  },
  { path: "produtos", element: <ProdutosPage /> },
  {
    path: "produtos/ativos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de produtos"
        title="Produtos - Ativos"
        description="Filtro visual reservado para itens ativos, mantendo o shell contextual coerente."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Produtos" },
          { label: "Recorte", value: "Ativos" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Pode virar tabela filtrada", "Rota propria ja definida"]}
      />
    ),
  },
  {
    path: "produtos/inativos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de produtos"
        title="Produtos - Inativos"
        description="Base pronta para revisar itens pausados ou fora de linha sem mexer no legado."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Produtos" },
          { label: "Recorte", value: "Inativos" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Filtro futuro bem delimitado", "Mantem a navegacao clara"]}
      />
    ),
  },
  {
    path: "produtos/estoque-baixo",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de produtos"
        title="Produtos - Estoque baixo"
        description="Rota reservada para itens com ruptura ou risco de ruptura."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Produtos" },
          { label: "Recorte", value: "Estoque baixo" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Pode receber leitura real depois", "Conecta produtos com estoque"]}
      />
    ),
  },
  {
    path: "produtos/novo-produto",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de produtos"
        title="Produtos - Novo produto"
        description="Entrada futura para cadastro estruturado no React, ainda sem habilitar gravacao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Produtos" },
          { label: "Recorte", value: "Cadastro" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Prepara drawer ou form depois", "Sem alterar storage atual"]}
      />
    ),
  },
  { path: "estoque", element: <EstoquePage /> },
  {
    path: "estoque/movimentacoes",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de estoque"
        title="Estoque - Movimentacoes"
        description="Area destinada a entradas, saidas e rastreio de variacoes de saldo."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Estoque" },
          { label: "Recorte", value: "Movimentacoes" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para tabela cronologica", "Sem tocar no dominio ainda"]}
      />
    ),
  },
  {
    path: "estoque/reposicao",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de estoque"
        title="Estoque - Reposicao"
        description="Espaco preparado para priorizacao de compra e producao a partir do estoque."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Estoque" },
          { label: "Recorte", value: "Reposicao" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Une estoque, compras e producao", "Casco pronto para alertas"]}
      />
    ),
  },
  { path: "vendas", element: <VendasPage /> },
  {
    path: "vendas/orcamentos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de vendas"
        title="Vendas - Orcamentos"
        description="Rota reservada para propostas, atendimento e conversao comercial."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Vendas" },
          { label: "Recorte", value: "Orcamentos" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Ajuda a separar fluxo comercial", "Pronta para cards e lista"]}
      />
    ),
  },
  {
    path: "vendas/pedido-rapido",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de vendas"
        title="Vendas - Pedido rapido"
        description="Entrada futura para venda expressa sem comprometer a etapa segura da migracao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Vendas" },
          { label: "Recorte", value: "Pedido rapido" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para builder simplificado", "Sem impactar o legado"]}
      />
    ),
  },
  {
    path: "vendas/recebimentos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de vendas"
        title="Vendas - Recebimentos"
        description="Espaco contextual para pagamentos pendentes e acompanhamento comercial."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Vendas" },
          { label: "Recorte", value: "Recebimentos" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Conversa com caixa no futuro", "Estrutura visual ja pronta"]}
      />
    ),
  },
  { path: "producao", element: <ProducaoPage /> },
  { path: "producao/recentes", element: <ProducaoPage view="recent" /> },
  { path: "producao/lotes", element: <ProducaoPage view="lots" /> },
  { path: "producao/consumo-insumos", element: <ProducaoPage view="supplies" /> },
  { path: "producao/custos", element: <ProducaoPage view="costs" /> },
  { path: "producao/validades", element: <ProducaoPage view="expiry" /> },
  { path: "clientes", element: <ClientesPage /> },
  { path: "cadastro/clientes", element: <ClientesPage /> },
  { path: "cadastro/fornecedores", element: <CadastroFornecedoresPage /> },
  {
    path: "clientes/com-telefone",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de clientes"
        title="Clientes - Com telefone"
        description="Recorte pronto para contato rapido e relacionamento ativo com clientes."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Clientes" },
          { label: "Recorte", value: "Com telefone" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Suporta futuras acoes comerciais", "Mantem a navegacao contextual"]}
      />
    ),
  },
  {
    path: "clientes/ultima-compra",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de clientes"
        title="Clientes - Ultima compra"
        description="Entrada preparada para recorrencia e reativacao com base na compra mais recente."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Clientes" },
          { label: "Recorte", value: "Ultima compra" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Apoia CRM futuro", "Nao depende de nova persistencia ainda"]}
      />
    ),
  },
  {
    path: "clientes/favoritos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de clientes"
        title="Clientes - Favoritos"
        description="Espaco reservado para destacar clientes recorrentes e de maior valor."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Clientes" },
          { label: "Recorte", value: "Favoritos" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Ajuda a separar segmentos", "Casco pronto para listas filtradas"]}
      />
    ),
  },
  { path: "financeiro", element: <CaixaPage /> },
  {
    path: "financeiro/saidas",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de caixa"
        title="Financeiro - Saidas"
        description="Recorte reservado para despesas, retiradas e compromissos financeiros."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Financeiro" },
          { label: "Recorte", value: "Saidas" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Pode virar tabela de lancamentos", "Sem conciliacao real nesta fase"]}
      />
    ),
  },
  {
    path: "financeiro/contas",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de caixa"
        title="Financeiro - Contas"
        description="Rota prevista para contas, centros financeiros e separacao por origem."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Financeiro" },
          { label: "Recorte", value: "Contas" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para multiplas contas", "Mantem o shell coeso"]}
      />
    ),
  },
  {
    path: "financeiro/recebiveis",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de caixa"
        title="Financeiro - Recebiveis"
        description="Espaco pronto para acompanhar pendencias, parcelamentos e valores a receber."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Financeiro" },
          { label: "Recorte", value: "Recebiveis" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Conecta vendas e caixa", "Sem tocar na logica existente"]}
      />
    ),
  },
  {
    path: "financeiro/fluxo-de-caixa",
    element: <FluxoCaixaPage />,
  },
  {
    path: "financeiro/fechamento",
    element: (
      <AdminPlaceholderPage
        eyebrow="Subtela de caixa"
        title="Financeiro - Fechamento"
        description="Area contextual para conferencia de periodo e resumo financeiro consolidado."
        tag="Placeholder seguro"
        metrics={[
          { label: "Modulo", value: "Financeiro" },
          { label: "Recorte", value: "Fechamento" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para exportacoes futuras", "Segura para evoluir depois"]}
      />
    ),
  },
  {
    path: "mais",
    element: (
      <AdminPlaceholderPage
        eyebrow="Navegacao secundaria"
        title="Mais"
        description="Pagina-ponte para os modulos complementares do admin, mantendo a simplicidade da operacao atual."
        tag="Agrupamento principal definido"
        metrics={[
          { label: "Grupo", value: "Modulos complementares" },
          { label: "Origem", value: "Baseado no legado" },
          { label: "Estado", value: "Shell ativo" },
        ]}
        bullets={[
          "Precificacao, pedidos, fornecedores e relatorios ficam agrupados aqui",
          "Configuracoes e loja seguem acessiveis pelo topo",
        ]}
      />
    ),
  },
  { path: "precificacao", element: <PrecificacaoPage /> },
  { path: "precificacao/produtos-com-receita", element: <PrecificacaoPage view="with-recipe" /> },
  { path: "precificacao/produtos-incompletos", element: <PrecificacaoPage view="incomplete" /> },
  { path: "precificacao/parametros", element: <PrecificacaoPage view="parameters" /> },
  { path: "precificacao/simulacao", element: <PrecificacaoPage view="simulation" /> },
  {
    path: "pedidos",
    element: (
      <AdminPlaceholderPage
        eyebrow="Modulo futuro"
        title="Pedidos"
        description="Base para acompanhamento de pedidos, entregas e pos-venda sem misturar com o legado agora."
        tag="Placeholder seguro"
        metrics={[
          { label: "Dependencias", value: "Vendas + clientes" },
          { label: "Escopo", value: "Pedidos e entregas" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa separacao de dominio", "Pode receber timeline depois"]}
      />
    ),
  },
  {
    path: "fornecedores",
    element: <CadastroFornecedoresPage />,
  },
  {
    path: "relatorios",
    element: (
      <AdminPlaceholderPage
        eyebrow="Modulo futuro"
        title="Relatorios"
        description="Entrada reservada para consolidar indicadores operacionais, comerciais e financeiros."
        tag="Placeholder seguro"
        metrics={[
          { label: "Dependencias", value: "Todos os modulos" },
          { label: "Escopo", value: "Analise e exportacao" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para painels futuros", "Nao exige banco novo nesta fase"]}
      />
    ),
  },
  { path: "configuracoes", element: <ConfiguracoesPage /> },
  {
    path: "configuracoes/usuarios-sistema",
    element: (
      <AdminOnlyElement>
        <UsuariosSistemaPage />
      </AdminOnlyElement>
    ),
  },
  {
    path: "configuracoes/perfis-usuario",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Perfis de usuario"
        description="Espaco reservado para permissoes, niveis de acesso e governanca da operacao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Perfis" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Prepara regras por perfil", "Sem expandir auth nesta rodada"]}
      />
    ),
  },
  {
    path: "configuracoes/tabelas-auxiliares",
    element: <TabelasAuxiliaresPage />,
  },
  {
    path: "configuracoes/plano-contas",
    element: <PlanoContasPage />,
  },
  {
    path: "configuracoes/agendas",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Agendas"
        description="Espaco futuro para parametrizacao de agendas, disponibilidade e regras de atendimento."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Agendas" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Conecta operacao e atendimento", "Base pronta para evolucao posterior"]}
      />
    ),
  },
  {
    path: "configuracoes/questionarios-anamnese",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Questionarios de anamnese"
        description="Area reservada para formularios clinicos e estruturas de coleta de informacao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Questionarios" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Base pronta para modelos de anamnese", "Sem ativar regra clinica agora"]}
      />
    ),
  },
  {
    path: "configuracoes/unidades-atendimento",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Unidades de atendimento"
        description="Entrada futura para filiais, locais de atendimento e estruturas fisicas da operacao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Unidades" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Prepara multiplas unidades", "Mantem o shell coerente"]}
      />
    ),
  },
  {
    path: "configuracoes/campos-livres",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Campos livres"
        description="Espaco preparado para parametrizar campos adicionais sem refatorar o shell atual."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Customizacao" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Boa base para extensoes controladas", "Sem modelagem nova nesta rodada"]}
      />
    ),
  },
  {
    path: "configuracoes/taxas-cobranca",
    element: (
      <AdminPlaceholderPage
        eyebrow="Configuracao interna"
        title="Taxas de cobranca"
        description="Area futura para definir taxas, comissoes e parametros de cobranca da operacao."
        tag="Placeholder seguro"
        metrics={[
          { label: "Area", value: "Configuracao" },
          { label: "Recorte", value: "Taxas" },
          { label: "Estado", value: "Sem escrita" },
        ]}
        bullets={["Prepara governanca de cobranca", "Sem regra financeira ativa agora"]}
      />
    ),
  },
  {
    path: "configuracoes/contas-bancarias",
    element: <ContasBancariasPage />,
  },
];

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  {
    element: <ProtectedRoute />,
    children: [
      {
        path: "/admin",
        element: <AdminLayout modules={adminModules} />,
        children: adminRoutes,
      },
    ],
  },
  {
    path: "/auth/login",
    element: <LoginPage />,
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
