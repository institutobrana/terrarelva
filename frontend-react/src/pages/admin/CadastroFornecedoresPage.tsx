import {
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Input, Select, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type SupplierRow = {
  id: string;
  name: string;
  segment: string | null;
  document: string | null;
  phone: string | null;
  email: string | null;
};

const preparedRows: SupplierRow[] = [];

const segmentOptions = [
  { label: "Todos os segmentos", value: "all" },
  { label: "Sem filtro", value: "prepared" },
];

export function CadastroFornecedoresPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [apiMessage, messageContext] = message.useMessage();

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return preparedRows.filter((row) => {
      const matchesSegment = selectedSegment === "all" || row.segment === selectedSegment;
      const matchesSearch = !normalizedSearch
        || [row.name, row.segment ?? "", row.document ?? "", row.phone ?? "", row.email ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSegment && matchesSearch;
    });
  }, [search, selectedSegment]);

  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const disableSelectionActions = !selectedRow;

  const columns: ColumnsType<SupplierRow> = [
    {
      title: "Nome do fornecedor",
      dataIndex: "name",
      key: "name",
      render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
    },
    {
      title: "Segmento",
      dataIndex: "segment",
      key: "segment",
      width: 180,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "CPF/CNPJ",
      dataIndex: "document",
      key: "document",
      width: 180,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Telefone",
      dataIndex: "phone",
      key: "phone",
      width: 160,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "E-mail",
      dataIndex: "email",
      key: "email",
      width: 220,
      render: (value: string | null) => value ?? "Preparado para backend",
    },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band cadastro-shell-band" aria-label="Barra operacional de fornecedores">
        <div className="users-shell-band-toolbar cashflow-shell-toolbar" role="toolbar" aria-label="Acoes do modulo fornecedores">
          <div className="cashflow-shell-toolbar-left">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => apiMessage.info("Cadastro de novo fornecedor preparado para a proxima etapa.")}
            >
              Novo fornecedor
            </Button>
            <Button
              icon={<FileTextOutlined />}
              disabled={disableSelectionActions}
              onClick={() => apiMessage.info("Edicao preparada para quando houver base real de fornecedores.")}
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
          </div>

          <div className="cashflow-shell-toolbar-right">
            <Select
              size="small"
              value={selectedSegment}
              onChange={setSelectedSegment}
              options={segmentOptions}
              className="cashflow-shell-control cadastro-shell-segment"
            />
            <Input
              size="small"
              value={search}
              onChange={(event) => setSearch(event.target.value)}
              prefix={<SearchOutlined />}
              placeholder="Pesquisar fornecedor"
              className="cashflow-shell-search"
            />
          </div>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [apiMessage, disableSelectionActions, search, selectedSegment, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
            <Table<SupplierRow>
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
              locale={{ emptyText: "Nenhum fornecedor carregado ainda." }}
            />
          </div>
        </div>
      </ModuleSectionCard>
    </div>
  );
}
