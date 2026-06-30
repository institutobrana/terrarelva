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
import { useCallback, useEffect, useEffectEvent, useMemo, useRef, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import {
  type AppointmentReasonRecord,
  type AppointmentReasonPayload,
  type AppointmentStatusPayload,
  type AppointmentStatusRecord,
  AuxiliaryTablesApiError,
  createAppointmentReason,
  createAppointmentStatus,
  createAuxiliarySimpleTableEntry,
  createPaymentMethod,
  fetchAppointmentReasons,
  fetchAppointmentStatuses,
  fetchAuxiliarySimpleTable,
  type AuxiliarySimpleRecord,
  type AuxiliarySimpleTableApiId,
  updateAppointmentReason,
  updateAppointmentReasonStatus,
  updateAppointmentStatus,
  updateAppointmentStatusStatus,
  updateAuxiliarySimpleTableEntry,
  updateAuxiliarySimpleTableEntryStatus,
  fetchPaymentMethods,
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
  | "considerClientNoShow";

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
  color?: string | null;
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
  considerClientNoShow?: boolean;
};

type EditingPersistedRecordSnapshot = {
  id: string;
  code: string;
  name: string;
  description: string;
  isActive: boolean;
  color?: string | null;
  type?: "agendamento" | "compromisso";
  productiveCommitment?: boolean;
  history?: string;
  hideAppointment?: boolean;
  considerClientNoShow?: boolean;
};

type PaymentMethodColumnKey = "code" | "name" | "description";

type SortState = {
  key: PaymentMethodColumnKey | null;
  order: "asc" | "desc" | null;
};

type AuxiliaryVisibleColumns = Record<PaymentMethodColumnKey | "color" | "lock" | "status", boolean>;
type AuxiliaryColumnKey = PaymentMethodColumnKey | "color" | "lock" | "status";

const auxiliaryColumnOptions: ReadonlyArray<{ key: AuxiliaryColumnKey; label: string }> = [
  { key: "code", label: "Codigo" },
  { key: "name", label: "Nome" },
  { key: "description", label: "Descricao" },
  { key: "color", label: "Cor" },
  { key: "lock", label: "Bloqueio" },
  { key: "status", label: "Status" },
];

const paymentMethodsShowInactiveStorageKey = "terra-relva-payment-methods-show-inactive";
const simpleAuxiliaryTablesShowInactiveStorageKey = "terra-relva-simple-auxiliary-tables-show-inactive";

const simpleAuxiliaryTableApiIdByTableId: Partial<Record<AuxiliaryTableDefinition["id"], AuxiliarySimpleTableApiId>> = {
  "formas-pagamento": "payment-methods",
  "tipos-indicacao": "indication-types",
  "segmentos-fornecedor": "supplier-segments",
  "grupos-material": "material-groups",
  "ocupacao-cliente": "occupations",
};

const appointmentSpecialTableIdByTableId: Partial<Record<AuxiliaryTableDefinition["id"], "appointment-reasons" | "appointment-statuses">> = {
  "motivos-agendamento": "appointment-reasons",
  "situacoes-agendamento": "appointment-statuses",
};

function readStoredSimpleAuxiliaryTablesShowInactive() {
  if (typeof window === "undefined") {
    return false;
  }

  return window.localStorage.getItem(simpleAuxiliaryTablesShowInactiveStorageKey) === "true";
}

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
    fields: ["code", "name", "description", "history", "color", "hideAppointment", "considerClientNoShow"],
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

const preparedRowsByTable: Record<string, AuxiliaryTableRow[]> = {};

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
      considerClientNoShow: false,
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
  const [showInactive, setShowInactive] = useState(readStoredSimpleAuxiliaryTablesShowInactive);
  const [selectedTableId, setSelectedTableId] = useState("motivos-agendamento");
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoadingTable, setIsLoadingTable] = useState(false);
  const [tableError, setTableError] = useState<string | null>(null);
  const [editingRecordId, setEditingRecordId] = useState<string | null>(null);
  const [editingPersistedRecord, setEditingPersistedRecord] = useState<EditingPersistedRecordSnapshot | null>(null);
  const [editingAuxiliarySimpleIsActive, setEditingAuxiliarySimpleIsActive] = useState(false);
  const editingAuxiliarySimpleIsActiveRef = useRef(false);
  const [simpleAuxiliaryRecords, setSimpleAuxiliaryRecords] = useState<AuxiliarySimpleRecord[]>([]);
  const [appointmentReasonRecords, setAppointmentReasonRecords] = useState<AppointmentReasonRecord[]>([]);
  const [appointmentStatusRecords, setAppointmentStatusRecords] = useState<AppointmentStatusRecord[]>([]);
  const [openFilterColumn, setOpenFilterColumn] = useState<AuxiliaryColumnKey | null>(null);
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
  const simpleAuxiliaryTableApiId = simpleAuxiliaryTableApiIdByTableId[activeTable.id] ?? null;
  const isSimpleAuxiliaryTable = simpleAuxiliaryTableApiId !== null;
  const appointmentSpecialTableApiId = appointmentSpecialTableIdByTableId[activeTable.id] ?? null;
  const isAppointmentReasonTable = appointmentSpecialTableApiId === "appointment-reasons";
  const isAppointmentStatusTable = appointmentSpecialTableApiId === "appointment-statuses";
  const isSpecialPersistedTable = appointmentSpecialTableApiId !== null;
  const isPersistedAuxiliaryTable = isSimpleAuxiliaryTable || isSpecialPersistedTable;
  const tableRows = useMemo(() => {
    if (isSimpleAuxiliaryTable) {
      return simpleAuxiliaryRecords.map<AuxiliaryTableRow>((entry) => ({
        id: entry.id,
        code: entry.codigo,
        name: entry.nome,
        description: entry.descricao,
        isActive: entry.isActive,
      }));
    }

    if (isAppointmentReasonTable) {
      return appointmentReasonRecords.map<AuxiliaryTableRow>((entry) => ({
        id: entry.id,
        code: entry.codigo,
        name: entry.nome,
        description: entry.descricao,
        isActive: entry.isActive,
        color: entry.cor,
      }));
    }

    if (isAppointmentStatusTable) {
      return appointmentStatusRecords.map<AuxiliaryTableRow>((entry) => ({
        id: entry.id,
        code: entry.codigo,
        name: entry.nome,
        description: entry.descricao,
        isActive: entry.isActive,
        color: entry.cor,
      }));
    }

    return preparedRowsByTable[activeTable.id] ?? [];
  }, [activeTable.id, appointmentReasonRecords, appointmentStatusRecords, isAppointmentReasonTable, isAppointmentStatusTable, isSimpleAuxiliaryTable, simpleAuxiliaryRecords]);
  const filteredRows = useMemo(() => {
    const nextRows = tableRows.filter((row) => {
      if (!showInactive && !row.isActive) {
        return false;
      }

      if (!isPersistedAuxiliaryTable) {
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

    if (!isPersistedAuxiliaryTable || !sortState.key || !sortState.order) {
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
  }, [columnQueries, isPersistedAuxiliaryTable, showInactive, sortState, tableRows]);

  const setEditingPaymentMethodActiveState = useCallback((value: boolean) => {
    editingAuxiliarySimpleIsActiveRef.current = value;
    setEditingAuxiliarySimpleIsActive(value);
  }, []);
  const selectedRow = filteredRows.find((row) => row.id === selectedRowId) ?? null;
  const selectedReasonType = Form.useWatch("type", form);
  const isCommitmentType = selectedReasonType === "compromisso";
  const isAppointmentReasonForm = activeTable.formKind === "appointment-reason";
  const isAppointmentStatusForm = activeTable.formKind === "appointment-status";
  const isEditing = editingRecordId !== null;

  const renderFilterDropdown = useCallback((columnKey: AuxiliaryColumnKey, label: string) => {
    const supportsOrdering = columnKey === "code" || columnKey === "name" || columnKey === "description";

    return (
      <div className="auxiliary-filter-menu" onClick={(event) => event.stopPropagation()}>
        <Typography.Text strong className="auxiliary-filter-menu-title">
          {label}
        </Typography.Text>
        {supportsOrdering ? (
          <>
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
          </>
        ) : null}
        <div className="auxiliary-filter-menu-subtitle">Colunas</div>
        <div className="auxiliary-filter-menu-columns">
          {auxiliaryColumnOptions.map(({ key, label: columnLabel }) => {
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
    );
  }, [sortState, visibleColumns]);

  const renderFilterTitle = useCallback((columnKey: AuxiliaryColumnKey, label: string, options?: { hideLabel?: boolean }) => {
    const isMainFilterColumn = columnKey === "code" || columnKey === "name" || columnKey === "description";
    const hasQuery = isMainFilterColumn && columnQueries[columnKey].trim().length > 0;
    const isSorted = isMainFilterColumn && sortState.key === columnKey && sortState.order;
    const hideLabel = options?.hideLabel === true;

    return (
      <div className={`auxiliary-filter-header${hideLabel ? " is-icon-only" : ""}`}>
        {hideLabel ? null : <span>{label}</span>}
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
  }, [columnQueries, openFilterColumn, renderFilterDropdown, sortState]);

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
        width: isPersistedAuxiliaryTable ? "30%" : "34%",
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
          if (isPersistedAuxiliaryTable) {
            return <span className="auxiliary-table-description">{value ?? ""}</span>;
          }

          return <span className="auxiliary-table-description">{value ?? "Preparado para backend"}</span>;
        },
      });
    }

    if (visibleColumns.color) {
      nextColumns.push({
        title: renderFilterTitle("color", "Cor", { hideLabel: true }),
        dataIndex: "color",
        key: "color",
        width: 34,
        align: "center",
        className: "auxiliary-table-technical-column",
        render: (_value, row) => (
          <span className="auxiliary-table-color-cell">
            <span
              className={`auxiliary-table-color-swatch${row.color ? "" : " is-empty"}`}
              aria-hidden="true"
              style={row.color ? { backgroundColor: row.color } : undefined}
            />
          </span>
        ),
      });
    }

    if (visibleColumns.lock) {
      nextColumns.push({
        title: renderFilterTitle("lock", "Bloqueio", { hideLabel: true }),
        dataIndex: "lock",
        key: "lock",
        width: 34,
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
        title: renderFilterTitle("status", "Status", { hideLabel: true }),
        dataIndex: "isActive",
        key: "status",
        width: 34,
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
  }, [isPersistedAuxiliaryTable, renderFilterTitle, visibleColumns]);

  const handleOpenModal = useCallback(() => {
    form.resetFields();
    setEditingRecordId(null);
    setEditingPersistedRecord(null);
    setEditingPaymentMethodActiveState(false);
    setOpenFilterColumn(null);
    setIsModalOpen(true);
  }, [form, setEditingPaymentMethodActiveState]);

  const handleCloseModal = () => {
    setIsModalOpen(false);
    setEditingRecordId(null);
    setEditingPersistedRecord(null);
    setEditingPaymentMethodActiveState(false);
    setOpenFilterColumn(null);
    form.resetFields();
  };

  const loadActiveTableRecords = useEffectEvent(async () => {
    if (!isPersistedAuxiliaryTable) {
      return;
    }

    setIsLoadingTable(true);
    setTableError(null);

    try {
      let records: AuxiliaryTableRow[] = [];
      if (simpleAuxiliaryTableApiId === "payment-methods") {
        const payload = await fetchPaymentMethods();
        setSimpleAuxiliaryRecords(payload.paymentMethods);
        setAppointmentReasonRecords([]);
        setAppointmentStatusRecords([]);
        records = payload.paymentMethods.map((entry) => ({
          id: entry.id,
          code: entry.codigo,
          name: entry.nome,
          description: entry.descricao,
          isActive: entry.isActive,
        }));
      } else {
        if (simpleAuxiliaryTableApiId) {
          const payload = await fetchAuxiliarySimpleTable(simpleAuxiliaryTableApiId);
          setSimpleAuxiliaryRecords(payload.records);
          setAppointmentReasonRecords([]);
          setAppointmentStatusRecords([]);
          records = payload.records.map((entry) => ({
            id: entry.id,
            code: entry.codigo,
            name: entry.nome,
            description: entry.descricao,
            isActive: entry.isActive,
          }));
        } else if (appointmentSpecialTableApiId === "appointment-reasons") {
          const payload = await fetchAppointmentReasons();
          setSimpleAuxiliaryRecords([]);
          setAppointmentReasonRecords(payload.appointmentReasons);
          setAppointmentStatusRecords([]);
          records = payload.appointmentReasons.map((entry) => ({
            id: entry.id,
            code: entry.codigo,
            name: entry.nome,
            description: entry.descricao,
            isActive: entry.isActive,
            color: entry.cor,
          }));
        } else if (appointmentSpecialTableApiId === "appointment-statuses") {
          const payload = await fetchAppointmentStatuses();
          setSimpleAuxiliaryRecords([]);
          setAppointmentReasonRecords([]);
          setAppointmentStatusRecords(payload.appointmentStatuses);
          records = payload.appointmentStatuses.map((entry) => ({
            id: entry.id,
            code: entry.codigo,
            name: entry.nome,
            description: entry.descricao,
            isActive: entry.isActive,
            color: entry.cor,
          }));
        }
      }
      setSelectedRowId((currentSelection) => (
        records.some((entry) => entry.id === currentSelection) ? currentSelection : records[0]?.id ?? null
      ));
    } catch (error) {
      const nextMessage = error instanceof AuxiliaryTablesApiError || error instanceof Error
        ? error.message
        : `Nao foi possivel carregar ${activeTable.label.toLowerCase()}.`;
      setTableError(nextMessage);
    } finally {
      setIsLoadingTable(false);
    }
  });

  const handleCreateRecord = async () => {
    if (isSubmitting) {
      return;
    }

    try {
      setIsSubmitting(true);

      if (isSimpleAuxiliaryTable) {
        const values = form.getFieldsValue(["code", "name", "description"]);
        const normalizedName = typeof values.name === "string" ? values.name.trim() : "";
        if (!normalizedName) {
          form.setFields([
            {
              name: "name",
              errors: ["Informe o nome."],
            },
          ]);
          return;
        }

        const payload = {
          codigo: typeof values.code === "string" ? values.code.trim() || undefined : undefined,
          nome: normalizedName,
          descricao: typeof values.description === "string" ? values.description.trim() || undefined : undefined,
        };

        if (editingRecordId) {
          const nextIsActive = editingAuxiliarySimpleIsActiveRef.current;
          if (simpleAuxiliaryTableApiId === "payment-methods") {
            await updatePaymentMethod(editingRecordId, payload);
          } else if (simpleAuxiliaryTableApiId) {
            await updateAuxiliarySimpleTableEntry(simpleAuxiliaryTableApiId, editingRecordId, payload);
          }
          const statusChanged = editingPersistedRecord ? editingPersistedRecord.isActive !== nextIsActive : false;
          if (statusChanged) {
            if (simpleAuxiliaryTableApiId === "payment-methods") {
              await updatePaymentMethodStatus(editingRecordId, nextIsActive);
            } else if (simpleAuxiliaryTableApiId) {
              await updateAuxiliarySimpleTableEntryStatus(simpleAuxiliaryTableApiId, editingRecordId, nextIsActive);
            }
            if (!nextIsActive && !showInactive) {
              setShowInactive(true);
            }
          }
          apiMessage.success(`${activeTable.label}: cadastro atualizado com sucesso.`);
        } else {
          if (simpleAuxiliaryTableApiId === "payment-methods") {
            await createPaymentMethod(payload);
          } else if (simpleAuxiliaryTableApiId) {
            await createAuxiliarySimpleTableEntry(simpleAuxiliaryTableApiId, payload);
          }
          apiMessage.success(`${activeTable.label}: cadastro criado com sucesso.`);
        }

        await loadActiveTableRecords();
        handleCloseModal();
        return;
      }

      if (isSpecialPersistedTable) {
        const values = await form.validateFields();

        if (isAppointmentReasonTable) {
          const payload: AppointmentReasonPayload = {
            codigo: typeof values.code === "string" ? values.code.trim() || undefined : undefined,
            nome: values.name.trim(),
            descricao: typeof values.description === "string" ? values.description.trim() || undefined : undefined,
            tipo: values.type ?? "agendamento",
            cor: typeof values.color === "string" ? values.color : undefined,
            compromissoProdutivo: values.productiveCommitment === true,
          };

          if (editingRecordId) {
            const nextIsActive = editingAuxiliarySimpleIsActiveRef.current;
            await updateAppointmentReason(editingRecordId, payload);
            const statusChanged = editingPersistedRecord ? editingPersistedRecord.isActive !== nextIsActive : false;
            if (statusChanged) {
              await updateAppointmentReasonStatus(editingRecordId, nextIsActive);
              if (!nextIsActive && !showInactive) {
                setShowInactive(true);
              }
            }
            apiMessage.success("Motivo de agendamento atualizado com sucesso.");
          } else {
            await createAppointmentReason(payload);
            apiMessage.success("Motivo de agendamento criado com sucesso.");
          }
        } else if (isAppointmentStatusTable) {
          const payload: AppointmentStatusPayload = {
            codigo: typeof values.code === "string" ? values.code.trim() || undefined : undefined,
            nome: values.name.trim(),
            descricao: typeof values.description === "string" ? values.description.trim() || undefined : undefined,
            historico: typeof values.history === "string" ? values.history.trim() || undefined : undefined,
            cor: typeof values.color === "string" ? values.color : undefined,
            ocultarAgendamento: values.hideAppointment === true,
            considerarFaltaCliente: values.considerClientNoShow === true,
          };

          if (editingRecordId) {
            const nextIsActive = editingAuxiliarySimpleIsActiveRef.current;
            await updateAppointmentStatus(editingRecordId, payload);
            const statusChanged = editingPersistedRecord ? editingPersistedRecord.isActive !== nextIsActive : false;
            if (statusChanged) {
              await updateAppointmentStatusStatus(editingRecordId, nextIsActive);
              if (!nextIsActive && !showInactive) {
                setShowInactive(true);
              }
            }
            apiMessage.success("Situacao de agendamento atualizada com sucesso.");
          } else {
            await createAppointmentStatus(payload);
            apiMessage.success("Situacao de agendamento criada com sucesso.");
          }
        }

        await loadActiveTableRecords();
        handleCloseModal();
        return;
      }
    } catch (error) {
      if (error instanceof AuxiliaryTablesApiError) {
        apiMessage.error(error.message);
        return;
      }

      if (error instanceof Error) {
        apiMessage.error(error.message);
        return;
      }

      apiMessage.error("Nao foi possivel concluir a gravacao.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSavePaymentMethodEdit = async () => {
    if (isSubmitting) {
      return;
    }

    if (!isPersistedAuxiliaryTable || !editingRecordId) {
      await handleCreateRecord();
      return;
    }

    try {
      setIsSubmitting(true);

      await handleCreateRecord();
    } catch (error) {
      if (error instanceof AuxiliaryTablesApiError) {
        apiMessage.error(error.message);
        return;
      }

      if (error instanceof Error) {
        apiMessage.error(error.message);
        return;
      }

      apiMessage.error("Nao foi possivel concluir a gravacao.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSaveGenericModal = async () => {
    if (isSubmitting) {
      return;
    }

    await form.validateFields();
    await handleCreateRecord();
  };

  const handleOpenEditModal = useEffectEvent(() => {
    if (!selectedRow) {
      apiMessage.warning("Selecione um registro para alterar.");
      return;
    }

    if (!selectedRow) {
      apiMessage.error(`${activeTable.label}: registro selecionado nao encontrado.`);
      return;
    }

    setEditingRecordId(selectedRow.id);

    if (isAppointmentReasonTable) {
      const matchingRecord = appointmentReasonRecords.find((entry) => entry.id === selectedRow.id);
      setEditingPersistedRecord({
        id: selectedRow.id,
        code: selectedRow.code ?? "",
        name: selectedRow.name,
        description: selectedRow.description ?? "",
        isActive: selectedRow.isActive,
        color: matchingRecord?.cor ?? null,
        type: matchingRecord?.tipo,
        productiveCommitment: matchingRecord?.compromissoProdutivo === true,
      });
    } else if (isAppointmentStatusTable) {
      const matchingRecord = appointmentStatusRecords.find((entry) => entry.id === selectedRow.id);
      setEditingPersistedRecord({
        id: selectedRow.id,
        code: selectedRow.code ?? "",
        name: selectedRow.name,
        description: selectedRow.description ?? "",
        isActive: selectedRow.isActive,
        color: matchingRecord?.cor ?? null,
        history: matchingRecord?.historico ?? "",
        hideAppointment: matchingRecord?.ocultarAgendamento === true,
        considerClientNoShow: matchingRecord?.considerarFaltaCliente === true,
      });
    } else {
      setEditingPersistedRecord({
        id: selectedRow.id,
        code: selectedRow.code ?? "",
        name: selectedRow.name,
        description: selectedRow.description ?? "",
        isActive: selectedRow.isActive,
      });
    }
    setEditingPaymentMethodActiveState(Boolean(selectedRow.isActive));
    setOpenFilterColumn(null);
    setIsModalOpen(true);
  });

  useEffect(() => {
    if (isPersistedAuxiliaryTable) {
      void loadActiveTableRecords();
      return;
    }

    setTableError(null);
    setIsLoadingTable(false);
    setSimpleAuxiliaryRecords([]);
    setAppointmentReasonRecords([]);
    setAppointmentStatusRecords([]);
  }, [appointmentSpecialTableApiId, isPersistedAuxiliaryTable, simpleAuxiliaryTableApiId]);

  useEffect(() => {
    if (!isPersistedAuxiliaryTable || typeof window === "undefined") {
      return;
    }

    const storageKey = isPaymentMethodsTable
      ? paymentMethodsShowInactiveStorageKey
      : simpleAuxiliaryTablesShowInactiveStorageKey;
    window.localStorage.setItem(storageKey, showInactive ? "true" : "false");
  }, [isPaymentMethodsTable, isPersistedAuxiliaryTable, showInactive]);

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
    setShowInactive(
      isPaymentMethodsTable
        ? (typeof window !== "undefined" && window.localStorage.getItem(paymentMethodsShowInactiveStorageKey) === "true")
        : readStoredSimpleAuxiliaryTablesShowInactive(),
    );
    setVisibleColumns({
      code: true,
      name: true,
      description: true,
      color: true,
      lock: true,
      status: true,
    });
  }, [isPaymentMethodsTable, selectedTableId]);

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

    if (isPersistedAuxiliaryTable && editingRecordId) {
      if (!editingPersistedRecord || editingPersistedRecord.id !== editingRecordId) {
        return;
      }

      form.setFieldsValue({
        code: editingPersistedRecord.code,
        name: editingPersistedRecord.name,
        description: editingPersistedRecord.description,
        type: editingPersistedRecord.type,
        color: editingPersistedRecord.color ?? undefined,
        productiveCommitment: editingPersistedRecord.productiveCommitment,
        history: editingPersistedRecord.history,
        hideAppointment: editingPersistedRecord.hideAppointment,
        considerClientNoShow: editingPersistedRecord.considerClientNoShow,
      });
      setEditingPaymentMethodActiveState(editingPersistedRecord.isActive);
      return;
    }

    form.setFieldsValue(buildDefaultValues(activeTable));
  }, [activeTable, editingPersistedRecord, editingRecordId, form, isModalOpen, isPersistedAuxiliaryTable, setEditingPaymentMethodActiveState]);

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
        footer={isPersistedAuxiliaryTable ? [
          <Button key="save-payment-method" type="primary" loading={isSubmitting} onClick={() => void handleSavePaymentMethodEdit()}>
            {activeTable.submitLabel}
          </Button>,
          <Button key="cancel-payment-method" onClick={handleCloseModal}>
            Cancelar
          </Button>,
        ] : null}
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
            {isEditing ? `Alterar ${activeTable.label.toLowerCase()}` : activeTable.createTitle}
          </Typography.Title>
        </div>

        <Form<AuxiliaryModalFormValues>
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form client-modal-form auxiliary-modal-form"
        >
          <Form.Item name="code" label="Codigo">
            <Input
              placeholder={
                isAppointmentReasonForm
                  ? "Codigo do motivo"
                  : isAppointmentStatusForm
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
                isAppointmentReasonForm
                  ? "Nome do motivo"
                  : isAppointmentStatusForm
                  ? "Nome da situacao"
                  : "Nome do cadastro"
              }
            />
          </Form.Item>

          <Form.Item name="description" label="Descricao">
            <Input.TextArea
              rows={3}
              placeholder={
                isAppointmentReasonForm
                  ? "Descricao do motivo"
                  : isAppointmentStatusForm
                  ? "Descricao da situacao"
                  : "Descricao operacional"
              }
            />
          </Form.Item>

          {isPersistedAuxiliaryTable && isEditing ? (
            <Form.Item>
              <Checkbox
                checked={editingAuxiliarySimpleIsActive}
                onChange={(event) => setEditingPaymentMethodActiveState(event.target.checked)}
              >
                {isAppointmentReasonTable
                  ? "Motivo de agendamento ativo"
                  : isAppointmentStatusTable
                    ? "Situacao ativa"
                    : `${activeTable.label} ativo`}
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
                <Input.TextArea rows={3} placeholder="Texto para inclusao automatica no historico do cliente" />
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

                <Form.Item name="considerClientNoShow" valuePropName="checked">
                  <Checkbox>Considerar falta do cliente</Checkbox>
                </Form.Item>
              </div>
            </>
          ) : null}

          {isPersistedAuxiliaryTable ? null : (
            <div className={`terra-password-modal-actions client-modal-actions${isAppointmentStatusForm ? " auxiliary-status-actions" : ""}`}>
              <Button
                type="primary"
                htmlType="button"
                loading={isSubmitting}
                onClick={() => void handleSaveGenericModal()}
              >
                {activeTable.submitLabel}
              </Button>
              <Button onClick={handleCloseModal}>Cancelar</Button>
            </div>
          )}
        </Form>
      </Modal>
    </div>
  );
}
