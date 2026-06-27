import { AppstoreOutlined, TagsOutlined, ToolOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function ProdutosPage() {
  return (
    <AdminPageTemplate
      eyebrow="Modulo futuro"
      title="Produtos"
      description="Base de pagina pronta para catalogo, fichas tecnicas, precificacao e publicacao para a loja."
      tag="Somente estrutura nesta fase"
      metrics={[
        { label: "Subdominios", value: "Catalogo + fichas" },
        { label: "Estado", value: "Placeholder" },
        { label: "Reaproveitamento", value: "Alto" },
      ]}
      cards={[
        {
          title: "Catalogo administrativo",
          description: "Recebera cadastro, status, categorias, variantes e controle de disponibilidade.",
          bullets: ["Sem migrar data/products.js ainda", "Preparado para tabela e filtros Ant Design"],
          icon: <AppstoreOutlined />,
        },
        {
          title: "Precificacao",
          description: "Espaco destinado a custos, margens e leitura de receitas tecnicas futuramente.",
          bullets: ["Tipos e repositorios entram depois", "Fluxo legado permanece intacto"],
          icon: <TagsOutlined />,
        },
        {
          title: "Publicacao para loja",
          description: "O modulo sera a ponte entre area interna e catalogo publico da /loja.",
          bullets: ["Mesma aplicacao, contextos diferentes", "Sem duplicar dominio no frontend novo"],
          icon: <ToolOutlined />,
        },
      ]}
    />
  );
}
