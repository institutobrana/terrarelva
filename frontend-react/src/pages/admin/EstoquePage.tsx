import { InboxOutlined, RiseOutlined, WarningOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function EstoquePage() {
  return (
    <AdminPageTemplate
      eyebrow="Modulo futuro"
      title="Estoque"
      description="Shell inicial para movimentos de produtos e insumos, com espaco para alertas e conciliacao."
      tag="Nenhuma regra portada ainda"
      metrics={[
        { label: "Abrangencia", value: "Produtos + insumos" },
        { label: "Risco atual", value: "Alta dispersao no legado" },
        { label: "Meta", value: "Centralizar regras" },
      ]}
      cards={[
        {
          title: "Movimentacoes",
          description: "Recebera entradas, saidas e integracao com compras, producao e vendas.",
          bullets: ["Sem tocar no app.js agora", "Preparado para formulários e historico"],
          icon: <InboxOutlined />,
        },
        {
          title: "Alertas",
          description: "Area futura para estoque minimo, ruptura e necessidade de reposicao.",
          bullets: ["KPIs ainda nao conectados", "Visual pronto para cards e listas"],
          icon: <WarningOutlined />,
        },
        {
          title: "Consolidacao",
          description: "A migracao vai extrair a regra de estoque espalhada para um modulo unico.",
          bullets: ["Primeiro a casca", "Depois o dominio"],
          icon: <RiseOutlined />,
        },
      ]}
    />
  );
}
