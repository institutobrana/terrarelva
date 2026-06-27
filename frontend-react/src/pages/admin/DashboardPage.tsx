import { AreaChartOutlined, DeploymentUnitOutlined, RadarChartOutlined } from "@ant-design/icons";

import { AdminPageTemplate } from "./AdminPageTemplate";

export function DashboardPage() {
  return (
    <AdminPageTemplate
      eyebrow="Base administrativa"
      title="Dashboard"
      description="Painel inicial do novo admin, pronto para receber indicadores vindos do legado e depois das fontes migradas."
      tag="Sem logica migrada nesta fase"
      metrics={[
        { label: "Rotas base", value: "7 modulos" },
        { label: "Stack", value: "React + Vite + TS" },
        { label: "Objetivo", value: "Convivencia segura" },
      ]}
      cards={[
        {
          title: "Visao executiva",
          description: "Espaco reservado para caixa, vendas do dia, estoque baixo e resumo operacional.",
          bullets: ["Conectar ao storage na fase seguinte", "Manter compatibilidade com dados legados"],
          icon: <AreaChartOutlined />,
        },
        {
          title: "Mapa de migracao",
          description: "O dashboard sera a primeira tela consolidada para validar shell, tema e componentes.",
          bullets: ["Nao reescreve regras ainda", "Recebe cards reais por modulo depois"],
          icon: <DeploymentUnitOutlined />,
        },
        {
          title: "Leitura futura",
          description: "Estrutura pronta para integrar KPI cards, graficos e alertas sem alterar o layout base.",
          bullets: ["Placeholder profissional", "Sem dependencias do legado nesta rodada"],
          icon: <RadarChartOutlined />,
        },
      ]}
    />
  );
}
