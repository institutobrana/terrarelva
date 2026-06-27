import { createBrowserRouter, Navigate } from "react-router-dom";

import { adminModules } from "@/app/router/adminNavigation";
import { AdminLayout } from "@/layouts/AdminLayout";
import { StoreLayout } from "@/layouts/StoreLayout";
import { CaixaPage } from "@/pages/admin/CaixaPage";
import { ClientesPage } from "@/pages/admin/ClientesPage";
import { ConfiguracoesPage } from "@/pages/admin/ConfiguracoesPage";
import { DashboardPage } from "@/pages/admin/DashboardPage";
import { EstoquePage } from "@/pages/admin/EstoquePage";
import { ProdutosPage } from "@/pages/admin/ProdutosPage";
import { VendasPage } from "@/pages/admin/VendasPage";
import { AdminPlaceholderPage } from "@/pages/admin/AdminPlaceholderPage";
import { CatalogoPage } from "@/pages/loja/CatalogoPage";
import { LojaHomePage } from "@/pages/loja/LojaHomePage";
import type { RouteMenuItem } from "@/types/navigation";

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
        title="Hoje · Agenda"
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
        title="Hoje · Alertas"
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
        title="Produtos · Ativos"
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
        title="Produtos · Inativos"
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
        title="Produtos · Estoque baixo"
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
        title="Produtos · Novo produto"
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
        title="Estoque · Movimentacoes"
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
        title="Estoque · Reposicao"
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
        title="Vendas · Orcamentos"
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
        title="Vendas · Pedido rapido"
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
        title="Vendas · Recebimentos"
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
  { path: "producao", element: <AdminPlaceholderPage eyebrow="Modulo futuro" title="Producao" description="Modulo-base para consolidar lotes, custos, validades e consumo de insumos no novo admin." tag="Casco pronto para o dominio" metrics={[{ label: "Dependencias", value: "Estoque + precificacao" }, { label: "Operacao", value: "Lotes e custos" }, { label: "Estado", value: "Placeholder" }]} bullets={["Rota principal adicionada ao shell", "Barra superior contextual ativa"]} /> },
  { path: "producao/nova-producao", element: <AdminPlaceholderPage eyebrow="Subtela de producao" title="Producao · Nova producao" description="Area futura para abrir ordens ou registros de producao com seguranca." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Producao" }, { label: "Recorte", value: "Nova producao" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa base para formulario guiado", "Sem acoplar persistencia agora"]} /> },
  { path: "producao/lotes", element: <AdminPlaceholderPage eyebrow="Subtela de producao" title="Producao · Lotes" description="Espaco reservado para acompanhamento de lotes e rastreabilidade." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Producao" }, { label: "Recorte", value: "Lotes" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Prepara rastreabilidade", "Pode receber tabela e timeline"]} /> },
  { path: "producao/consumo-insumos", element: <AdminPlaceholderPage eyebrow="Subtela de producao" title="Producao · Consumo de insumos" description="Rota pensada para conciliar receitas, insumos e baixa de estoque." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Producao" }, { label: "Recorte", value: "Consumo de insumos" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Aproxima o dominio real", "Mantem a fase segura"]} /> },
  { path: "producao/custos", element: <AdminPlaceholderPage eyebrow="Subtela de producao" title="Producao · Custos" description="Area reservada para custo por lote, custo por unidade e apoio a precificacao." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Producao" }, { label: "Recorte", value: "Custos" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Conecta com futura modelagem", "Sem ativar regras financeiras agora"]} /> },
  { path: "producao/validades", element: <AdminPlaceholderPage eyebrow="Subtela de producao" title="Producao · Validades" description="Espaco para alertas, vencimentos e rotacao de produtos produzidos." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Producao" }, { label: "Recorte", value: "Validades" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa base para monitoramento", "Alinha operacao e qualidade"]} /> },
  { path: "clientes", element: <ClientesPage /> },
  { path: "clientes/com-telefone", element: <AdminPlaceholderPage eyebrow="Subtela de clientes" title="Clientes · Com telefone" description="Recorte pronto para contato rapido e relacionamento ativo com clientes." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Clientes" }, { label: "Recorte", value: "Com telefone" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Suporta futuras acoes comerciais", "Mantem a navegacao contextual"]} /> },
  { path: "clientes/ultima-compra", element: <AdminPlaceholderPage eyebrow="Subtela de clientes" title="Clientes · Ultima compra" description="Entrada preparada para recorrencia e reativacao com base na compra mais recente." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Clientes" }, { label: "Recorte", value: "Ultima compra" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Apoia CRM futuro", "Nao depende de nova persistencia ainda"]} /> },
  { path: "clientes/favoritos", element: <AdminPlaceholderPage eyebrow="Subtela de clientes" title="Clientes · Favoritos" description="Espaco reservado para destacar clientes recorrentes e de maior valor." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Clientes" }, { label: "Recorte", value: "Favoritos" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Ajuda a separar segmentos", "Casco pronto para listas filtradas"]} /> },
  { path: "caixa", element: <CaixaPage /> },
  { path: "caixa/saidas", element: <AdminPlaceholderPage eyebrow="Subtela de caixa" title="Caixa · Saidas" description="Recorte reservado para despesas, retiradas e compromissos financeiros." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Caixa" }, { label: "Recorte", value: "Saidas" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Pode virar tabela de lancamentos", "Sem conciliacao real nesta fase"]} /> },
  { path: "caixa/contas", element: <AdminPlaceholderPage eyebrow="Subtela de caixa" title="Caixa · Contas" description="Rota prevista para contas, centros financeiros e separacao por origem." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Caixa" }, { label: "Recorte", value: "Contas" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa base para multiplas contas", "Mantem o shell coeso"]} /> },
  { path: "caixa/recebiveis", element: <AdminPlaceholderPage eyebrow="Subtela de caixa" title="Caixa · Recebiveis" description="Espaco pronto para acompanhar pendencias, parcelamentos e valores a receber." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Caixa" }, { label: "Recorte", value: "Recebiveis" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Conecta vendas e caixa", "Sem tocar na logica existente"]} /> },
  { path: "caixa/fechamento", element: <AdminPlaceholderPage eyebrow="Subtela de caixa" title="Caixa · Fechamento" description="Area contextual para conferencia de periodo e resumo financeiro consolidado." tag="Placeholder seguro" metrics={[{ label: "Modulo", value: "Caixa" }, { label: "Recorte", value: "Fechamento" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa base para exportacoes futuras", "Segura para evoluir depois"]} /> },
  { path: "mais", element: <AdminPlaceholderPage eyebrow="Navegacao secundaria" title="Mais" description="Pagina-ponte para os modulos complementares do admin, mantendo a simplicidade da operacao atual." tag="Agrupamento principal definido" metrics={[{ label: "Grupo", value: "Modulos complementares" }, { label: "Origem", value: "Baseado no legado" }, { label: "Estado", value: "Shell ativo" }]} bullets={["Precificacao, pedidos, fornecedores e relatorios ficam agrupados aqui", "Configuracoes e loja seguem acessiveis pelo topo"]} /> },
  { path: "precificacao", element: <AdminPlaceholderPage eyebrow="Modulo futuro" title="Precificacao" description="Espaco para custo, margem, imposto e apoio a formacao de preco no novo frontend." tag="Placeholder seguro" metrics={[{ label: "Dependencias", value: "Produtos + producao" }, { label: "Escopo", value: "Custos e margem" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Rota propria criada", "Pronto para futura modelagem"]} /> },
  { path: "pedidos", element: <AdminPlaceholderPage eyebrow="Modulo futuro" title="Pedidos" description="Base para acompanhamento de pedidos, entregas e pos-venda sem misturar com o legado agora." tag="Placeholder seguro" metrics={[{ label: "Dependencias", value: "Vendas + clientes" }, { label: "Escopo", value: "Pedidos e entregas" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa separacao de dominio", "Pode receber timeline depois"]} /> },
  { path: "fornecedores", element: <AdminPlaceholderPage eyebrow="Modulo futuro" title="Fornecedores" description="Tela-base para abastecimento, compras e parceiros da operacao." tag="Placeholder seguro" metrics={[{ label: "Dependencias", value: "Estoque + compras" }, { label: "Escopo", value: "Fornecedores" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Ajuda a preparar compras estruturadas", "Mantem navegacao completa"]} /> },
  { path: "relatorios", element: <AdminPlaceholderPage eyebrow="Modulo futuro" title="Relatorios" description="Entrada reservada para consolidar indicadores operacionais, comerciais e financeiros." tag="Placeholder seguro" metrics={[{ label: "Dependencias", value: "Todos os modulos" }, { label: "Escopo", value: "Analise e exportacao" }, { label: "Estado", value: "Sem escrita" }]} bullets={["Boa base para painels futuros", "Nao exige banco novo nesta fase"]} /> },
  { path: "configuracoes", element: <ConfiguracoesPage /> },
];

export const appRouter = createBrowserRouter([
  {
    path: "/",
    element: <Navigate to="/admin" replace />,
  },
  {
    path: "/admin",
    element: <AdminLayout modules={adminModules} />,
    children: adminRoutes,
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
