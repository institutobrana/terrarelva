import {
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Input, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type ClientRow = {
  id: string;
  name: string;
  phone: string | null;
  code: string | null;
  birthDate: string | null;
  status: string | null;
  provider: string | null;
  isActive: boolean;
};

const preparedRows: ClientRow[] = [];

function formatDate(value: string | null) {
  if (!value) {
    return "Preparado";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

export function CadastroClientesPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [apiMessage, messageContext] = message.useMessage();

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return preparedRows.filter((row) => {
      if (!showInactive && !row.isActive) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [row.name, row.phone ?? "", row.code ?? "", row.provider ?? ""].join(" ").toLowerCase().includes(normalizedSearch);
    });
  }, [search, showInactive]);

  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const selectedLabel = selectedRow?.name ?? "Nenhum cliente selecionado";
  const disableSelectionActions = !selectedRow;

  const columns: ColumnsType<ClientRow> = [
    {
      title: "Cliente",
      dataIndex: "name",
      key: "name",
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{row.name}</Typography.Text>
          <Typography.Text type="secondary">{row.isActive ? "Ativo" : "Inativo"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Telefone",
      dataIndex: "phone",
      key: "phone",
      width: 160,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Codigo",
      dataIndex: "code",
      key: "code",
      width: 130,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Nascimento",
      dataIndex: "birthDate",
      key: "birthDate",
      width: 130,
      render: (value: string | null) => formatDate(value),
    },
    {
      title: "Situacao",
      dataIndex: "status",
      key: "status",
      width: 140,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Prestador",
      dataIndex: "provider",
      key: "provider",
      width: 180,
      render: (value: string | null) => value ?? "Preparado para backend",
    },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band cadastro-shell-band" aria-label="Barra operacional de clientes">
        <div className="users-shell-band-toolbar cashflow-shell-toolbar" role="toolbar" aria-label="Acoes do modulo clientes">
          <div className="cashflow-shell-toolbar-left">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => apiMessage.info("Cadastro de novo cliente preparado para a proxima etapa.")}
            >
              Novo cliente
            </Button>
            <Button
              icon={<FileTextOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Edicao preparada para quando houver base real de clientes.")}
            >
              Alterar
            </Button>
            <Button
              icon={<InfoCircleOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Painel de detalhes preparado para a proxima etapa.")}
            >
              Detalhes
            </Button>
            <Button
              icon={<PrinterOutlined />}
              onClick={() => apiMessage.info("Impressao preparada para quando houver dados reais de clientes.")}
            >
              Imprimir
            </Button>
            <Button
              icon={<SolutionOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Ficha clinica mantida como placeholder controlado para evolucao futura.")}
            >
              Ficha clinica
            </Button>
          </div>

          <div className="cashflow-shell-toolbar-right cadastro-shell-toolbar-right">
            <Typography.Text className="cadastro-shell-selection">{selectedLabel}</Typography.Text>
            <Input
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Pesquisar cliente"
              className="cashflow-shell-search"
            />
          </div>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [apiMessage, disableSelectionActions, search, selectedLabel, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
            <Table<ClientRow>
              rowKey="id"
              className="module-table users-admin-table"
              columns={columns}
              dataSource={visibleRows}
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
              locale={{ emptyText: "Nenhum cliente carregado ainda." }}
              footer={() => (
                <div className="users-grid-footer">
                  <Space wrap size={16}>
                    <Checkbox checked={showInactive} onChange={(event) => setShowInactive(event.target.checked)}>
                      Visualizar inativos
                    </Checkbox>
                  </Space>
                  <Typography.Text strong>Total de registros: {visibleRows.length}</Typography.Text>
                </div>
              )}
            />
          </div>
        </div>
      </ModuleSectionCard>
    </div>
  );
}
