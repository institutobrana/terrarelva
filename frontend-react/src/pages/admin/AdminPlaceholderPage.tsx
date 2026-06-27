import { CompassOutlined, LinkOutlined, SafetyOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

type AdminPlaceholderPageProps = {
  eyebrow: string;
  title: string;
  description: string;
  tag: string;
  metrics: { label: string; value: string }[];
  bullets: string[];
};

export function AdminPlaceholderPage({
  eyebrow,
  title,
  description,
  tag,
  metrics,
  bullets,
}: AdminPlaceholderPageProps) {
  return (
    <AdminPageTemplate
      eyebrow={eyebrow}
      title={title}
      description={description}
      tag={tag}
      metrics={metrics}
      cards={[
        {
          title: "Estrutura do shell",
          description: "Esta tela existe para firmar a navegacao do novo admin dentro do React.",
          bullets,
          icon: <CompassOutlined />,
        },
        {
          title: "Migracao segura",
          description: "Nenhuma escrita nova foi habilitada; o foco continua sendo casco e roteamento.",
          bullets: ["Sem tocar no backend", "Sem mudar a fonte de verdade do legado"],
          icon: <SafetyOutlined />,
        },
        {
          title: "Proxima integracao",
          description: "O modulo ja tem rota propria para receber dados, tabelas e formularios depois.",
          bullets: ["Boa base para hooks e repositories", "Topo contextual pronto para subtelas"],
          icon: <LinkOutlined />,
        },
      ]}
    />
  );
}
