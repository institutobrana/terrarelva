import {
  CloseOutlined,
  EditOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, Form, Input, InputNumber, Modal, Select, Space, Table, Typography, message } from "antd";
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
} from "@/services/auxiliaryTables/auxiliaryTablesApi";

type AuxiliaryFormKind = "appointment-reason" | "appointment-status" | "procedure-phase" | "simple";

type AuxiliaryField =
  | "code"
  | "name"
  | "description"
  | "type"
  | "color"
  | "productiveCommitment"
  | "history"
  | "hideAppointment"
  | "considerPatientNoShow"
  | "executionTimeMinutes";

type AuxiliaryTableDefinition = {
  id: string;
  label: string;
  emptyMessage: string;
  createLabel: string;
  createTitle: string;
  submitLabel: string;
  formKind: AuxiliaryFormKind;
  fields: AuxiliaryField[];
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
  type?: "agendamento" | "compromisso";
  color?: string;
  productiveCommitment?: boolean;
  history?: string;
  hideAppointment?: boolean;
  considerPatientNoShow?: boolean;
  executionTimeMinutes?: number | null;
};

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
    id: "motivos-retorno",
    label: "Motivos de retorno",
    emptyMessage: "Nenhum motivo de retorno carregado ainda.",
    createLabel: "Novo motivo",
    createTitle: "Novo motivo de retorno",
    submitLabel: "Gravar motivo",
    formKind: "simple",
    fields: ["code", "name", "description"],
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
    id: "especialidades",
    label: "Especialidades",
    emptyMessage: "Nenhuma especialidade carregada ainda.",
    createLabel: "Nova especialidade",
    createTitle: "Nova especialidade",
    submitLabel: "Gravar especialidade",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "fases-procedimento",
    label: "Fases de procedimento",
    emptyMessage: "Nenhuma fase de procedimento carregada ainda.",
    createLabel: "Nova fase",
    createTitle: "Nova fase de procedimento",
    submitLabel: "Gravar fases",
    formKind: "procedure-phase",
    fields: ["code", "name", "executionTimeMinutes", "description"],
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
    id: "motivos-finalizacao",
    label: "Motivos de finalizacao do tratamento",
    emptyMessage: "Nenhum motivo de finalizacao carregado ainda.",
    createLabel: "Novo motivo",
    createTitle: "Novo motivo de finalizacao do tratamento",
    submitLabel: "Gravar motivo",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "solucoes-irrigadoras",
    label: "Solucoes irrigadoras",
    emptyMessage: "Nenhuma solucao irrigadora carregada ainda.",
    createLabel: "Nova solucao",
    createTitle: "Nova solucao irrigadora",
    submitLabel: "Gravar solucao",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "cimentos-obturadores",
    label: "Cimentos obturadores",
    emptyMessage: "Nenhum cimento obturador carregado ainda.",
    createLabel: "Novo cimento",
    createTitle: "Novo cimento obturador",
    submitLabel: "Gravar cimento",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "limas-memorias",
    label: "Limas memorias",
    emptyMessage: "Nenhuma lima memoria carregada ainda.",
    createLabel: "Nova lima",
    createTitle: "Nova lima memoria",
    submitLabel: "Gravar lima",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "sistemas-instrumentacao",
    label: "Sistemas de instrumentacao",
    emptyMessage: "Nenhum sistema de instrumentacao carregado ainda.",
    createLabel: "Novo sistema",
    createTitle: "Novo sistema de instrumentacao",
    submitLabel: "Gravar sistema",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "medicacoes-intracanais",
    label: "Medicacoes intracanais",
    emptyMessage: "Nenhuma medicacao intracanal carregada ainda.",
    createLabel: "Nova medicacao",
    createTitle: "Nova medicacao intracanal",
    submitLabel: "Gravar medicacao",
    formKind: "simple",
    fields: ["code", "name", "description"],
  },
  {
    id: "ocupacao-paciente",
    label: "Ocupacao/profissao do paciente",
    emptyMessage: "Nenhuma ocupacao/profissao carregada ainda.",
    createLabel: "Nova ocupacao",
    createTitle: "Nova ocupacao/profissao do paciente",
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

  if (table.formKind === "procedure-phase") {
    return {
      code: "",
      name: "",
      executionTimeMinutes: null,
      description: "",
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
  const [selectedTableId, setSelectedTableId] = useState("especialidades");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodRecord[]>([]);
  const [apiMessage, messageContext] = message.useMessage();
  const [form] = Form.useForm<AuxiliaryModalFormValues>();

  const activeTable = auxiliaryTables.find((item) => item.id === selectedTableId) ?? auxiliaryTables[0];
  const isPaymentMethodsTable = activeTable.id === "formas-pagamento";
  const tableRows = useMemo(() => {
    if (isPaymentMethodsTable) {
      return paymentMethods.map<AuxiliaryTableRow>((entry) => ({
        id: entry.id,
        code: entry.codigo,
        name: entry.nome,
        description: entry.descricao,
        isActive: entry.ativo,
      }));
    }

    return preparedRowsByTable[activeTable.id] ?? [];
  }, [activeTable.id, isPaymentMethodsTable, paymentMethods]);
  const visibleRows = useMemo(() => tableRows.filter((row) => (showInactive ? true : row.isActive)), [showInactive, tableRows]);
  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const selectedReasonType = Form.useWatch("type", form);
  const isCommitmentType = selectedReasonType === "compromisso";
  const isAppointmentReasonForm = activeTable.formKind === "appointment-reason";
  const isAppointmentStatusForm = activeTable.formKind === "appointment-status";
  const isProcedurePhaseForm = activeTable.formKind === "procedure-phase";
  const isEditing = editingRecordId !== null;

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

  const handleOpenModal = useCallback(() => {
    form.setFieldsValue(buildDefaultValues(activeTable));
    setEditingRecordId(null);
    setIsModalOpen(true);
  }, [activeTable, form]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecordId(null);
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

    const paymentMethod = paymentMethods.find((entry) => entry.id === selectedRow.id);
    if (!paymentMethod) {
      apiMessage.error("Forma de pagamento selecionada nao encontrada.");
      return;
    }

    setEditingRecordId(paymentMethod.id);
    form.setFieldsValue({
      code: paymentMethod.codigo,
      name: paymentMethod.nome,
      description: paymentMethod.descricao ?? "",
    });
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
                className="module-table users-admin-table"
                columns={columns}
                dataSource={visibleRows}
                loading={isLoadingTable}
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

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={760}
        destroyOnHidden
        className={`terra-password-modal client-modal auxiliary-modal${isAppointmentStatusForm || isProcedurePhaseForm ? " auxiliary-status-modal" : ""}`}
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
          initialValues={buildDefaultValues(activeTable)}
          onFinish={() => void handleCreateRecord()}
        >
          <Form.Item name="code" label="Codigo">
            <Input
              placeholder={
                isAppointmentStatusForm
                  ? "Codigo da situacao"
                  : isPaymentMethodsTable
                    ? "Codigo interno"
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
                  : isProcedurePhaseForm
                    ? "Nome da fase"
                    : "Nome do cadastro"
              }
            />
          </Form.Item>

          {isProcedurePhaseForm ? (
            <Form.Item
              name="executionTimeMinutes"
              label="Tempo de execucao"
              rules={[
                {
                  validator: (_, value) => {
                    if (value === null || value === undefined || value === "") {
                      return Promise.resolve();
                    }

                    if (Number(value) >= 0) {
                      return Promise.resolve();
                    }

                    return Promise.reject(new Error("Informe um tempo maior ou igual a zero."));
                  },
                },
              ]}
            >
              <div className="auxiliary-duration-field">
                <InputNumber min={0} precision={0} placeholder="Tempo medio de execucao" className="auxiliary-duration-input" />
                <span className="auxiliary-duration-unit">min</span>
              </div>
            </Form.Item>
          ) : null}

          <Form.Item name="description" label="Descricao">
            <Input.TextArea
              rows={3}
              placeholder={
                isAppointmentStatusForm
                  ? "Descricao da situacao"
                  : isProcedurePhaseForm
                    ? "Descricao da fase"
                    : "Descricao operacional"
              }
            />
          </Form.Item>

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
                  <Checkbox>Considerar falta do paciente</Checkbox>
                </Form.Item>
              </div>
            </>
          ) : null}

          <div className={`terra-password-modal-actions client-modal-actions${isAppointmentStatusForm || isProcedurePhaseForm ? " auxiliary-status-actions" : ""}`}>
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
