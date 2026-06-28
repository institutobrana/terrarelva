import {
  CalendarOutlined,
  CreditCardOutlined,
  DeleteOutlined,
  DownOutlined,
  EyeOutlined,
  ExportOutlined,
  FileTextOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  SettingOutlined,
  SwapOutlined,
  TeamOutlined,
} from "@ant-design/icons";
import { Button, DatePicker, Dropdown, Input, Select, Table, Tabs, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type CashflowRow = {
  id: string;
  date: string | null;
  payerOrVendor: string;
  category: string;
  description: string | null;
  type: string | null;
  number: string | null;
  paidStatus: string | null;
  amount: number | null;
  balance: number | null;
};

const preparedRows: CashflowRow[] = [];

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Preparado";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatDate(value: string | null) {
  if (!value) {
    return "Preparado";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

export function FluxoCaixaPage() {
  const { setShellBandContent } = useAdminShellBand();
  const navigate = useNavigate();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [selectedAccount, setSelectedAccount] = useState("loja");
  const [selectedPeriod, setSelectedPeriod] = useState("mes-atual");
  const [search, setSearch] = useState("");
  const [apiMessage, messageContext] = message.useMessage();

  const selectedRow = preparedRows.find((row) => row.id === selectedRowId) ?? null;
  const disableSelectionActions = !selectedRow;
  const filteredRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();
    if (!normalizedSearch) {
      return preparedRows;
    }

    return preparedRows.filter((row) =>
      [row.payerOrVendor, row.category, row.description ?? "", row.type ?? "", row.number ?? ""]
        .join(" ")
        .toLowerCase()
        .includes(normalizedSearch),
    );
  }, [search]);

  const columns: ColumnsType<CashflowRow> = [
    { title: "Data", dataIndex: "date", key: "date", width: 110, render: (value: string | null) => formatDate(value) },
    { title: "Pagador/Fornecedor", dataIndex: "payerOrVendor", key: "payerOrVendor", width: 220 },
    { title: "Categoria", dataIndex: "category", key: "category", width: 180 },
    { title: "Descricao", dataIndex: "description", key: "description", render: (value: string | null) => value ?? "Preparado para backend" },
    { title: "Tipo", dataIndex: "type", key: "type", width: 110, render: (value: string | null) => value ?? "Preparado" },
    { title: "Numero", dataIndex: "number", key: "number", width: 90, render: (value: string | null) => value ?? "Preparado" },
    { title: "Pag", dataIndex: "paidStatus", key: "paidStatus", width: 80, render: (value: string | null) => value ?? "Prep." },
    { title: "Valor", dataIndex: "amount", key: "amount", width: 140, render: (value: number | null) => formatCurrency(value) },
    { title: "Saldo", dataIndex: "balance", key: "balance", width: 140, render: (value: number | null) => formatCurrency(value) },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band cashflow-shell-band" aria-label="Barra operacional do fluxo de caixa">
        <div className="users-shell-band-toolbar cashflow-shell-toolbar" role="toolbar" aria-label="Acoes do modulo fluxo de caixa">
          <div className="cashflow-shell-toolbar-left">
            <Dropdown
              trigger={["click"]}
              menu={{
                items: [
                  { key: "recebimento", label: "Recebimento", icon: <PlusOutlined /> },
                  { key: "despesa", label: "Despesa", icon: <DeleteOutlined /> },
                  { key: "transferencia", label: "Transferencia", icon: <SwapOutlined /> },
                  { key: "saldo-inicial", label: "Saldo inicial", icon: <CalendarOutlined /> },
                ],
                onClick: ({ key }) => {
                  const labels: Record<string, string> = {
                    recebimento: "Recebimento",
                    despesa: "Despesa",
                    transferencia: "Transferencia",
                    "saldo-inicial": "Saldo inicial",
                  };
                  apiMessage.info(`${labels[key] ?? "Opcao"} preparada para a proxima etapa.`);
                },
              }}
            >
              <Button type="primary" icon={<PlusOutlined />} iconPosition="start">
                Novo
                <DownOutlined />
              </Button>
            </Dropdown>
            <Button
              icon={<SwapOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Edicao preparada para quando houver base real de movimentacoes.")}
            >
              Alterar
            </Button>
            <Button
              icon={<DeleteOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Exclusao preparada para a proxima etapa.")}
            >
              Excluir
            </Button>
            <Button
              icon={<EyeOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Detalhes preparados para a proxima etapa.")}
            >
              Detalhes
            </Button>
          </div>

          <div className="cashflow-shell-toolbar-right">
            <Select
              size="small"
              value={selectedAccount}
              onChange={setSelectedAccount}
              options={[
                { label: "Caixa loja", value: "loja" },
                { label: "Caixa pessoal", value: "pessoal" },
                { label: "Recebiveis", value: "recebiveis" },
              ]}
              className="cashflow-shell-control cashflow-shell-account"
            />
            <Select
              size="small"
              value={selectedPeriod}
              onChange={setSelectedPeriod}
              options={[
                { label: "Mes atual", value: "mes-atual" },
                { label: "Ultimos 30 dias", value: "ultimos-30" },
                { label: "Personalizado", value: "personalizado" },
              ]}
              className="cashflow-shell-control cashflow-shell-period"
            />
            <DatePicker size="small" format="DD/MM/YYYY" placeholder="Data inicial" className="cashflow-shell-control" />
            <DatePicker size="small" format="DD/MM/YYYY" placeholder="Data final" className="cashflow-shell-control" />
            <Input
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Pesquisar"
              className="cashflow-shell-search"
            />
            <Dropdown
              trigger={["click"]}
              placement="bottomRight"
              menu={{
                items: [
                  { key: "fornecedores", label: "Cadastrar fornecedores", icon: <TeamOutlined /> },
                  { key: "plano-contas", label: "Configurar plano de contas", icon: <FileTextOutlined /> },
                  { key: "contas-bancarias", label: "Configurar contas bancarias", icon: <CreditCardOutlined /> },
                  { key: "formas-pagamento", label: "Configurar formas de pagamento", icon: <SettingOutlined /> },
                ],
                onClick: ({ key }) => {
                  if (key === "fornecedores") {
                    navigate("/admin/fornecedores");
                    return;
                  }

                  if (key === "plano-contas") {
                    navigate("/admin/configuracoes/plano-contas");
                    return;
                  }

                  if (key === "contas-bancarias") {
                    navigate("/admin/configuracoes/contas-bancarias");
                    return;
                  }

                  if (key === "formas-pagamento") {
                    navigate("/admin/configuracoes/tabelas-auxiliares");
                    apiMessage.info("Tabela de formas de pagamento preparada dentro de Tabelas auxiliares.");
                  }
                },
              }}
            >
              <Button icon={<SettingOutlined />} aria-label="Configuracoes do fluxo de caixa" />
            </Dropdown>
            <Button icon={<PrinterOutlined />} onClick={() => apiMessage.info("Impressao preparada para a proxima etapa.")} />
            <Button icon={<ExportOutlined />} onClick={() => apiMessage.info("Exportacao preparada para a proxima etapa.")} />
          </div>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [apiMessage, disableSelectionActions, navigate, search, selectedAccount, selectedPeriod, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      <Tabs
        size="small"
        activeKey="movimentacao"
        items={[
          { key: "movimentacao", label: "Movimentacao" },
          { key: "painel", label: "Painel" },
        ]}
        className="cashflow-tabs"
      />

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
            <Table<CashflowRow>
              rowKey="id"
              className="module-table users-admin-table"
              columns={columns}
              dataSource={filteredRows}
              pagination={false}
              rowSelection={{
                type: "radio",
                selectedRowKeys: selectedRowId ? [selectedRowId] : [],
                onChange: (selectedRowKeys) => setSelectedRowId((selectedRowKeys[0] as string) ?? null),
              }}
              onRow={(record) => ({
                onClick: () => setSelectedRowId(record.id),
              })}
              rowClassName={(record) => (record.id === selectedRowId ? "users-table-row-selected" : "")}
              locale={{ emptyText: "Nenhuma movimentacao carregada ainda para o fluxo de caixa." }}
              footer={() => (
                <div className="cashflow-footer">
                  <div className="cashflow-footer-total">
                    <Typography.Text type="secondary">Total de receitas</Typography.Text>
                    <Typography.Text strong>Preparado</Typography.Text>
                  </div>
                  <div className="cashflow-footer-total">
                    <Typography.Text type="secondary">Total de despesas</Typography.Text>
                    <Typography.Text strong>Preparado</Typography.Text>
                  </div>
                  <div className="cashflow-footer-total is-result">
                    <Typography.Text type="secondary">Resultado total</Typography.Text>
                    <Typography.Text strong>Preparado</Typography.Text>
                  </div>
                </div>
              )}
            />
          </div>
        </div>
      </ModuleSectionCard>
    </div>
  );
}
