import { ReloadOutlined } from "@ant-design/icons";
import { Alert, Button, Card, Col, Row, Space, Statistic, Tag, Typography } from "antd";

import { PageHero } from "@/components/ui/PageHero";
import { useLegacyDashboard } from "@/modules/dashboard/useLegacyDashboard";

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao disponivel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

export function DashboardPage() {
  const { summary, snapshot, refresh } = useLegacyDashboard();

  return (
    <Row gutter={[24, 24]}>
      <Col span={24}>
        <PageHero
          eyebrow="Leitura controlada do legado"
          title="Dashboard"
          description="O novo admin agora consome o estado legado em modo somente leitura, sem alterar o app antigo nem o fluxo atual do storage."
          tag={summary.hasPersistedState ? "Dados legados carregados" : "Sem estado legado persistido"}
          metrics={[
            { label: "Chave lida", value: summary.sourceKey ?? "Nao encontrada" },
            { label: "Ultima leitura", value: new Date(summary.loadedAt).toLocaleString("pt-BR") },
            { label: "Sync legado", value: summary.syncStatus || "offline" },
          ]}
          actions={
            <Button type="primary" size="large" icon={<ReloadOutlined />} onClick={refresh}>
              Recarregar leitura
            </Button>
          }
        />
      </Col>

      {snapshot.warnings.length ? (
        <Col span={24}>
          <Alert
            type="warning"
            showIcon
            message="Leitura do legado com observacoes"
            description={snapshot.warnings.join(" ")}
          />
        </Col>
      ) : null}

      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Statistic title="Produtos" value={summary.productsCount} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Statistic title="Clientes cadastrados" value={summary.customersCount} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Statistic title="Vendas registradas" value={summary.salesCount} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Statistic title="Saldo da conta loja" value={formatCurrency(summary.lojaCashBalance)} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Statistic title="Itens com estoque baixo" value={summary.lowStockCount} />
        </Card>
      </Col>
      <Col xs={24} md={12} xl={8}>
        <Card className="module-card">
          <Space direction="vertical" size={8}>
            <Typography.Text type="secondary">Estado legado</Typography.Text>
            <Tag color={summary.hasPersistedState ? "green" : "default"}>
              {summary.hasPersistedState ? "Persistido no navegador" : "Sem estado persistido"}
            </Tag>
            <Typography.Text>{summary.syncMessage || "Sem mensagem de sincronizacao"}</Typography.Text>
          </Space>
        </Card>
      </Col>
    </Row>
  );
}
