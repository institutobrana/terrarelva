import {
  AppstoreOutlined,
  CloseOutlined,
  DownOutlined,
  FileTextOutlined,
  FilterOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
  CheckOutlined,
} from "@ant-design/icons";
import { Alert, AutoComplete, Button, Checkbox, Dropdown, Form, Input, Modal, Select, Table, Tabs, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import { useCallback, useEffect, useEffectEvent, useLayoutEffect, useMemo, useState } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import { SupplierImageCapture } from "@/pages/admin/SupplierImageCapture";
import { fetchAuxiliarySimpleTable, type AuxiliarySimpleRecord } from "@/services/auxiliaryTables/auxiliaryTablesApi";
import {
  createSupplierAddress,
  createSupplier,
  createSupplierEmail,
  createSupplierPhone,
  checkDeleteSupplier,
  deleteSupplier,
  fetchSupplierById,
  fetchSuppliers,
  RegistryApiError,
  replaceAndDeleteSupplier,
  uploadSupplierImage,
  updateSupplier,
  type SupplierRecord,
} from "@/services/registry/registryApi";

const segmentOptions = [
  { label: "Todos os segmentos", value: "all" },
  { label: "Sem filtro", value: "prepared" },
];

const ADDRESS_TYPE_OPTIONS = [
  "Atendimento",
  "Cobrança",
  "Comercial",
  "Residencial",
];

const PHONE_TYPE_OPTIONS = [
  "Bip/Pager",
  "Celular",
  "Comercial",
  "Emergência",
  "Fax",
  "Recado",
  "Residencial",
];

const EMAIL_TYPE_OPTIONS = [
  "Corporativo",
  "Pessoal",
];

const UF_OPTIONS = [
  "AC", "AL", "AP", "AM", "BA", "CE", "DF", "ES", "GO", "MA",
  "MT", "MS", "MG", "PA", "PB", "PR", "PE", "PI", "RJ", "RN",
  "RS", "RO", "RR", "SC", "SP", "SE", "TO",
  "XX",
];

const LOGRADOURO_OPTIONS = [
  "AL", "AV", "R", "A", "AC", "ACAMP", "AD", "AER", "ART", "AT", "ATL", "BAL", "BC", "BCO", "BELV", "BL", "BLO",
  "BSQ", "BVD", "BX", "C", "CALC", "CAM", "CAN", "CH", "CHAP", "CIRC", "CJ", "CMP-VR", "COL", "COND", "COR",
  "CPO", "CRG", "DSC", "DSV", "DT", "ENT-PART", "ESC", "ESP", "EST", "ESTC", "ETC", "ETD", "ETN", "EVD", "FAV",
  "FAZ", "FER", "FNT", "FRA", "FTE", "GAL", "GJA", "HAB", "IA", "JD", "JDE", "LD", "LG", "LGA", "LOT", "LRG",
  "MNA", "MOD", "MRO", "MTE", "NUC", "PAR", "PAS", "PAT", "PC", "PC-ESP", "PDA", "PDO", "PNT", "POV", "PR", "PRL",
  "PRQ", "PSA", "PSG", "PSG-SUB", "PTE", "PTO", "Q", "QTA", "QTAS", "RAM", "REC", "RER", "RES", "RET", "RMP",
  "ROD", "ROD-AN", "ROT", "R-PED", "RTN", "RTT", "SIT", "SRV", "ST", "SUB", "TCH", "TER", "TR", "TRV", "TUN",
  "TV", "TV-PART", "UNID", "V", "V-AC", "VAL", "VD", "VER", "V-EVD", "V-EXP", "VL", "VLA", "VLE", "V-PED",
  "VRTE", "ZIG-ZAG",
];

const makeComboOptions = (items: string[]) => items.map((value) => ({ value }));
const addressTypeOptions = makeComboOptions(ADDRESS_TYPE_OPTIONS);
const phoneTypeComboOptions = makeComboOptions(PHONE_TYPE_OPTIONS);
const emailTypeComboOptions = makeComboOptions(EMAIL_TYPE_OPTIONS);
const ufOptions = makeComboOptions(UF_OPTIONS);
const addressLogradouroSuggestions = makeComboOptions(LOGRADOURO_OPTIONS);
const emptyComboOptions: { value: string }[] = [];

type SupplierFormValues = {
  supplierName: string;
  companyName: string | undefined;
  document: string | undefined;
  stateRegistration: string | undefined;
  portal: string | undefined;
  segment: string | undefined;
  paymentDetails: string | undefined;
  notes: string | undefined;
  isActive: boolean;
  phonePrimaryType: string | undefined;
  phonePrimaryDdd: string | undefined;
  phonePrimaryNumber: string | undefined;
  phonePrimaryExtension: string | undefined;
  phoneSecondaryType: string | undefined;
  phoneSecondaryDdd: string | undefined;
  phoneSecondaryNumber: string | undefined;
  phoneSecondaryExtension: string | undefined;
  emailPrimaryType: string | undefined;
  emailPrimaryAddress: string | undefined;
};

type ContactRow = {
  id: string;
  type: string;
  main: string;
  detail: string;
  note: string | null;
};

type SupplierEditSnapshot = {
  trade_name: string;
  company_name: string | null;
  cpf_cnpj: string | null;
  state_registration: string | null;
  website: string | null;
  segment_text: string | null;
  payment_details: string | null;
  notes: string | null;
  is_active: boolean;
  emailPrimaryAddress: string | undefined;
  addresses: ContactRow[];
  phones: ContactRow[];
  emails: ContactRow[];
};

type SupplierImageState = {
  previewUrl: string | null;
  imageUrl: string | null;
  fileName: string | null;
};

type SupplierDetailsSnapshot = {
  id: string;
  trade_name: string;
  company_name: string | null;
  cpf_cnpj: string | null;
  state_registration: string | null;
  website: string | null;
  segment_text: string | null;
  payment_details: string | null;
  notes: string | null;
  is_active: boolean;
  image_url: string | null;
  created_at: string;
  updated_at: string;
  addresses: ContactRow[];
  phones: ContactRow[];
  emails: ContactRow[];
};

type SupplierAddressModalState = {
  cep: string;
  type: string;
  streetType: string;
  number: string;
  complement: string;
  state: string;
  city: string;
  neighborhood: string;
};

type SupplierColumnKey = "name" | "supplier" | "document" | "phone" | "email" | "status";
type SupplierVisibleColumns = Record<SupplierColumnKey, boolean>;
type SupplierSortState = { key: SupplierColumnKey | null; order: "asc" | "desc" | null };

const supplierColumnOptions: ReadonlyArray<{ key: SupplierColumnKey; label: string }> = [
  { key: "name", label: "Nome do fornecedor" },
  { key: "supplier", label: "Fornecedor" },
  { key: "document", label: "CPF/CNPJ" },
  { key: "phone", label: "Telefone" },
  { key: "email", label: "E-mail" },
  { key: "status", label: "Status" },
];

function mapAddressRow(row: {
  id: string;
  address_type_text: string | null;
  street: string | null;
  number: string | null;
  complement: string | null;
  district: string | null;
  city: string | null;
  state: string | null;
  is_primary: boolean;
}) {
  const line1 = [row.street ?? "", row.number ?? ""].filter(Boolean).join(", ");
  return {
    id: row.id,
    type: row.address_type_text ?? "-",
    main: row.is_primary ? "Sim" : "Nao",
    detail: line1 || "-",
    note: [row.complement ?? "", row.district ?? "", [row.city ?? "", row.state ?? ""].filter(Boolean).join(" - ")].filter(Boolean).join(" | "),
  };
}

function mapPhoneRow(row: {
  id: string;
  phone_type_text: string | null;
  ddd: string | null;
  phone_number: string;
  extension: string | null;
  is_primary: boolean;
}) {
  return {
    id: row.id,
    type: row.phone_type_text ?? "-",
    main: row.is_primary ? "Sim" : "Nao",
    detail: [row.ddd ? `(${row.ddd})` : null, row.phone_number].filter(Boolean).join(" ") || "-",
    note: row.extension ? `ramal ${row.extension}` : null,
  };
}

function mapEmailRow(row: {
  id: string;
  email_type_text: string | null;
  email: string;
  is_primary: boolean;
}) {
  return {
    id: row.id,
    type: row.email_type_text ?? "-",
    main: row.is_primary ? "Sim" : "Nao",
    detail: row.email || "-",
    note: null,
  };
}

export function CadastroFornecedoresPage() {
  const { user: currentUser } = useAuth();
  const { setShellBandContent } = useAdminShellBand();
  const [form] = Form.useForm<SupplierFormValues>();
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [isPhoneModalOpen, setIsPhoneModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isDeleteConfirmOpen, setIsDeleteConfirmOpen] = useState(false);
  const [isReplaceDeleteOpen, setIsReplaceDeleteOpen] = useState(false);
  const [replacementSupplierId, setReplacementSupplierId] = useState<string | undefined>(undefined);
  const [supplierDetails, setSupplierDetails] = useState<SupplierDetailsSnapshot | null>(null);
  const [isDetailsModalOpen, setIsDetailsModalOpen] = useState(false);
  const [addressModalState, setAddressModalState] = useState<SupplierAddressModalState>({
    cep: "",
    type: "Comercial",
    streetType: "",
    number: "",
    complement: "",
    state: "",
    city: "",
    neighborhood: "",
  });
  const [addressStreetPlaceholder, setAddressStreetPlaceholder] = useState("Logradouro");
  const [addressCepFeedback, setAddressCepFeedback] = useState<string | null>(null);
  const [isCepGenerico, setIsCepGenerico] = useState(false);
  const [addressRows, setAddressRows] = useState<ContactRow[]>([]);
  const [phoneRows, setPhoneRows] = useState<ContactRow[]>([]);
  const [emailRows, setEmailRows] = useState<ContactRow[]>([]);
  const [supplierImage, setSupplierImage] = useState<SupplierImageState>({
    previewUrl: null,
    imageUrl: null,
    fileName: null,
  });
  const [editingSupplier, setEditingSupplier] = useState<SupplierEditSnapshot | null>(null);
  const [supplierSegmentRecords, setSupplierSegmentRecords] = useState<AuxiliarySimpleRecord[]>([]);
  const [openSupplierColumn, setOpenSupplierColumn] = useState<SupplierColumnKey | null>(null);
  const [supplierSortState, setSupplierSortState] = useState<SupplierSortState>({ key: null, order: null });
  const [visibleSupplierColumns, setVisibleSupplierColumns] = useState<SupplierVisibleColumns>({
    name: true,
    supplier: true,
    document: true,
    phone: true,
    email: true,
    status: true,
  });
  const [openComboField, setOpenComboField] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, messageContext] = message.useMessage();

  const loadSuppliers = useEffectEvent(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const payload = await fetchSuppliers();
      setSuppliers(payload.suppliers);
      setSelectedRowId((currentSelection) => (
        payload.suppliers.some((entry) => entry.id === currentSelection) ? currentSelection : payload.suppliers[0]?.id ?? null
      ));
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os fornecedores.";
      setLoadError(nextMessage);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadSuppliers();
  }, []);

  useEffect(() => {
    void (async () => {
      try {
        const payload = await fetchAuxiliarySimpleTable("supplier-segments");
        setSupplierSegmentRecords(payload.records.filter((record) => record.isActive));
      } catch {
        setSupplierSegmentRecords([]);
      }
    })();
  }, []);

  useEffect(() => {
    if (!selectedRowId) {
      setAddressRows([]);
      setPhoneRows([]);
      setEmailRows([]);
      return;
    }

    void (async () => {
      try {
        const payload = await fetchSupplierById(selectedRowId);
        setAddressRows((payload.supplier.addresses ?? []).map(mapAddressRow));
        setPhoneRows((payload.supplier.phones ?? []).map(mapPhoneRow));
        setEmailRows((payload.supplier.emails ?? []).map(mapEmailRow));
      } catch {
        setAddressRows([]);
        setPhoneRows([]);
        setEmailRows([]);
      }
    })();
  }, [selectedRowId]);

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return suppliers.filter((row) => {
      const matchesSegment = selectedSegment === "all" || row.segmentText === selectedSegment;
      const matchesSearch = !normalizedSearch
        || [row.tradeName, row.segmentText ?? "", row.cpfCnpj ?? "", row.primaryPhone ?? "", row.primaryEmail ?? ""]
          .join(" ")
          .toLowerCase()
          .includes(normalizedSearch);

      return matchesSegment && matchesSearch;
    });
  }, [search, selectedSegment, suppliers]);

  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const disableSelectionActions = !selectedRow;
  const selectedSupplierName = selectedRow?.tradeName ?? "teste";
  const isAdmMaster = currentUser?.email?.toLowerCase() === "gleissontel@gmail.com" || currentUser === null;
  const supplierSegmentOptions = useMemo(
    () => supplierSegmentRecords.map((record) => ({ label: record.nome, value: record.nome })),
    [supplierSegmentRecords],
  );

  useEffect(() => {
    console.log("currentUser", currentUser);
    console.log("isAdminMaster", isAdmMaster);
  }, [currentUser, isAdmMaster]);

  const formatDateTime = useCallback((value: string | null | undefined) => {
    if (!value) {
      return "-";
    }

    const parsed = new Date(value);
    if (Number.isNaN(parsed.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(parsed);
  }, []);

  const handleOpenDetails = useCallback(async () => {
    if (!selectedRow) {
      apiMessage.warning("Selecione um fornecedor para visualizar os detalhes.");
      return;
    }

    try {
      const payload = await fetchSupplierById(selectedRow.id);
      const supplier = payload.supplier;
      setSupplierDetails({
        id: supplier.id,
        trade_name: supplier.trade_name,
        company_name: supplier.company_name,
        cpf_cnpj: supplier.cpf_cnpj,
        state_registration: supplier.state_registration,
        website: supplier.website,
        segment_text: supplier.segment_text,
        payment_details: supplier.payment_details,
        notes: supplier.notes,
        is_active: supplier.is_active,
        image_url: supplier.image_url,
        created_at: supplier.created_at,
        updated_at: supplier.updated_at,
        addresses: (supplier.addresses ?? []).map(mapAddressRow),
        phones: (supplier.phones ?? []).map(mapPhoneRow),
        emails: (supplier.emails ?? []).map(mapEmailRow),
      });
      setSupplierImage({
        previewUrl: supplier.image_url ?? null,
        imageUrl: supplier.image_url ?? null,
        fileName: null,
      });
      setIsDetailsModalOpen(true);
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os detalhes do fornecedor.";
      apiMessage.error(nextMessage);
    }
  }, [apiMessage, selectedRow]);

  const addressColumns: ColumnsType<ContactRow> = [
    { title: "Principal", dataIndex: "main", key: "main", render: (value: string) => value },
    { title: "Rua", dataIndex: "detail", key: "detail", render: (value: string) => value },
  ];

  const phoneColumns: ColumnsType<ContactRow> = [
    { title: "Principal", dataIndex: "main", key: "main", render: (value: string) => value },
    { title: "Detalhe", dataIndex: "detail", key: "detail", render: (value: string) => value },
    { title: "Observação", dataIndex: "note", key: "note", render: (value: string | null) => value ?? "Preparado" },
  ];

  const emailColumns: ColumnsType<ContactRow> = [
    { title: "Principal", dataIndex: "main", key: "main", render: (value: string) => value },
    { title: "E-mail", dataIndex: "detail", key: "detail", render: (value: string) => value },
  ];

  const renderSupplierFilterDropdown = useCallback((columnKey: SupplierColumnKey, label: string) => {
    const supportsOrdering = columnKey !== "supplier";

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
                setSupplierSortState({ key: columnKey, order: "asc" });
                setOpenSupplierColumn(null);
              }}
            >
              Ordem Ascendente
              {supplierSortState.key === columnKey && supplierSortState.order === "asc" ? <CheckOutlined /> : null}
            </button>
            <button
              type="button"
              className="auxiliary-filter-menu-item"
              onClick={() => {
                setSupplierSortState({ key: columnKey, order: "desc" });
                setOpenSupplierColumn(null);
              }}
            >
              Ordem Descendente
              {supplierSortState.key === columnKey && supplierSortState.order === "desc" ? <CheckOutlined /> : null}
            </button>
            <div className="auxiliary-filter-menu-separator" />
          </>
        ) : null}
        <div className="auxiliary-filter-menu-subtitle">Colunas</div>
        <div className="auxiliary-filter-menu-columns">
          {supplierColumnOptions.map(({ key, label: columnLabel }) => {
            const enabledMainColumns = (["name", "supplier", "document", "phone", "email", "status"] as const).filter((entry) => visibleSupplierColumns[entry]).length;
            const disableToggle = visibleSupplierColumns[key] && enabledMainColumns === 1;

            return (
              <label key={key} className={`auxiliary-filter-menu-checkbox${disableToggle ? " is-disabled" : ""}`}>
                <input
                  type="checkbox"
                  checked={visibleSupplierColumns[key]}
                  disabled={disableToggle}
                  onChange={() => {
                    setVisibleSupplierColumns((current) => ({
                      ...current,
                      [key]: !current[key],
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
  }, [supplierSortState.key, supplierSortState.order, visibleSupplierColumns]);

  const renderSupplierFilterTitle = useCallback((columnKey: SupplierColumnKey, label: string, options?: { hideLabel?: boolean }) => {
    const hideLabel = options?.hideLabel === true;
    const isSorted = supplierSortState.key === columnKey && supplierSortState.order;

    return (
      <div className={`auxiliary-filter-header${hideLabel ? " is-icon-only" : ""} supplier-grid-filter-header`}>
        {hideLabel ? null : <span className="supplier-grid-filter-label">{label}</span>}
        <Dropdown
          trigger={["click"]}
          open={openSupplierColumn === columnKey}
          onOpenChange={(nextOpen) => setOpenSupplierColumn(nextOpen ? columnKey : null)}
          dropdownRender={() => renderSupplierFilterDropdown(columnKey, label)}
        >
          <button
            type="button"
            className={`auxiliary-filter-trigger${isSorted ? " is-active" : ""}`}
            aria-label={`Abrir filtro de ${label}`}
            onClick={(event) => event.stopPropagation()}
          >
            <FilterOutlined />
          </button>
        </Dropdown>
      </div>
    );
  }, [openSupplierColumn, renderSupplierFilterDropdown, supplierSortState]);

  const supplierColumns: ColumnsType<SupplierRecord> = useMemo(() => {
    const nextColumns: ColumnsType<SupplierRecord> = [];

    if (visibleSupplierColumns.name) {
      nextColumns.push({
        title: renderSupplierFilterTitle("name", "Nome do fornecedor"),
        dataIndex: "tradeName",
        key: "name",
        sorter: true,
        sortOrder: supplierSortState.key === "name" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        render: (value: string) => <Typography.Text strong>{value}</Typography.Text>,
      });
    }

    if (visibleSupplierColumns.supplier) {
      nextColumns.push({
        title: renderSupplierFilterTitle("supplier", "Fornecedor"),
        dataIndex: "segmentText",
        key: "supplier",
        sorter: true,
        sortOrder: supplierSortState.key === "supplier" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        width: 180,
        render: (value: string | null) => value ?? "Preparado",
      });
    }

    if (visibleSupplierColumns.document) {
      nextColumns.push({
        title: renderSupplierFilterTitle("document", "CPF/CNPJ"),
        dataIndex: "cpfCnpj",
        key: "document",
        sorter: true,
        sortOrder: supplierSortState.key === "document" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        width: 180,
        render: (value: string | null) => value ?? "Preparado",
      });
    }

    if (visibleSupplierColumns.phone) {
      nextColumns.push({
        title: renderSupplierFilterTitle("phone", "Telefone"),
        dataIndex: "primaryPhone",
        key: "phone",
        sorter: true,
        sortOrder: supplierSortState.key === "phone" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        width: 160,
        render: (value: string | null) => value ?? "Preparado",
      });
    }

    if (visibleSupplierColumns.email) {
      nextColumns.push({
        title: renderSupplierFilterTitle("email", "E-mail"),
        dataIndex: "primaryEmail",
        key: "email",
        sorter: true,
        sortOrder: supplierSortState.key === "email" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        width: 220,
        render: (value: string | null) => value ?? "Preparado para backend",
      });
    }

    if (visibleSupplierColumns.status) {
      nextColumns.push({
        title: renderSupplierFilterTitle("status", "Status", { hideLabel: true }),
        dataIndex: "isActive",
        key: "status",
        sorter: true,
        sortOrder: supplierSortState.key === "status" ? (supplierSortState.order === "asc" ? "ascend" : "descend") : null,
        width: 70,
        align: "center",
        render: (_value: boolean, record) => (
          <span className="auxiliary-table-status-indicator" title={record.isActive ? "Ativo" : "Inativo"}>
            <span
              className={`auxiliary-table-status-dot${record.isActive ? " is-active" : " is-inactive"}`}
              aria-label={record.isActive ? "Ativo" : "Inativo"}
            />
          </span>
        ),
      });
    }

    return nextColumns;
  }, [renderSupplierFilterTitle, supplierSortState.key, supplierSortState.order, visibleSupplierColumns]);

  const sortedSupplierRows = useMemo(() => {
    if (!supplierSortState.key || !supplierSortState.order) {
      return visibleRows;
    }

    const getValue = (row: SupplierRecord) => {
      if (supplierSortState.key === "name") return row.tradeName ?? "";
      if (supplierSortState.key === "supplier") return row.segmentText ?? "";
      if (supplierSortState.key === "document") return row.cpfCnpj ?? "";
      if (supplierSortState.key === "phone") return row.primaryPhone ?? "";
      if (supplierSortState.key === "status") return row.isActive ? "Ativo" : "Inativo";
      return row.primaryEmail ?? "";
    };

    return [...visibleRows].sort((left, right) => {
      const comparison = getValue(left).localeCompare(getValue(right), "pt-BR", { sensitivity: "base" });
      return supplierSortState.order === "asc" ? comparison : -comparison;
    });
  }, [supplierSortState.key, supplierSortState.order, visibleRows]);

  function handleCloseModal() {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsAddressModalOpen(false);
    setIsPhoneModalOpen(false);
    setIsEmailModalOpen(false);
    setIsDeleteConfirmOpen(false);
    setIsReplaceDeleteOpen(false);
    setReplacementSupplierId(undefined);
    setEditingSupplier(null);
    form.resetFields();
  }

  function handleCloseAddressModal() {
    setIsAddressModalOpen(false);
    setAddressStreetPlaceholder("Logradouro");
    setAddressCepFeedback(null);
    setIsCepGenerico(false);
    setAddressModalState({
      cep: "",
      type: "Comercial",
      streetType: "",
      number: "",
      complement: "",
      state: "",
      city: "",
      neighborhood: "",
    });
  }

  function handleClosePhoneModal() {
    setIsPhoneModalOpen(false);
  }

  function handleCloseEmailModal() {
    setIsEmailModalOpen(false);
  }

  const handleOpenDeleteConfirm = useCallback(() => {
    if (!isAdmMaster || !selectedRowId) {
      apiMessage.warning("Selecione um fornecedor para excluir.");
      return;
    }

    setIsDeleteConfirmOpen(true);
  }, [apiMessage, isAdmMaster, selectedRowId]);

  const handleCancelDeleteConfirm = useCallback(() => {
    setIsDeleteConfirmOpen(false);
  }, []);

  const handleConfirmDelete = useCallback(async () => {
    if (!isAdmMaster || !selectedRowId) {
      return;
    }

    try {
      setIsSubmitting(true);
      const deleteCheck = await checkDeleteSupplier(selectedRowId);

      if (!deleteCheck.canDelete) {
        setIsDeleteConfirmOpen(false);
        setReplacementSupplierId(undefined);
        setIsReplaceDeleteOpen(true);
        return;
      }

      await deleteSupplier(selectedRowId);
      apiMessage.success("Fornecedor excluido permanentemente.");
      await loadSuppliers();
      handleCloseModal();
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error ? error.message : "Nao foi possivel excluir o fornecedor.";
      apiMessage.error(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [apiMessage, isAdmMaster, loadSuppliers, selectedRowId]);

  const handleConfirmReplaceAndDelete = useCallback(async () => {
    if (!isAdmMaster || !selectedRowId) {
      return;
    }

    if (!replacementSupplierId) {
      apiMessage.warning("Selecione um fornecedor de substituicao.");
      return;
    }

    try {
      setIsSubmitting(true);
      await replaceAndDeleteSupplier(selectedRowId, replacementSupplierId);
      apiMessage.success("Fornecedor excluido com sucesso.");
      await loadSuppliers();
      handleCloseModal();
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error ? error.message : "Nao foi possivel excluir o fornecedor.";
      apiMessage.error(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  }, [apiMessage, isAdmMaster, loadSuppliers, replacementSupplierId, selectedRowId]);

  const replacementSupplierOptions = useMemo(
    () => visibleRows
      .filter((row) => row.id !== selectedRowId)
      .map((row) => ({ label: row.tradeName, value: row.id })),
    [selectedRowId, visibleRows],
  );

  const handleOpenEditSupplier = useCallback(async () => {
    if (!selectedRow) {
      apiMessage.warning("Selecione um fornecedor para alterar.");
      return;
    }

    try {
      const payload = await fetchSupplierById(selectedRow.id);
      const supplier = payload.supplier;
      setEditingSupplier({
        trade_name: supplier.trade_name,
        company_name: supplier.company_name,
        cpf_cnpj: supplier.cpf_cnpj,
        state_registration: supplier.state_registration,
        website: supplier.website,
        segment_text: supplier.segment_text,
        payment_details: supplier.payment_details,
        notes: supplier.notes,
        is_active: supplier.is_active,
        emailPrimaryAddress: supplier.emails.find((entry) => entry.is_primary)?.email ?? undefined,
        addresses: (supplier.addresses ?? []).map(mapAddressRow),
        phones: (supplier.phones ?? []).map(mapPhoneRow),
        emails: (supplier.emails ?? []).map(mapEmailRow),
      });
      setSupplierImage({
        previewUrl: supplier.image_url ?? null,
        imageUrl: supplier.image_url ?? null,
        fileName: supplier.image_url ? supplier.image_url.split("/").pop() ?? null : null,
      });
      setIsEditModalOpen(true);
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os dados do fornecedor.";
      apiMessage.error(nextMessage);
    }
  }, [apiMessage, selectedRow]);

  const handleUploadSupplierImage = useCallback(async (file: File) => {
    if (!selectedRowId) {
      apiMessage.warning("Selecione um fornecedor antes de enviar a imagem.");
      return;
    }

    try {
      const payload = await uploadSupplierImage(selectedRowId, file);
      setSupplierImage({
        previewUrl: payload.imageUrl,
        imageUrl: payload.imageUrl,
        fileName: payload.fileName,
      });
      void loadSuppliers();

      if (isDetailsModalOpen || isEditModalOpen) {
        const supplierPayload = await fetchSupplierById(selectedRowId);
        const imageUrl = supplierPayload.supplier.image_url ?? null;
        setSupplierDetails((current) => (current ? { ...current, imageUrl } : current));
      }
    } catch (error) {
      console.error("Erro ao fazer upload da imagem:", error);
      apiMessage.error("Erro ao fazer upload da imagem.");
    }
  }, [apiMessage, isDetailsModalOpen, isEditModalOpen, loadSuppliers, selectedRowId]);

  const handleClearImage = useCallback(() => {
    setSupplierImage({ previewUrl: null, imageUrl: null, fileName: null });
  }, []);

  useLayoutEffect(() => {
    if (!isEditModalOpen || !editingSupplier) {
      return;
    }

    form.setFieldsValue({
      supplierName: editingSupplier.trade_name,
      companyName: editingSupplier.company_name ?? undefined,
      document: editingSupplier.cpf_cnpj ?? undefined,
      stateRegistration: editingSupplier.state_registration ?? undefined,
      portal: editingSupplier.website ?? undefined,
      segment: editingSupplier.segment_text ?? undefined,
      paymentDetails: editingSupplier.payment_details ?? undefined,
      notes: editingSupplier.notes ?? undefined,
      isActive: editingSupplier.is_active,
      phonePrimaryType: undefined,
      phonePrimaryDdd: undefined,
      phonePrimaryNumber: undefined,
      phonePrimaryExtension: undefined,
      phoneSecondaryType: undefined,
      phoneSecondaryDdd: undefined,
      phoneSecondaryNumber: undefined,
      phoneSecondaryExtension: undefined,
      emailPrimaryType: undefined,
      emailPrimaryAddress: editingSupplier.emailPrimaryAddress,
    });
    setAddressRows(editingSupplier.addresses);
    setPhoneRows(editingSupplier.phones);
    setEmailRows(editingSupplier.emails);
  }, [editingSupplier, form, isEditModalOpen]);

  useEffect(() => {
    if (!isEditModalOpen) {
      handleClearImage();
    }
  }, [handleClearImage, isEditModalOpen]);

  function isComboOpen(field: string) {
    return openComboField === field;
  }

  function getVisibleWindowByTitle(title: string) {
    const windows = Array.from(document.querySelectorAll("div.x-window")) as HTMLDivElement[];
    return windows.find((windowEl) => (windowEl.textContent ?? "").includes(title)) ?? null;
  }

  function readWindowInputs(title: string) {
    const windowEl = getVisibleWindowByTitle(title);
    return windowEl ? Array.from(windowEl.querySelectorAll("input")) as HTMLInputElement[] : [];
  }

  async function buscarCep(cep: string) {
    const cleanCep = cep.replace(/\D/g, "");
    if (cleanCep.length !== 8) {
      setAddressCepFeedback(null);
      setIsCepGenerico(false);
      return;
    }

    try {
      const response = await fetch(`https://viacep.com.br/ws/${cleanCep}/json/`);
      const data = await response.json();
      console.log("Resposta CEP:", data);

      if (!response.ok || data.erro) {
        setAddressCepFeedback("CEP encontrado, mas sem rua definida. Preencha manualmente.");
        setIsCepGenerico(true);
        return;
      }

      const temLogradouro = typeof data.logradouro === "string" && data.logradouro.trim() !== "";

      setAddressModalState((previous) => ({
        ...previous,
        city: data.localidade || "",
        state: data.uf || "",
        neighborhood: data.bairro || "",
        streetType: temLogradouro ? data.logradouro : "",
      }));
      setIsCepGenerico(!temLogradouro);
      setAddressStreetPlaceholder(temLogradouro ? "Logradouro" : "Digite a rua (autocomplete)");
      setAddressCepFeedback(null);
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  }

  async function handleSaveAddress() {
    if (!selectedRowId) return;
    await createSupplierAddress(selectedRowId, {
      type: addressModalState.type || null,
      streetType: addressModalState.streetType || null,
      number: addressModalState.number || null,
      complement: addressModalState.complement || null,
      neighborhood: addressModalState.neighborhood || null,
      city: addressModalState.city || null,
      state: addressModalState.state || null,
      zipCode: addressModalState.cep || null,
      isMain: false,
    });
    const payload = await fetchSupplierById(selectedRowId);
    setAddressRows((payload.supplier.addresses ?? []).map(mapAddressRow));
    setPhoneRows((payload.supplier.phones ?? []).map(mapPhoneRow));
    setEmailRows((payload.supplier.emails ?? []).map(mapEmailRow));
    setIsAddressModalOpen(false);
  }

  async function handleSavePhone() {
    if (!selectedRowId) return;
    const inputs = readWindowInputs("Novo telefone");
    const [_, type, ddd, phone, note] = inputs.map((input) => input.value ?? "");
    await createSupplierPhone(selectedRowId, {
      type: type || null,
      ddd: ddd || null,
      phone: phone || "",
      note: note || null,
      isMain: false,
    });
    const payload = await fetchSupplierById(selectedRowId);
    setAddressRows((payload.supplier.addresses ?? []).map(mapAddressRow));
    setPhoneRows((payload.supplier.phones ?? []).map(mapPhoneRow));
    setEmailRows((payload.supplier.emails ?? []).map(mapEmailRow));
    setIsPhoneModalOpen(false);
  }

  async function handleSaveEmail() {
    if (!selectedRowId) return;
    const inputs = readWindowInputs("Novo e-mail");
    const [_, type, email] = inputs.map((input) => input.value ?? "");
    await createSupplierEmail(selectedRowId, {
      type: type || null,
      email: email || "",
      isMain: false,
    });
    const payload = await fetchSupplierById(selectedRowId);
    setAddressRows((payload.supplier.addresses ?? []).map(mapAddressRow));
    setPhoneRows((payload.supplier.phones ?? []).map(mapPhoneRow));
    setEmailRows((payload.supplier.emails ?? []).map(mapEmailRow));
    setIsEmailModalOpen(false);
  }

  async function handleCreateSupplier() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await createSupplier({
        tradeName: values.supplierName,
        companyName: values.companyName ?? null,
        cpfCnpj: values.document ?? null,
        stateRegistration: values.stateRegistration ?? null,
        website: values.portal ?? null,
        segmentText: values.segment ?? null,
        paymentDetails: values.paymentDetails ?? null,
        notes: values.notes ?? null,
        isActive: values.isActive,
        phones: [
          values.phonePrimaryNumber
            ? {
                type: values.phonePrimaryType ?? null,
                ddd: values.phonePrimaryDdd ?? null,
                phone: values.phonePrimaryNumber,
                extension: values.phonePrimaryExtension ?? null,
              }
            : null,
          values.phoneSecondaryNumber
            ? {
                type: values.phoneSecondaryType ?? null,
                ddd: values.phoneSecondaryDdd ?? null,
                phone: values.phoneSecondaryNumber,
                extension: values.phoneSecondaryExtension ?? null,
              }
            : null,
        ].filter(Boolean) as Array<{ type: string | null; ddd: string | null; phone: string; extension?: string | null }>,
        emails: values.emailPrimaryAddress
          ? [
              {
                type: values.emailPrimaryType ?? null,
                email: values.emailPrimaryAddress,
              },
            ]
          : [],
      });
      await loadSuppliers();
      apiMessage.success(`Fornecedor "${values.supplierName}" gravado com sucesso.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateSupplier() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (!selectedRowId) {
        apiMessage.warning("Selecione um fornecedor para alterar.");
        return;
      }

      await updateSupplier(selectedRowId, {
        tradeName: values.supplierName,
        companyName: values.companyName ?? null,
        cpfCnpj: values.document ?? null,
        stateRegistration: values.stateRegistration ?? null,
        website: values.portal ?? null,
        segmentText: values.segment ?? null,
        paymentDetails: values.paymentDetails ?? null,
        notes: values.notes ?? null,
        isActive: values.isActive,
      });
      await loadSuppliers();
      const payload = await fetchSupplierById(selectedRowId);
      setAddressRows((payload.supplier.addresses ?? []).map(mapAddressRow));
      setPhoneRows((payload.supplier.phones ?? []).map(mapPhoneRow));
      setEmailRows((payload.supplier.emails ?? []).map(mapEmailRow));
      apiMessage.success(`Fornecedor "${values.supplierName}" atualizado com sucesso.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band cadastro-shell-band" aria-label="Barra operacional de fornecedores">
        <div className="users-shell-band-toolbar cashflow-shell-toolbar" role="toolbar" aria-label="Acoes do modulo fornecedores">
          <div className="cashflow-shell-toolbar-left">
            <Button
              type="primary"
              icon={<PlusOutlined />}
              onClick={() => setIsCreateModalOpen(true)}
            >
              Novo fornecedor
            </Button>
            <Button
              icon={<FileTextOutlined />}
              disabled={disableSelectionActions}
              onClick={() => void handleOpenEditSupplier()}
            >
              Alterar
            </Button>
            <Button
              icon={<InfoCircleOutlined />}
              disabled={disableSelectionActions}
              onClick={() => void handleOpenDetails()}
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
  }, [apiMessage, disableSelectionActions, form, handleOpenEditSupplier, search, selectedRow, selectedSegment, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      {loadError ? (
        <Alert type="error" showIcon message="Falha ao carregar fornecedores" description={loadError} />
      ) : null}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
              <Table<SupplierRecord>
                rowKey="id"
                loading={isLoading}
                className="module-table users-admin-table supplier-grid-table"
                columns={supplierColumns}
                dataSource={sortedSupplierRows}
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

      <Modal
        open={isDetailsModalOpen}
        footer={null}
        onCancel={() => setIsDetailsModalOpen(false)}
        closeIcon={<CloseOutlined />}
        centered
        width={820}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal supplier-details-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Detalhes do fornecedor
          </Typography.Title>
        </div>

        <Tabs
          size="small"
          className="supplier-edit-tabs supplier-details-tabs"
          items={[
            {
              key: "principais",
              label: "Dados principais",
              children: (
                <div className="supplier-details-main-layout">
                  <div className="supplier-details-main-content">
                    <div className="supplier-details-line">
                      <strong>Nome:</strong>
                      <span>{supplierDetails?.trade_name ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line">
                      <strong>Razão social:</strong>
                      <span>{supplierDetails?.company_name ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line">
                      <strong>CPF/CNPJ:</strong>
                      <span>{supplierDetails?.cpf_cnpj ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line">
                      <strong>Inscrição estadual:</strong>
                      <span>{supplierDetails?.state_registration ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line">
                      <strong>Portal:</strong>
                      <span>{supplierDetails?.website ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line">
                      <strong>Segmento:</strong>
                      <span>{supplierDetails?.segment_text ?? "-"}</span>
                    </div>
                    <div className="supplier-details-line supplier-details-line-notes">
                      <strong>Observações:</strong>
                      <span>{supplierDetails?.notes ?? "-"}</span>
                    </div>

                    <div className="supplier-details-meta">
                      <div className="supplier-details-meta-line">
                        <strong>ID do registro:</strong>
                        <span>{supplierDetails?.id ?? "-"}</span>
                      </div>
                      <div className="supplier-details-meta-line">
                        <strong>Status:</strong>
                        <span>{supplierDetails?.is_active ? "Ativo" : "Inativo"}</span>
                      </div>
                      <div className="supplier-details-meta-line">
                        <strong>Criação:</strong>
                        <span>{formatDateTime(supplierDetails?.created_at)} - {currentUser?.name ?? "Sistema"}</span>
                      </div>
                      <div className="supplier-details-meta-line">
                        <strong>Atualização:</strong>
                        <span>{formatDateTime(supplierDetails?.updated_at)} - {currentUser?.name ?? "Sistema"}</span>
                      </div>
                    </div>
                  </div>

                  <div className="supplier-details-avatar">
                    <div className="supplier-avatar-box">
                      <AppstoreOutlined />
                    </div>
                  </div>
                </div>
              ),
            },
            {
              key: "contato",
              label: "Dados de contato",
              children: (
                <div className="supplier-details-contact">
                  <section className="supplier-details-contact-block supplier-details-contact-block-wide">
                    <Typography.Text className="supplier-details-contact-title">Endereços</Typography.Text>
                    <Table<ContactRow>
                      rowKey="id"
                      size="small"
                      pagination={false}
                      columns={[
                        { title: "Tipo", dataIndex: "type", key: "type", width: 150, render: (value: string) => value },
                        { title: "Rua", dataIndex: "detail", key: "detail", render: (value: string) => value },
                      ]}
                      dataSource={supplierDetails?.addresses ?? []}
                      locale={{ emptyText: "Nenhum endereço carregado ainda." }}
                    />
                  </section>

                  <div className="supplier-details-contact-grid">
                    <section className="supplier-details-contact-block">
                      <Typography.Text className="supplier-details-contact-title">Telefones</Typography.Text>
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: "Tipo", dataIndex: "type", key: "type", width: 150, render: (value: string) => value },
                          { title: "Número", dataIndex: "detail", key: "detail", render: (value: string) => value },
                          { title: "Complemento", dataIndex: "note", key: "note", render: (value: string | null) => value ?? "" },
                        ]}
                        dataSource={supplierDetails?.phones ?? []}
                        locale={{ emptyText: "Nenhum telefone carregado ainda." }}
                      />
                    </section>

                    <section className="supplier-details-contact-block">
                      <Typography.Text className="supplier-details-contact-title">E-mails</Typography.Text>
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={[
                          { title: "Tipo", dataIndex: "type", key: "type", width: 150, render: (value: string) => value },
                          { title: "E-mail", dataIndex: "detail", key: "detail", render: (value: string) => value },
                        ]}
                        dataSource={supplierDetails?.emails ?? []}
                        locale={{ emptyText: "Nenhum e-mail carregado ainda." }}
                      />
                    </section>
                  </div>
                </div>
              ),
            },
          ]}
        />

        <div className="terra-password-modal-actions client-modal-actions">
          <Button onClick={() => setIsDetailsModalOpen(false)}>Fechar</Button>
        </div>
      </Modal>

      <Modal
        open={isCreateModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={820}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Novo fornecedor - Dados principais
          </Typography.Title>
        </div>

        <Form<SupplierFormValues>
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form client-modal-form supplier-modal-form"
          onFinish={() => void handleCreateSupplier()}
        >
          <Form.Item
            name="supplierName"
            label="Nome do fornecedor"
            rules={[{ required: true, message: "Informe o nome do fornecedor." }]}
          >
            <Input placeholder="Nome do fornecedor" />
          </Form.Item>

          <Form.Item name="companyName" label="Razao social">
            <Input placeholder="Razao social" />
          </Form.Item>

          <Form.Item
            name="document"
            label="CPF/CNPJ"
            rules={[
              {
                validator(_, value) {
                  if (!value) {
                    return Promise.resolve();
                  }

                  const digits = String(value).replace(/\D/g, "");
                  if (digits.length === 11 || digits.length === 14) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("Informe um CPF ou CNPJ valido."));
                },
              },
            ]}
          >
            <Input placeholder="CPF ou CNPJ" />
          </Form.Item>

          <Form.Item
            name="segment"
            label="Fornecedor"
            rules={[{ required: true, message: "Selecione o segmento." }]}
          >
            <Select placeholder="Selecionar fornecedor" options={supplierSegmentOptions} />
          </Form.Item>

          <div className="supplier-modal-divider" aria-hidden="true" />

          <div className="client-modal-communication-row">
            <Typography.Text className="client-modal-group-label">Telefone 1</Typography.Text>
            <div className="client-modal-communication-grid">
              <Form.Item name="phonePrimaryType" className="client-modal-phone-type">
                <AutoComplete allowClear placeholder="Tipo" options={phoneTypeComboOptions} />
              </Form.Item>
              <Form.Item name="phonePrimaryDdd" className="client-modal-phone-ddd">
                <Input placeholder="DDD" />
              </Form.Item>
              <Form.Item
                name="phonePrimaryNumber"
                className="client-modal-phone-number"
                rules={[
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const email = getFieldValue("emailPrimaryAddress");
                      const secondaryNumber = getFieldValue("phoneSecondaryNumber");

                      if (value || email || secondaryNumber) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("Informe pelo menos um contato principal."));
                    },
                  }),
                ]}
              >
                <Input placeholder="Numero" />
              </Form.Item>
              <Form.Item name="phonePrimaryExtension" className="client-modal-phone-extension">
                <Input placeholder="Ramal" />
              </Form.Item>
            </div>
          </div>

          <div className="client-modal-communication-row">
            <Typography.Text className="client-modal-group-label">Telefone 2</Typography.Text>
            <div className="client-modal-communication-grid">
              <Form.Item name="phoneSecondaryType" className="client-modal-phone-type">
                <AutoComplete allowClear placeholder="Tipo" options={phoneTypeComboOptions} />
              </Form.Item>
              <Form.Item name="phoneSecondaryDdd" className="client-modal-phone-ddd">
                <Input placeholder="DDD" />
              </Form.Item>
              <Form.Item name="phoneSecondaryNumber" className="client-modal-phone-number">
                <Input placeholder="Numero" />
              </Form.Item>
              <Form.Item name="phoneSecondaryExtension" className="client-modal-phone-extension">
                <Input placeholder="Ramal" />
              </Form.Item>
            </div>
          </div>

          <div className="client-modal-communication-row">
            <Typography.Text className="client-modal-group-label">E-mail 1</Typography.Text>
            <div className="client-modal-email-grid">
              <Form.Item name="emailPrimaryType" className="client-modal-email-type">
                <AutoComplete allowClear placeholder="Tipo" options={emailTypeComboOptions} />
              </Form.Item>
              <Form.Item
                name="emailPrimaryAddress"
                className="client-modal-email-address"
                rules={[
                  { type: "email", message: "Informe um e-mail valido." },
                  ({ getFieldValue }) => ({
                    validator(_, value) {
                      const phonePrimary = getFieldValue("phonePrimaryNumber");
                      const phoneSecondary = getFieldValue("phoneSecondaryNumber");

                      if (value || phonePrimary || phoneSecondary) {
                        return Promise.resolve();
                      }

                      return Promise.reject(new Error("Informe pelo menos um contato principal."));
                    },
                  }),
                ]}
              >
                <Input placeholder="email@fornecedor.com" />
              </Form.Item>
            </div>
          </div>

          <div className="terra-password-modal-actions client-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar fornecedor
            </Button>
            {isAdmMaster ? (
              <Button danger onClick={handleOpenDeleteConfirm}>
                Excluir
              </Button>
            ) : null}
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>

      <Modal
        open={isDeleteConfirmOpen}
        footer={null}
        onCancel={handleCancelDeleteConfirm}
        centered
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Excluir fornecedor
          </Typography.Title>
        </div>
        <div className="supplier-contact-popup">
          <Typography.Text>Deseja excluir permanentemente este fornecedor?</Typography.Text>
        </div>
        <div className="terra-password-modal-actions client-modal-actions supplier-contact-popup-actions">
          <Button danger onClick={() => void handleConfirmDelete()} loading={isSubmitting}>
            Excluir
          </Button>
          <Button onClick={handleCancelDeleteConfirm}>Cancelar</Button>
        </div>
      </Modal>

      <Modal
        open={isReplaceDeleteOpen}
        footer={null}
        onCancel={() => setIsReplaceDeleteOpen(false)}
        centered
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Substituir e excluir fornecedor
          </Typography.Title>
        </div>
        <div className="supplier-contact-popup">
          <Typography.Text>Este fornecedor possui dependencias. Selecione a substituicao e confirme a exclusao.</Typography.Text>
          <div style={{ marginTop: 12 }}>
            <Select
              value={replacementSupplierId}
              onChange={setReplacementSupplierId}
              options={replacementSupplierOptions}
              placeholder="Selecione o fornecedor substituto"
              style={{ width: "100%" }}
              showSearch
              optionFilterProp="label"
            />
          </div>
        </div>
        <div className="terra-password-modal-actions client-modal-actions supplier-contact-popup-actions">
          <Button danger onClick={() => void handleConfirmReplaceAndDelete()} loading={isSubmitting}>
            Excluir
          </Button>
          <Button onClick={() => setIsReplaceDeleteOpen(false)}>Cancelar</Button>
        </div>
      </Modal>

      <Modal
        open={isEditModalOpen}
        footer={[
          <Button key="save" type="primary" htmlType="submit" form="supplier-edit-form" loading={isSubmitting}>
            Gravar fornecedor
          </Button>,
          isAdmMaster ? (
            <Button key="delete" danger onClick={handleOpenDeleteConfirm}>
              Excluir
            </Button>
          ) : null,
          <Button key="cancel" onClick={handleCloseModal}>
            Cancelar
          </Button>,
        ]}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={980}
        forceRender
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal supplier-edit-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Altera fornecedor
          </Typography.Title>
        </div>

        <Form<SupplierFormValues>
          id="supplier-edit-form"
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form client-modal-form supplier-modal-form"
          onFinish={() => void handleUpdateSupplier()}
          initialValues={{ isActive: true }}
        >
          <Tabs
            size="small"
            className="supplier-edit-tabs"
            items={[
              {
                key: "principais",
                label: "Dados principais",
                children: (
                  <div className="supplier-edit-main-grid">
                    <div className="supplier-edit-main-form">
                      <Form.Item
                        name="supplierName"
                        label="Nome do fornecedor"
                        rules={[{ required: true, message: "Informe o nome do fornecedor." }]}
                      >
                        <Input placeholder="Nome do fornecedor" />
                      </Form.Item>

                      <Form.Item name="companyName" label="Razao social">
                        <Input placeholder="Razao social" />
                      </Form.Item>

                      <Form.Item
                        name="document"
                        label="CPF/CNPJ"
                        rules={[
                          {
                            validator(_, value) {
                              if (!value) {
                                return Promise.resolve();
                              }

                              const digits = String(value).replace(/\D/g, "");
                              if (digits.length === 11 || digits.length === 14) {
                                return Promise.resolve();
                              }

                              return Promise.reject(new Error("Informe um CPF ou CNPJ valido."));
                            },
                          },
                        ]}
                      >
                        <Input placeholder="CPF ou CNPJ" />
                      </Form.Item>

                      <Form.Item name="stateRegistration" label="Inscricao estadual">
                        <Input placeholder="Inscricao estadual" />
                      </Form.Item>

                      <Form.Item name="portal" label="Portal">
                        <Input placeholder="Portal do fornecedor" />
                      </Form.Item>

                      <Form.Item
                        name="segment"
                        label="Fornecedor"
                        rules={[{ required: true, message: "Selecione o segmento." }]}
                      >
                        <Select placeholder="Selecionar fornecedor" options={supplierSegmentOptions} />
                      </Form.Item>

                      <Form.Item name="paymentDetails" label="Dados para pagamento">
                        <Input.TextArea rows={3} placeholder="Dados bancarios e orientacoes para pagamento" />
                      </Form.Item>

                      <Form.Item name="notes" label="Observacoes">
                        <Input.TextArea rows={3} placeholder="Observacoes internas" />
                      </Form.Item>

                      <Form.Item name="isActive" valuePropName="checked">
                        <Checkbox>Fornecedor ativo</Checkbox>
                      </Form.Item>
                    </div>

                    <SupplierImageCapture
                      previewUrl={supplierImage.previewUrl}
                      onUpload={handleUploadSupplierImage}
                      onClear={handleClearImage}
                    />
                  </div>
                ),
              },
              {
                key: "contato",
                label: "Dados de contato",
                children: (
                  <div className="supplier-contact-tab">
                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-toolbar">
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => setIsAddressModalOpen(true)}>
                            Novo endereço
                          </Button>
                          <Button size="small" onClick={() => apiMessage.info("Alteracao de endereco preparada para a proxima etapa.")}>
                            Alterar
                          </Button>
                          <Button size="small" onClick={() => apiMessage.info("Propriedades de endereco preparadas para a proxima etapa.")}>
                            Propriedades
                          </Button>
                        </div>
                      </div>
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>Endereços</Typography.Text>
                      </div>
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={addressColumns}
                        dataSource={addressRows}
                        locale={{ emptyText: "Nenhum endereço carregado ainda." }}
                      />
                    </section>

                    <div className="supplier-contact-row">
                      <section className="supplier-contact-block supplier-contact-block-half">
                        <div className="supplier-contact-block-toolbar">
                          <div className="supplier-contact-block-actions">
                            <Button size="small" onClick={() => setIsPhoneModalOpen(true)}>
                              Novo telefone
                            </Button>
                            <Button size="small" onClick={() => apiMessage.info("Alteracao de telefone preparada para a proxima etapa.")}>
                              Alterar
                            </Button>
                            <Button size="small" onClick={() => apiMessage.info("Propriedades de telefone preparadas para a proxima etapa.")}>
                              Propriedades
                            </Button>
                          </div>
                        </div>
                        <div className="supplier-contact-block-header">
                          <Typography.Text strong>Telefones</Typography.Text>
                        </div>
                        <Table<ContactRow>
                          rowKey="id"
                          size="small"
                          pagination={false}
                          columns={phoneColumns}
                          dataSource={phoneRows}
                          locale={{ emptyText: "Nenhum telefone carregado ainda." }}
                        />
                      </section>

                      <section className="supplier-contact-block supplier-contact-block-half">
                        <div className="supplier-contact-block-toolbar">
                          <div className="supplier-contact-block-actions">
                            <Button size="small" onClick={() => setIsEmailModalOpen(true)}>
                              Novo e-mail
                            </Button>
                            <Button size="small" onClick={() => apiMessage.info("Alteracao de e-mail preparada para a proxima etapa.")}>
                              Alterar
                            </Button>
                            <Button size="small" onClick={() => apiMessage.info("Propriedades de e-mail preparadas para a proxima etapa.")}>
                              Propriedades
                            </Button>
                          </div>
                        </div>
                        <div className="supplier-contact-block-header">
                          <Typography.Text strong>E-mails</Typography.Text>
                        </div>
                        <Table<ContactRow>
                          rowKey="id"
                          size="small"
                          pagination={false}
                          columns={emailColumns}
                          dataSource={emailRows}
                          locale={{ emptyText: "Nenhum e-mail carregado ainda." }}
                        />
                      </section>
                    </div>
                  </div>
                ),
              },
            ]}
          />

        </Form>
      </Modal>

      <Modal
        open={isAddressModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={670}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Novo endereço
          </Typography.Title>
        </div>

        <div className="supplier-contact-popup">
          <div className="supplier-contact-popup-line">
            <Typography.Text strong>Nome do fornecedor:</Typography.Text>
            <Typography.Text>{selectedSupplierName}</Typography.Text>
          </div>
          <Form layout="vertical" className="supplier-contact-popup-form supplier-contact-popup-form-address">
            <div className="supplier-contact-address-grid endereco-grid">
              <div className="supplier-contact-address-row supplier-contact-address-row-cep">
                <Form.Item label="CEP" className="supplier-contact-address-field supplier-contact-address-field-number">
                  <Input
                    placeholder="CEP"
                    value={addressModalState.cep}
                    onChange={(event) => setAddressModalState((previous) => ({ ...previous, cep: event.target.value }))}
                    onBlur={(event) => void buscarCep(event.target.value)}
                    onPressEnter={(event) => void buscarCep((event.target as HTMLInputElement).value)}
                  />
                  {addressCepFeedback ? (
                    <Typography.Text className="supplier-contact-address-feedback">
                      {addressCepFeedback}
                    </Typography.Text>
                  ) : null}
                </Form.Item>
                <div className="supplier-contact-address-field supplier-contact-address-field-search">
                  <Button onClick={() => void buscarCep(addressModalState.cep)}>
                    Pesquisar
                  </Button>
                </div>
              </div>

              <div className="supplier-contact-address-row supplier-contact-address-row-two-cols">
                <Form.Item label="Tipo de endereço" className="supplier-contact-address-field">
                  <AutoComplete
                    options={addressTypeOptions}
                    open={isComboOpen("addressType")}
                    onFocus={() => setOpenComboField("addressType")}
                    onBlur={() => setOpenComboField((current) => (current === "addressType" ? null : current))}
                    onSearch={() => setOpenComboField("addressType")}
                    value={addressModalState.type}
                    onChange={(value) => setAddressModalState((previous) => ({ ...previous, type: value }))}
                    filterOption={(inputValue, option) => String(option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())}
                    placeholder="Comercial"
                  />
                </Form.Item>
                <Form.Item
                  label="Logradouro"
                  className={`supplier-contact-address-field${isCepGenerico ? " supplier-contact-address-field-generico" : ""}`}
                >
                  <AutoComplete
                    options={addressLogradouroSuggestions}
                    open={isComboOpen("logradouro")}
                    onFocus={() => setOpenComboField("logradouro")}
                    onBlur={() => setOpenComboField((current) => (current === "logradouro" ? null : current))}
                    onSearch={() => setOpenComboField("logradouro")}
                    value={addressModalState.streetType}
                    onChange={(value) => setAddressModalState((previous) => ({ ...previous, streetType: value }))}
                    filterOption={(inputValue, option) => String(option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())}
                    placeholder={addressStreetPlaceholder}
                  />
                </Form.Item>
              </div>

              <div className="supplier-contact-address-row supplier-contact-address-row-two-cols">
                <Form.Item label="Número" className="supplier-contact-address-field supplier-contact-address-field-number">
                  <Input
                    placeholder=""
                    value={addressModalState.number}
                    onChange={(event) => setAddressModalState((previous) => ({ ...previous, number: event.target.value }))}
                  />
                </Form.Item>
                <Form.Item label="Complemento" className="supplier-contact-address-field">
                  <Input
                    placeholder=""
                    value={addressModalState.complement}
                    onChange={(event) => setAddressModalState((previous) => ({ ...previous, complement: event.target.value }))}
                  />
                </Form.Item>
              </div>
              <div className="supplier-contact-address-row supplier-contact-address-row-uf-city">
                <Form.Item label="UF" className="supplier-contact-address-field supplier-contact-address-field-uf">
                  <AutoComplete
                    options={ufOptions}
                    open={isComboOpen("uf")}
                    onFocus={() => setOpenComboField("uf")}
                    onBlur={() => setOpenComboField((current) => (current === "uf" ? null : current))}
                    onSearch={() => setOpenComboField("uf")}
                    value={addressModalState.state}
                    onChange={(value) => setAddressModalState((previous) => ({ ...previous, state: value }))}
                    placeholder="Selecione ou digite o estado"
                    className="supplier-contact-address-select-uf"
                    suffixIcon={<DownOutlined />}
                  />
                </Form.Item>
                <Form.Item label="Cidade" className="supplier-contact-address-field">
                  <AutoComplete
                    options={emptyComboOptions}
                    open={isComboOpen("city")}
                    onFocus={() => setOpenComboField("city")}
                    onBlur={() => setOpenComboField((current) => (current === "city" ? null : current))}
                    onSearch={() => setOpenComboField("city")}
                    value={addressModalState.city}
                    onChange={(value) => setAddressModalState((previous) => ({ ...previous, city: value }))}
                    placeholder="Digite a cidade"
                    className="supplier-contact-address-select-city"
                    suffixIcon={<DownOutlined />}
                  />
                </Form.Item>
              </div>
              <div className="supplier-contact-address-row supplier-contact-address-row-full">
                <Form.Item label="Bairro" className="supplier-contact-address-field supplier-contact-address-field-full">
                  <Input
                    placeholder=""
                    value={addressModalState.neighborhood}
                    onChange={(event) => setAddressModalState((previous) => ({ ...previous, neighborhood: event.target.value }))}
                  />
                </Form.Item>
              </div>
            </div>
          </Form>
        </div>

        <div className="terra-password-modal-actions client-modal-actions supplier-contact-popup-actions">
          <Button type="primary" onClick={() => void handleSaveAddress()}>Gravar endereço</Button>
          <Button onClick={handleCloseAddressModal}>Cancelar</Button>
        </div>
      </Modal>

      <Modal
        open={isPhoneModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={610}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Novo telefone
          </Typography.Title>
        </div>

        <div className="supplier-contact-popup">
          <div className="supplier-contact-popup-line">
            <Typography.Text strong>Nome do fornecedor:</Typography.Text>
            <Typography.Text>{selectedSupplierName}</Typography.Text>
          </div>
          <Form layout="vertical" className="supplier-contact-popup-form supplier-contact-popup-form-phone">
              <Form.Item label="Tipo" className="supplier-contact-popup-field supplier-contact-popup-field-type">
                  <AutoComplete
                    options={phoneTypeComboOptions}
                    open={isComboOpen("phoneType")}
                    onFocus={() => setOpenComboField("phoneType")}
                    onBlur={() => setOpenComboField((current) => (current === "phoneType" ? null : current))}
                    onSearch={() => setOpenComboField("phoneType")}
                    filterOption={(inputValue, option) => String(option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())}
                    placeholder="Tipo"
                  />
                </Form.Item>
            <Form.Item label="DDD/Número" className="supplier-contact-popup-field supplier-contact-popup-field-phone-number">
              <div className="supplier-contact-popup-row supplier-contact-popup-row-phone">
                <Input placeholder="DDD" />
                <Input placeholder="Número do telefone" />
              </div>
            </Form.Item>
            <Form.Item label="Ramal" className="supplier-contact-popup-field">
              <Input placeholder="Ramal do telefone" />
            </Form.Item>
            <Form.Item label="Complemento" className="supplier-contact-popup-field">
              <Input placeholder="Complemento do telefone" />
            </Form.Item>
          </Form>
        </div>

        <div className="terra-password-modal-actions client-modal-actions supplier-contact-popup-actions">
          <Button type="primary" onClick={() => void handleSavePhone()}>Gravar telefone</Button>
          <Button onClick={handleClosePhoneModal}>Cancelar</Button>
        </div>
      </Modal>

      <Modal
        open={isEmailModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={560}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Novo e-mail
          </Typography.Title>
        </div>

        <div className="supplier-contact-popup">
          <div className="supplier-contact-popup-line">
            <Typography.Text strong>Nome do fornecedor:</Typography.Text>
            <Typography.Text>{selectedSupplierName}</Typography.Text>
          </div>
          <Form layout="vertical" className="supplier-contact-popup-form supplier-contact-popup-form-email">
              <Form.Item label="Tipo" className="supplier-contact-popup-field supplier-contact-popup-field-type">
                  <AutoComplete
                    options={emailTypeComboOptions}
                    open={isComboOpen("emailType")}
                    onFocus={() => setOpenComboField("emailType")}
                    onBlur={() => setOpenComboField((current) => (current === "emailType" ? null : current))}
                    onSearch={() => setOpenComboField("emailType")}
                    filterOption={(inputValue, option) => String(option?.value ?? "").toLowerCase().includes(inputValue.toLowerCase())}
                    placeholder="Tipo"
                  />
                </Form.Item>
            <Form.Item label="E-mail" className="supplier-contact-popup-field supplier-contact-popup-field-email">
              <Input placeholder="endereço de e-mail" />
            </Form.Item>
          </Form>
        </div>

        <div className="terra-password-modal-actions client-modal-actions supplier-contact-popup-actions">
          <Button type="primary" onClick={() => void handleSaveEmail()}>Gravar e-mail</Button>
          <Button onClick={handleCloseEmailModal}>Cancelar</Button>
        </div>
      </Modal>
    </div>
  );
}






