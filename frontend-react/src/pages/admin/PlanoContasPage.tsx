import {
  FileTextOutlined,
  FolderAddOutlined,
  InfoCircleOutlined,
  PrinterOutlined,
  SettingOutlined,
  TagsOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type PlanAccountRow = {
  id: string;
  name: string;
  description: string;
  isTaxable: boolean | null;
  requiresCarneLeao: boolean | null;
  internalCode: string | null;
  isActive: boolean;
};

const preparedRows: PlanAccountRow[] = [];

function formatFlag(value: boolean | null) {
  if (value === null) {
    return "Nao definido";
  }

  return value ? "Sim" : "Nao";
}

export function PlanoContasPage() {
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

  const columns: ColumnsType<PlanAccountRow> = [
    {
      title: "Grupo/categoria financeira",
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
      title: "Descricao",
      dataIndex: "description",
      key: "description",
    },
    {
      title: "Tributavel",
      dataIndex: "isTaxable",
      key: "isTaxable",
      width: 140,
      render: (value: boolean | null) => formatFlag(value),
    },
    {
      title: "Carne leao",
      dataIndex: "requiresCarneLeao",
      key: "requiresCarneLeao",
      width: 140,
      render: (value: boolean | null) => formatFlag(value),
    },
    {
      title: "Codigo interno",
      dataIndex: "internalCode",
      key: "internalCode",
      width: 160,
      render: (value: string | null) => value ?? "Preparado para backend",
    },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional do plano de contas">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes do modulo plano de contas">
          <Button
            type="primary"
            icon={<FolderAddOutlined />}
            onClick={() => apiMessage.info("Fluxo de novo grupo preparado para a proxima etapa.")}
          >
            Novo grupo
          </Button>
          <Button
            icon={<TagsOutlined />}
            onClick={() => apiMessage.info("Fluxo de nova categoria preparado para a proxima etapa.")}
          >
            Nova categoria
          </Button>
          <Button
            icon={<FileTextOutlined />}
            disabled={disableSelectionActions}
            onClick={() => apiMessage.info("Edicao preparada para quando o dominio do plano de contas for conectado.")}
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
            icon={<SettingOutlined />}
            onClick={() => apiMessage.info("Preferencias do modulo preparadas para a proxima etapa.")}
          >
            Preferencias
          </Button>
          <span className="users-shell-band-divider" aria-hidden="true" />
          <Button
            icon={<PrinterOutlined />}
            onClick={() => apiMessage.info("Impressao preparada para quando houver dados reais no modulo.")}
          >
            Imprimir
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
            <Table<PlanAccountRow>
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
              locale={{ emptyText: "Nenhum grupo ou categoria carregado ainda para o plano de contas." }}
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
