import { BankOutlined, FileDoneOutlined, WalletOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function CaixaPage() {
  return (
    <AdminPageTemplate
      eyebrow="Modulo futuro"
      title="Caixa"
      description="Estrutura inicial para saldo, entradas, saidas e fechamentos por conta."
      tag="Sem conciliacao migrada"
      metrics={[
        { label: "Fontes futuras", value: "Vendas + compras + lancamentos" },
        { label: "Conta atual", value: "Loja / recebiveis" },
        { label: "Etapa", value: "Placeholder" },
      ]}
      cards={[
        {
          title: "Resumo financeiro",
          description: "Area prevista para saldo atual, recebiveis e movimentacao recente.",
          bullets: ["Ainda sem leitura real", "Shell pronto para cards financeiros"],
          icon: <WalletOutlined />,
        },
        {
          title: "Lancamentos manuais",
          description: "Recebera formulários para entradas e saidas avulsas no modulo migrado.",
          bullets: ["Sem alterar o caixa legado", "Base preparada para formularios"],
          icon: <BankOutlined />,
        },
        {
          title: "Fechamento",
          description: "Espaco para conferencia mensal e exportacoes futuras.",
          bullets: ["Exportacao segue no legado por enquanto", "Nova area ja nasce com rota propria"],
          icon: <FileDoneOutlined />,
        },
      ]}
    />
  );
}
