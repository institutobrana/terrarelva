import { MessageOutlined, SolutionOutlined, TeamOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function ClientesPage() {
  return (
    <AdminPageTemplate
      eyebrow="Modulo futuro"
      title="Clientes"
      description="Espaco reservado para cadastro, historico de compra, recorrencia e relacionamento."
      tag="Preparado para migracao incremental"
      metrics={[
        { label: "Foco", value: "Cadastro + recorrencia" },
        { label: "Origem futura", value: "localStorage legado" },
        { label: "Status", value: "Sem logica portada" },
      ]}
      cards={[
        {
          title: "Cadastro",
          description: "Recebera listagem, busca e cadastro estruturado de clientes.",
          bullets: ["Nada foi movido do legado", "Layout pronto para tabela e drawer"],
          icon: <TeamOutlined />,
        },
        {
          title: "Historico",
          description: "Espaco para compras anteriores, preferidos e ultimo contato.",
          bullets: ["Sem consultas reais nesta fase", "Sem acoplamento com vendas ainda"],
          icon: <SolutionOutlined />,
        },
        {
          title: "Relacionamento",
          description: "Area futura para WhatsApp, recompra e clientes inativos.",
          bullets: ["Casca pronta para automacoes futuras", "Nao interfere no legado"],
          icon: <MessageOutlined />,
        },
      ]}
    />
  );
}
