import {
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";

type AuxiliaryTableDefinition = {
  id: string;
  label: string;
  emptyMessage: string;
};

type AuxiliaryTableRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
};

const auxiliaryTables: AuxiliaryTableDefinition[] = [
  { id: "motivos-agendamento", label: "Motivos de agendamento", emptyMessage: "Nenhum motivo de agendamento carregado ainda." },
  { id: "tipos-indicacao", label: "Tipos de indicacao", emptyMessage: "Nenhum tipo de indicacao carregado ainda." },
  { id: "motivos-retorno", label: "Motivos de retorno", emptyMessage: "Nenhum motivo de retorno carregado ainda." },
  { id: "situacoes-agendamento", label: "Situacoes de agendamento", emptyMessage: "Nenhuma situacao de agendamento carregada ainda." },
  { id: "segmentos-fornecedor", label: "Segmentos de fornecedor", emptyMessage: "Nenhum segmento de fornecedor carregado ainda." },
  { id: "formas-pagamento", label: "Formas de pagamento", emptyMessage: "Nenhuma forma de pagamento carregada ainda." },
  { id: "especialidades", label: "Especialidades", emptyMessage: "Nenhuma especialidade carregada ainda." },
  { id: "fases-procedimento", label: "Fases de procedimento", emptyMessage: "Nenhuma fase de procedimento carregada ainda." },
  { id: "grupos-material", label: "Grupos de material", emptyMessage: "Nenhum grupo de material carregado ainda." },
  { id: "motivos-finalizacao", label: "Motivos de finalizacao do tratamento", emptyMessage: "Nenhum motivo de finalizacao carregado ainda." },
  { id: "solucoes-irrigadoras", label: "Solucoes irrigadoras", emptyMessage: "Nenhuma solucao irrigadora carregada ainda." },
  { id: "cimentos-obturadores", label: "Cimentos obturadores", emptyMessage: "Nenhum cimento obturador carregado ainda." },
  { id: "limas-memorias", label: "Limas memorias", emptyMessage: "Nenhuma lima memoria carregada ainda." },
  { id: "sistemas-instrumentacao", label: "Sistemas de instrumentacao", emptyMessage: "Nenhum sistema de instrumentacao carregado ainda." },
  { id: "medicacoes-intracanais", label: "Medicacoes intracanais", emptyMessage: "Nenhuma medicacao intracanal carregada ainda." },
  { id: "ocupacao-paciente", label: "Ocupacao/profissao do paciente", emptyMessage: "Nenhuma ocupacao/profissao carregada ainda." },
];

const preparedRowsByTable: Record<string, AuxiliaryTableRow[]> = {
  especialidades: [],
};

export function TabelasAuxiliaresPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("especialidades");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [apiMessage, messageContext] = message.useMessage();

  const activeTable = auxiliaryTables.find((item) => item.id === selectedTableId) ?? auxiliaryTables[0];
  const tableRows = useMemo(() => preparedRowsByTable[activeTable.id] ?? [], [activeTable.id]);
  const visibleRows = useMemo(() => tableRows.filter((row) => (showInactive ? true : row.isActive)), [showInactive, tableRows]);
  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;

  const columns: ColumnsType<AuxiliaryTableRow> = [
    {
      title: "Codigo",
      dataIndex: "code",
      key: "code",
      width: 120,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Nome",
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
      render: (value: string | null) => value ?? "Preparado para backend",
    },
  ];

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional de tabelas auxiliares">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes do modulo tabelas auxiliares">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => apiMessage.info("Cadastro de nova especialidade preparado para a proxima etapa.")}
          >
            Nova especialidade
          </Button>
          <Button
            icon={<EditOutlined />}
            disabled={!selectedRow}
            onClick={() => apiMessage.info("Edicao preparada para quando houver base real de tabelas auxiliares.")}
          >
            Editar
          </Button>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [apiMessage, selectedRow, setShellBandContent]);

  useEffect(() => {
    setSelectedRowId(null);
  }, [selectedTableId]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      <div className="auxiliary-layout">
        <aside className="auxiliary-sidebar">
          <div className="auxiliary-sidebar-header">
            <Typography.Text className="auxiliary-sidebar-kicker">Tabelas auxiliares</Typography.Text>
          </div>

          <div className="auxiliary-sidebar-list" role="listbox" aria-label="Tabelas auxiliares">
            {auxiliaryTables.map((item) => {
              const isActive = item.id === activeTable.id;

              return (
                <button
                  key={item.id}
                  type="button"
                  className={`auxiliary-sidebar-item${isActive ? " is-active" : ""}`}
                  onClick={() => setSelectedTableId(item.id)}
                >
                  {item.label}
                </button>
              );
            })}
          </div>
        </aside>

        <ModuleSectionCard className="auxiliary-main-card">
          <div className="module-table-shell">
            <div className="users-grid-shell">
              <Table<AuxiliaryTableRow>
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
                locale={{ emptyText: activeTable.emptyMessage }}
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
    </div>
  );
}
