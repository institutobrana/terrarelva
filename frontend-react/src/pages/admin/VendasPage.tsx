import { CreditCardOutlined, ShoppingOutlined, UserSwitchOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function VendasPage() {
  return (
    <AdminPageTemplate
      eyebrow="Modulo futuro"
      title="Vendas"
      description="Pagina base para a futura migracao do fluxo de venda, itens, pagamentos e baixa de estoque."
      tag="Fluxo legado preservado"
      metrics={[
        { label: "Sensibilidade", value: "Alta" },
        { label: "Dependencias", value: "Clientes + caixa + estoque" },
        { label: "Migracao", value: "Posterior" },
      ]}
      cards={[
        {
          title: "Builder de venda",
          description: "Espaco previsto para cliente, itens, favoritos e totalizacao da venda.",
          bullets: ["Sem formulario funcional ainda", "Mantem risco fora desta fase"],
          icon: <ShoppingOutlined />,
        },
        {
          title: "Pagamento",
          description: "Area destinada a Pix, dinheiro, debito, credito e recebiveis futuros.",
          bullets: ["Sem regra financeira ainda", "Pronta para etapas seguintes"],
          icon: <CreditCardOutlined />,
        },
        {
          title: "Cliente e relacionamento",
          description: "A pagina vai conversar com historico de compras e recorrencia sem duplicar logica.",
          bullets: ["Cliente avulso permanece no legado", "Estrutura nova pronta para integrar"],
          icon: <UserSwitchOutlined />,
        },
      ]}
    />
  );
}
