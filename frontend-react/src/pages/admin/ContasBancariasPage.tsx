import {
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type BankAccountRow = {
  id: string;
  accountName: string;
  providerName: string | null;
  bankName: string | null;
  branch: string | null;
  accountNumber: string | null;
  isActive: boolean;
};

const preparedRows: BankAccountRow[] = [];

export function ContasBancariasPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [apiMessage, messageContext] = message.useMessage();

  const visibleRows = useMemo(
    () => preparedRows.filter((row) => (showInactive ? true : row.isActive)),
    [showInactive],
  );
  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const disableSelectionActions = !selectedRow;

  const columns: ColumnsType<BankAccountRow> = [
    {
      title: "Nome da conta/caixa",
      dataIndex: "accountName",
      key: "accountName",
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{row.accountName}</Typography.Text>
          <Typography.Text type="secondary">{row.isActive ? "Ativa" : "Inativa"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Nome do prestador",
      dataIndex: "providerName",
      key: "providerName",
      render: (value: string | null) => value ?? "Preparado para backend",
    },
    {
      title: "Banco",
      dataIndex: "bankName",
      key: "bankName",
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Agencia",
      dataIndex: "branch",
      key: "branch",
      width: 140,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Conta",
      dataIndex: "accountNumber",
      key: "accountNumber",
      width: 180,
      render: (value: string | null) => value ?? "Preparado",
    },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional de contas bancarias">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes do modulo contas bancarias">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => apiMessage.info("Cadastro de nova conta preparado para a proxima etapa.")}
          >
            Nova conta
          </Button>
          <Button
            icon={<FileTextOutlined />}
            disabled={disableSelectionActions}
            onClick={() => apiMessage.info("Edicao preparada para quando houver base real de contas bancarias.")}
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
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [apiMessage, disableSelectionActions, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
            <Table<BankAccountRow>
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
              locale={{ emptyText: "Nenhuma conta bancaria carregada ainda." }}
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
