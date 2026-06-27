import { CloudSyncOutlined, SafetyCertificateOutlined, SettingOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function ConfiguracoesPage() {
  return (
    <AdminPageTemplate
      eyebrow="Infraestrutura da migracao"
      title="Configuracoes"
      description="Tela base para parametros da operacao, conectores e configuracoes do novo frontend."
      tag="Ponto natural para estrategia de transicao"
      metrics={[
        { label: "Parametros", value: "Precificacao futura" },
        { label: "Sync", value: "Apps Script depois" },
        { label: "Uso atual", value: "Placeholder" },
      ]}
      cards={[
        {
          title: "Parametros",
          description: "Recebera hora artesanal, imposto, margem e regras gerais do negocio.",
          bullets: ["Sem ler settings do legado ainda", "Base pronta para formularios Ant"],
          icon: <SettingOutlined />,
        },
        {
          title: "Conectores",
          description: "Area futura para sincronizacao, importacao e possiveis servicos externos.",
          bullets: ["Apps Script continua no legado", "Nova UX ja tem espaco reservado"],
          icon: <CloudSyncOutlined />,
        },
        {
          title: "Governanca",
          description: "Espaco para registrar a fonte oficial da nova aplicacao e etapas da migracao.",
          bullets: ["Ajuda a reduzir divergencia", "Mantem o processo documentado"],
          icon: <SafetyCertificateOutlined />,
        },
      ]}
    />
  );
}
