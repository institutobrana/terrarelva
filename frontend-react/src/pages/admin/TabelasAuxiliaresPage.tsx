import {
  CheckOutlined,
  CloseOutlined,
  EditOutlined,
  FilterOutlined,
  LockOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Dropdown, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import {
  AuxiliaryTablesApiError,
  createPaymentMethod,
  fetchPaymentMethods,
  type PaymentMethodRecord,
  updatePaymentMethod,
  updatePaymentMethodStatus,
} from "@/services/auxiliaryTables/auxiliaryTablesApi";

type AuxiliaryFormKind = "appointment-reason" | "appointment-status" | "simple";

type AuxiliaryField =
  | "code"
  | "name"
  | "description"
  | "type"
  | "color"
  | "productiveCommitment"
  | "history"
  | "hideAppointment"
  | "considerPatientNoShow";

type AuxiliaryTableDefinition = {
  id: string;
  label: string;
  emptyMessage: string;
  createLabel: string;
  createTitle: string;
  submitLabel: string;
  formKind: AuxiliaryFormKind;
  fields: AuxiliaryField[];
  hasColorColumn?: boolean;
};

type AuxiliaryTableRow = {
  id: string;
  code: string | null;
  name: string;
  description: string | null;
  isActive: boolean;
};

type AuxiliaryModalFormValues = {
  code?: string;
  name: string;
  description?: string;
  isActive?: boolean;
  type?: "agendamento" | "compromisso";
  color?: string;
  productiveCommitment?: boolean;
  history?: string;
  hideAppointment?: boolean;
  considerPatientNoShow?: boolean;
};

type EditingPaymentMethodSnapshot = {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
};

type PaymentMethodColumnKey = "code" | "name" | "description";

type SortState = {
  key: PaymentMethodColumnKey | null;
  order: "asc" | "desc" | null;
};

type AuxiliaryVisibleColumns = Record<PaymentMethodColumnKey | "color" | "lock" | "status", boolean>;

const auxiliaryTables: AuxiliaryTableDefinition[] = [
  {
    id: "motivos-agendamento",
    label: "Motivos de agendamento",
    emptyMessage: "Nenhum motivo de agendamento carregado ainda.",
    createLabel: "Novo motivo",
    createTitle: "Novo motivo de agendamento",
    submitLabel: "Gravar motivo",
    formKind: "appointment-reason",
    fields: ["code", "name", "description", "type", "color", "productiveCommitment"],
    hasColorColumn: true,
  },
  {
    id: "situacoes-agendamento",
    label: "Situacoes de agendamento",
    emptyMessage: "Nenhuma situacao de agendamento carregada ainda.",
    createLabel: "Nova situacao",
    createTitle: "Nova situacao de agendamento",
    submitLabel: "Gravar situacao",
    formKind: "appointment-status",
    fields: ["code", "name", "description", "history", "color", "hideAppointment", "considerPatientNoShow"],
    hasColorColumn: true,
  },
  {
    id: "tipos-indicacao",
    label: "Tipos de indicacao",
    emptyMessage: "Nenhum tipo de indicacao carregado ainda.",
    createLabel: "Novo tipo",
    createTitle: "Novo tipo de indicacao",
    submitLabel: "Gravar tipo",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "segmentos-fornecedor",
    label: "Segmentos de fornecedor",
    emptyMessage: "Nenhum segmento de fornecedor carregado ainda.",
    createLabel: "Novo segmento",
    createTitle: "Novo segmento de fornecedor",
    submitLabel: "Gravar segmento",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "formas-pagamento",
    label: "Formas de pagamento",
    emptyMessage: "Nenhuma forma de pagamento carregada ainda.",
    createLabel: "Nova forma",
    createTitle: "Nova forma de pagamento",
    submitLabel: "Gravar forma",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "grupos-material",
    label: "Grupos de material",
    emptyMessage: "Nenhum grupo de material carregado ainda.",
    createLabel: "Novo grupo",
    createTitle: "Novo grupo de material",
    submitLabel: "Gravar grupo",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "ocupacao-cliente",
    label: "Ocupacao/profissao do cliente",
    emptyMessage: "Nenhuma ocupacao/profissao do cliente carregada ainda.",
    createLabel: "Nova ocupacao",
    createTitle: "Nova ocupacao/profissao do cliente",
    submitLabel: "Gravar ocupacao",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
];

const preparedRowsByTable: Record<string, AuxiliaryTableRow[]> = {
  "motivos-agendamento": [],
  "segmentos-fornecedor": [],
  especialidades: [],
};

const reasonTypeOptions = [
  { label: "Agendamento", value: "agendamento" },
  { label: "Compromisso", value: "compromisso" },
];

const reasonColorOptions = [
  "#2C4034", "#3A563E", "#4A6B4D", "#5A7652", "#6A845D", "#779267", "#8AA57A", "#A5B78E", "#6C5B3B", "#8A7248", "#A18452", "#B7975F", "#C9AA6C", "#DDBE7B", "#E8D9A8",
  "#4A2F2F", "#6A3D3C", "#874E4B", "#A35E58", "#BE746D", "#D28B7E", "#E3A38D", "#B14E4A", "#C85F57", "#D96C63", "#E27F73", "#EC978A", "#F0B2A8", "#F6CAC1", "#FBE1D9",
  "#304C63", "#3F627D", "#4F7796", "#5F7D95", "#6D8DA8", "#7C9FBA", "#8FB2CC", "#5A5C8A", "#7167A8", "#8B5CF6", "#A47AF7", "#BE98F8", "#D96C8A", "#E68CA6",
];

function buildDefaultValues(table: AuxiliaryTableDefinition): AuxiliaryModalFormValues {
  if (table.formKind === "appointment-reason") {
    return {
      code: "",
      name: "",
      description: "",
      type: "agendamento",
      color: undefined,
      productiveCommitment: false,
    };
  }

  if (table.formKind === "appointment-status") {
    return {
      code: "",
      name: "",
      description: "",
      history: "",
      color: undefined,
      hideAppointment: false,
      considerPatientNoShow: false,
    };
  }

  return {
    code: "",
    name: "",
    description: "",
  };
}

export function TabelasAuxiliaresPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedTableId, setSelectedTableId] = useState("motivos-agendamento");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingPaymentMethod, setEditingPaymentMethod] = useState<EditingPaymentMethodSnapshot | null>(null);
  const [editingPaymentMethodIsActive, setEditingPaymentMethodIsActive] = useState(false);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [openFilterColumn, setOpenFilterColumn] = useState<PaymentMethodColumnKey | null>(null);
  const [columnQueries, setColumnQueries] = useState<Record<PaymentMethodColumnKey, string>>({
    code: "",
    name: "",
    description: "",
  });
  const [sortState, setSortState] = useState<SortState>({ key: null, order: null });
  const [visibleColumns, setVisibleColumns] = useState<AuxiliaryVisibleColumns>({
    code: true,
    name: true,
    description: true,
    color: true,
    lock: true,
    status: true,
  });
  const [apiMessage, messageContext] = message.useMessage();
  const [form] = Form.useForm<AuxiliaryModalFormValues>();

  const activeTable = auxiliaryTables.find((item) => item.id === selectedTableId) ?? auxiliaryTables[0];
  const isPaymentMethodsTable = activeTable.id === "formas-pagamento";
  const hasColorColumn = activeTable.hasColorColumn === true;
  const tableRows = useMemo(() => {
    if (isPaymentMethodsTable) {
      return paymentMethods.map<AuxiliaryTableRow>((entry) => ({
        id: entry.id,
        code: entry.codigo,
        name: entry.nome,
        description: entry.descricao,
        isActive: entry.isActive,
      }));
    }

    return preparedRowsByTable[activeTable.id] ?? [];
  }, [activeTable.id, isPaymentMethodsTable, paymentMethods]);
  const filteredRows = useMemo(() => {
    const nextRows = tableRows.filter((row) => {
      if (!showInactive && !row.isActive) {
        return false;
      }

      if (!isPaymentMethodsTable) {
        return true;
      }

      return (["code", "name", "description"] as PaymentMethodColumnKey[]).every((key) => {
        const query = columnQueries[key].trim().toLowerCase();
        if (!query) {
          return true;
        }

        const value =
          key === "code"
            ? row.code ?? ""
            : key === "name"
              ? row.name
              : row.description ?? "";

        return value.toLowerCase().includes(query);
      });
    });

    if (!isPaymentMethodsTable || !sortState.key || !sortState.order) {
      return nextRows;
    }

    return [...nextRows].sort((left, right) => {
      const getValue = (row: AuxiliaryTableRow) => {
        if (sortState.key === "code") {
          return row.code ?? "";
        }

        if (sortState.key === "description") {
          return row.description ?? "";
        }

        return row.name;
      };

      const comparison = getValue(left).localeCompare(getValue(right), "pt-BR", { sensitivity: "base" });
      return sortState.order === "asc" ? comparison : -comparison;
    });
  }, [columnQueries, isPaymentMethodsTable, showInactive, sortState, tableRows]);
  const selectedRow = filteredRows.find((row) => row.id === selectedRowId) ?? null;
  const selectedReasonType = Form.useWatch("type", form);
  const isCommitmentType = selectedReasonType === "compromisso";
  const isAppointmentReasonForm = activeTable.formKind === "appointment-reason";
  const isAppointmentStatusForm = activeTable.formKind === "appointment-status";
  const isEditing = editingRecordId !== null;

  const renderFilterDropdown = useCallback((columnKey: PaymentMethodColumnKey, label: string) => (
    <div className="auxiliary-filter-menu" onClick={(event) => event.stopPropagation()}>
      <Typography.Text strong className="auxiliary-filter-menu-title">
        {label}
      </Typography.Text>
      <button
        type="button"
        className="auxiliary-filter-menu-item"
        onClick={() => {
          setSortState({ key: columnKey, order: "asc" });
          setOpenFilterColumn(null);
        }}
      >
        Ordem Ascendente
        {sortState.key === columnKey && sortState.order === "asc" ? <CheckOutlined /> : null}
      </button>
      <button
        type="button"
        className="auxiliary-filter-menu-item"
        onClick={() => {
          setSortState({ key: columnKey, order: "desc" });
          setOpenFilterColumn(null);
        }}
      >
        Ordem Descendente
        {sortState.key === columnKey && sortState.order === "desc" ? <CheckOutlined /> : null}
      </button>
      <div className="auxiliary-filter-menu-separator" />
      <div className="auxiliary-filter-menu-subtitle">Colunas</div>
      <div className="auxiliary-filter-menu-columns">
        {([
          ["code", "Codigo"],
          ["name", "Nome"],
          ["description", "Descricao"],
          ...(hasColorColumn ? ([["color", "Cor"]] as const) : []),
          ["lock", "Bloqueio"],
          ["status", "Status"],
        ] as const).map(([key, columnLabel]) => {
          const visibleKey = key as keyof AuxiliaryVisibleColumns;
          const enabledMainColumns = (["code", "name", "description"] as const).filter((entry) => visibleColumns[entry]).length;
          const disableToggle =
            (visibleKey === "code" || visibleKey === "name" || visibleKey === "description")
            && visibleColumns[visibleKey]
            && enabledMainColumns === 1;

          return (
            <label key={key} className={`auxiliary-filter-menu-checkbox${disableToggle ? " is-disabled" : ""}`}>
              <input
                type="checkbox"
                checked={visibleColumns[visibleKey]}
                disabled={disableToggle}
                onChange={() => {
                  setVisibleColumns((current) => ({
                    ...current,
                    [visibleKey]: !current[visibleKey],
                  }));
                }}
              />
              <span>{columnLabel}</span>
            </label>
          );
        })}
      </div>
    </div>
  ), [hasColorColumn, sortState, visibleColumns]);

  const renderFilterTitle = useCallback((columnKey: PaymentMethodColumnKey, label: string) => {
    if (!isPaymentMethodsTable) {
      return label;
    }

    const hasQuery = columnQueries[columnKey].trim().length > 0;
    const isSorted = sortState.key === columnKey && sortState.order;

    return (
      <div className="auxiliary-filter-header">
        <span>{label}</span>
        <Dropdown
          trigger={["click"]}
          open={openFilterColumn === columnKey}
          onOpenChange={(nextOpen) => setOpenFilterColumn(nextOpen ? columnKey : null)}
          dropdownRender={() => renderFilterDropdown(columnKey, label)}
        >
          <button
            type="button"
            className={`auxiliary-filter-trigger${hasQuery || isSorted ? " is-active" : ""}`}
            aria-label={`Abrir filtro de ${label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <FilterOutlined />
          </button>
        </Dropdown>
      </div>
    );
  }, [columnQueries, isPaymentMethodsTable, openFilterColumn, renderFilterDropdown, sortState]);

  const columns: ColumnsType<AuxiliaryTableRow> = useMemo(() => {
    const nextColumns: ColumnsType<AuxiliaryTableRow> = [];

    if (visibleColumns.code) {
      nextColumns.push({
        title: renderFilterTitle("code", "Codigo"),
        dataIndex: "code",
        key: "code",
        width: 104,
        render: (value: string | null) => <span className="auxiliary-table-code">{value ?? "Preparado"}</span>,
      });
    }

    if (visibleColumns.name) {
      nextColumns.push({
        title: renderFilterTitle("name", "Nome"),
        dataIndex: "name",
        key: "name",
        width: isPaymentMethodsTable ? "30%" : "34%",
        render: (_, row) => (
          <div className="auxiliary-table-name-cell">
            <Typography.Text strong className="auxiliary-table-name-text">{row.name}</Typography.Text>
          </div>
        ),
      });
    }

    if (visibleColumns.description) {
      nextColumns.push({
        title: renderFilterTitle("description", "Descricao"),
        dataIndex: "description",
        key: "description",
        width: "100%",
        render: (value: string | null) => {
          if (isPaymentMethodsTable) {
            return <span className="auxiliary-table-description">{value ?? ""}</span>;
          }

          return <span className="auxiliary-table-description">{value ?? "Preparado para backend"}</span>;
        },
      });
    }

    if (hasColorColumn && visibleColumns.color) {
      nextColumns.push({
        title: "Cor",
        dataIndex: "color",
        key: "color",
        width: 54,
        align: "center",
        className: "auxiliary-table-technical-column",
        render: () => (
          <span className="auxiliary-table-color-cell">
            <span className="auxiliary-table-color-swatch is-empty" aria-hidden="true" />
          </span>
        ),
      });
    }

    if (visibleColumns.lock) {
      nextColumns.push({
        title: "",
        dataIndex: "lock",
        key: "lock",
        width: 52,
        align: "center",
        className: "auxiliary-table-technical-column",
        render: () => (
          <span className="auxiliary-table-lock-cell" title="Bloqueio">
            <LockOutlined className="auxiliary-table-status-lock" />
          </span>
        ),
      });
    }

    if (visibleColumns.status) {
      nextColumns.push({
        title: "",
        dataIndex: "isActive",
        key: "status",
        width: 46,
        align: "center",
        className: "auxiliary-table-status-column",
        render: (value: boolean) => (
          <span className="auxiliary-table-status-indicator" title={value ? "Ativo" : "Inativo"}>
            <span
              className={`auxiliary-table-status-dot${value ? " is-active" : " is-inactive"}`}
              aria-label={value ? "Ativo" : "Inativo"}
            />
          </span>
        ),
      });
    }

    return nextColumns;
  }, [hasColorColumn, isPaymentMethodsTable, renderFilterTitle, visibleColumns]);

  const handleOpenModal = useCallback(() => {
    form.resetFields();
    setEditingRecordId(null);
    setEditingPaymentMethod(null);
    setEditingPaymentMethodIsActive(false);
    setOpenFilterColumn(null);
    setIsModalOpen(true);
  }, [form]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecordId(null);
    setEditingPaymentMethod(null);
    setEditingPaymentMethodIsActive(false);
    setOpenFilterColumn(null);
    form.resetFields();
  };

  const loadPaymentMethods = useEffectEvent(async () => {
    setIsLoadingTable(true);
    setTableError(null);

    try {
      const payload = await fetchPaymentMethods();
      setPaymentMethods(payload.paymentMethods);
      setSelectedRowId((currentSelection) => (
        payload.paymentMethods.some((entry) => entry.id === currentSelection) ? currentSelection : payload.paymentMethods[0]?.id ?? null
      ));
    } catch (error) {
      const nextMessage = error instanceof AuxiliaryTablesApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar as formas de pagamento.";
      setTableError(nextMessage);
    } finally {
      setIsLoadingTable(false);
    }
  });

  const handleCreateRecord = async () => {
    try {
      setIsSubmitting(true);
      const values = await form.validateFields();

      if (isPaymentMethodsTable) {
        const payload = {
          codigo: values.code?.trim() || undefined,
          nome: values.name.trim(),
          descricao: values.description?.trim() || undefined,
        };

        if (editingRecordId) {
          await updatePaymentMethod(editingRecordId, payload);
          const statusChanged = editingPaymentMethod && editingPaymentMethod.isActive !== editingPaymentMethodIsActive;
          if (statusChanged) {
            await updatePaymentMethodStatus(editingRecordId, editingPaymentMethodIsActive);
            if (!editingPaymentMethodIsActive && !showInactive) {
              setShowInactive(true);
            }
          }
          apiMessage.success("Forma de pagamento atualizada com sucesso.");
        } else {
          await createPaymentMethod(payload);
          apiMessage.success("Forma de pagamento criada com sucesso.");
        }

        await loadPaymentMethods();
        handleCloseModal();
        return;
      }

      apiMessage.success(`${activeTable.label}: cadastro de "${values.name}" validado e preparado para a proxima etapa.`);
      handleCloseModal();
    } catch (error) {
      if (error instanceof AuxiliaryTablesApiError) {
        apiMessage.error(error.message);
        return;
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleOpenEditModal = useEffectEvent(() => {
    if (!selectedRow) {
      apiMessage.warning("Selecione um registro para alterar.");
      return;
    }

    if (!isPaymentMethodsTable) {
      apiMessage.info("Edicao preparada para quando houver persistencia real nesta tabela auxiliar.");
      return;
    }

    if (!selectedRow) {
      apiMessage.error("Forma de pagamento selecionada nao encontrada.");
      return;
    }

    setEditingRecordId(selectedRow.id);
    setEditingPaymentMethod({
      id: selectedRow.id,
      code: selectedRow.code ?? "",
      name: selectedRow.name,
      description: selectedRow.description ?? "",
      isActive: selectedRow.isActive,
    });
    setEditingPaymentMethodIsActive(Boolean(selectedRow.isActive));
    setOpenFilterColumn(null);
    setIsModalOpen(true);
  });

  useEffect(() => {
    if (isPaymentMethodsTable) {
      void loadPaymentMethods();
      return;
    }

    setTableError(null);
    setIsLoadingTable(false);
    setPaymentMethods([]);
  }, [isPaymentMethodsTable]);

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional de tabelas auxiliares">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes do modulo tabelas auxiliares">
          <Button type="primary" icon={<PlusOutlined />} onClick={handleOpenModal}>
            {activeTable.createLabel}
          </Button>
          <Button
            icon={<EditOutlined />}
            disabled={!selectedRow}
            onClick={() => void handleOpenEditModal()}
          >
            Editar
          </Button>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [activeTable.createLabel, handleOpenModal, selectedRow, setShellBandContent]);

  useEffect(() => {
    setSelectedRowId(null);
    setOpenFilterColumn(null);
    setColumnQueries({ code: "", name: "", description: "" });
    setSortState({ key: null, order: null });
    setVisibleColumns({
      code: true,
      name: true,
      description: true,
      color: true,
      lock: true,
      status: true,
    });
  }, [selectedTableId]);

  useEffect(() => {
    if (activeTable.formKind !== "appointment-reason") {
      return;
    }

    if (!isCommitmentType) {
      form.setFieldsValue({
        color: undefined,
        productiveCommitment: false,
      });
      return;
    }

    if (!form.getFieldValue("productiveCommitment")) {
      form.setFieldValue("productiveCommitment", true);
    }
  }, [activeTable.formKind, form, isCommitmentType]);

  useEffect(() => {
    if (!isModalOpen) {
      return;
    }

    if (isPaymentMethodsTable && editingRecordId) {
      if (!editingPaymentMethod || editingPaymentMethod.id !== editingRecordId) {
        return;
      }

      form.setFieldsValue({
        code: editingPaymentMethod.code,
        name: editingPaymentMethod.name,
        description: editingPaymentMethod.description,
      });
      setEditingPaymentMethodIsActive(editingPaymentMethod.isActive);
      return;
    }

    form.setFieldsValue(buildDefaultValues(activeTable));
  }, [activeTable, editingPaymentMethod, editingRecordId, form, isModalOpen, isPaymentMethodsTable]);

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
            {tableError ? (
              <Alert
                type="error"
                showIcon
                message="Falha ao carregar dados"
                description={tableError}
                className="auxiliary-table-alert"
              />
            ) : null}
            <div className="users-grid-shell">
              <Table<AuxiliaryTableRow>
                rowKey="id"
                className="module-table users-admin-table auxiliary-compact-table"
                columns={columns}
                dataSource={filteredRows}
                loading={isLoadingTable}
                pagination={false}
                size="small"
                tableLayout="fixed"
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
                    <Typography.Text strong>Total de registros: {filteredRows.length}</Typography.Text>
                  </div>
                )}
              />
            </div>
          </div>
        </ModuleSectionCard>
      </div>

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={760}
        destroyOnHidden
        forceRender
        className={`terra-password-modal client-modal auxiliary-modal${isAppointmentStatusForm ? " auxiliary-status-modal" : ""}`}
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            {isEditing && isPaymentMethodsTable ? "Alterar forma de pagamento" : activeTable.createTitle}
          </Typography.Title>
        </div>

        <Form<AuxiliaryModalFormValues>
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form client-modal-form auxiliary-modal-form"
          onFinish={() => void handleCreateRecord()}
        >
          <Form.Item name="code" label="Codigo">
            <Input
              placeholder={
                isAppointmentStatusForm
                  ? "Codigo da situacao"
                  : "Codigo interno"
              }
            />
          </Form.Item>

          <Form.Item
            name="name"
            label="Nome"
            rules={[{ required: true, message: "Informe o nome." }]}
          >
            <Input
              placeholder={
                isAppointmentStatusForm
                  ? "Nome da situacao"
                  : "Nome do cadastro"
              }
            />
          </Form.Item>

          <Form.Item name="description" label="Descricao">
            <Input.TextArea
              rows={3}
              placeholder={
                isAppointmentStatusForm
                  ? "Descricao da situacao"
                  : "Descricao operacional"
              }
            />
          </Form.Item>

          {isPaymentMethodsTable && isEditing ? (
            <Form.Item>
              <Checkbox
                checked={editingPaymentMethodIsActive}
                onChange={(event) => setEditingPaymentMethodIsActive(event.target.checked)}
              >
                Forma de pagamento ativa
              </Checkbox>
            </Form.Item>
          ) : null}

          {isAppointmentReasonForm ? (
            <>
              <Form.Item
                name="type"
                label="Tipo"
                rules={[{ required: true, message: "Selecione o tipo do motivo." }]}
              >
                <Select options={reasonTypeOptions} />
              </Form.Item>

              <Form.Item
                name="color"
                label="Cor"
                rules={[
                  {
                    validator: (_, value) => {
                      if (!isCommitmentType || value) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("Selecione uma cor para o motivo do tipo compromisso."));
                    },
                  },
                ]}
              >
                <div
                  className={`auxiliary-color-grid${isCommitmentType ? "" : " is-disabled"}`}
                  role="radiogroup"
                  aria-label="Selecao de cor do motivo"
                  aria-disabled={!isCommitmentType}
                >
                  {reasonColorOptions.map((color) => {
                    const isActive = form.getFieldValue("color") === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        className={`auxiliary-color-swatch${isActive ? " is-active" : ""}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                        aria-pressed={isActive}
                        disabled={!isCommitmentType}
                        onClick={() => form.setFieldValue("color", color)}
                      />
                    );
                  })}
                </div>
              </Form.Item>

              <Form.Item name="productiveCommitment" valuePropName="checked">
                <Checkbox disabled={!isCommitmentType}>Compromisso produtivo</Checkbox>
              </Form.Item>
            </>
          ) : null}

          {isAppointmentStatusForm ? (
            <>
              <Form.Item name="history" label="Historico">
                <Input.TextArea rows={3} placeholder="Texto para inclusao automatica no historico do paciente" />
              </Form.Item>

              <Form.Item name="color" label="Cor">
                <div className="auxiliary-color-grid" role="radiogroup" aria-label="Selecao de cor da situacao">
                  {reasonColorOptions.map((color) => {
                    const isActive = form.getFieldValue("color") === color;

                    return (
                      <button
                        key={color}
                        type="button"
                        className={`auxiliary-color-swatch${isActive ? " is-active" : ""}`}
                        style={{ backgroundColor: color }}
                        aria-label={`Selecionar cor ${color}`}
                        aria-pressed={isActive}
                        onClick={() => form.setFieldValue("color", color)}
                      />
                    );
                  })}
                </div>
              </Form.Item>

              <div className="auxiliary-status-checkboxes">
                <Form.Item name="hideAppointment" valuePropName="checked">
                  <Checkbox>Ocultar agendamento</Checkbox>
                </Form.Item>

                <Form.Item name="considerPatientNoShow" valuePropName="checked">
                  <Checkbox>Considerar falta do cliente</Checkbox>
                </Form.Item>
              </div>
            </>
          ) : null}

          <div className={`terra-password-modal-actions client-modal-actions${isAppointmentStatusForm ? " auxiliary-status-actions" : ""}`}>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              {activeTable.submitLabel}
            </Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
