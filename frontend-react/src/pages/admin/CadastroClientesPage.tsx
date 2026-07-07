import {
  AppstoreOutlined,
  CloseOutlined,
  DownOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Alert, Button, Checkbox, DatePicker, Dropdown, Form, Input, Modal, Select, Space, Table, Tabs, Typography, message } from "antd";
import type { ColumnsType } from "antd/es/table";
import dayjs from "dayjs";
import { useCallback, useEffect, useEffectEvent, useMemo, useState } from "react";

import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import { createClient, fetchClientById, fetchClients, RegistryApiError, updateClient, type ClientDetailsRecord, type ClientRecord } from "@/services/registry/registryApi";

const clientSearchCriteria = [
  { key: "nome-cliente", label: "Nome do cliente" },
  { key: "nome-responsavel", label: "Nome do responsavel" },
  { key: "cpf-cliente", label: "CPF do cliente" },
  { key: "cpf-responsavel", label: "CPF do responsavel" },
  { key: "email-principal", label: "E-mail principal" },
  { key: "telefone-principal", label: "Telefone principal" },
  { key: "codigo-cliente", label: "Codigo do cliente" },
] as const;

const sexOptions = [
  { label: "Selecionar", value: "selecionar" },
  { label: "Feminino", value: "feminino" },
  { label: "Masculino", value: "masculino" },
  { label: "Outro", value: "outro" },
];

const documentTypeOptions = [
  { label: "RG", value: "rg" },
  { label: "CNH", value: "cnh" },
  { label: "Passaporte", value: "passaporte" },
];

const phoneTypeOptions = [
  { label: "Celular", value: "celular" },
  { label: "Residencial", value: "residencial" },
  { label: "Comercial", value: "comercial" },
];

const emailTypeOptions = [
  { label: "Principal", value: "principal" },
  { label: "Comercial", value: "comercial" },
  { label: "Pessoal", value: "pessoal" },
];

const statusOptions = [
  { label: "Ativo", value: "ativo" },
  { label: "Inativo", value: "inativo" },
];

const benefitOptions = [
  { label: "Sem beneficio", value: "sem-beneficio" },
  { label: "Convenio interno", value: "convenio-interno" },
];

const indicationTypeOptions = [
  { label: "Indicacao espontanea", value: "espontanea" },
  { label: "Prestador", value: "prestador" },
  { label: "Campanha", value: "campanha" },
];

const maritalStatusOptions = [
  { label: "Solteiro(a)", value: "solteiro" },
  { label: "Casado(a)", value: "casado" },
  { label: "Divorciado(a)", value: "divorciado" },
];

const providerOptions = [
  { label: "Selecionar depois", value: "prepared-provider" },
];

type ClientFormValues = {
  name: string;
  sex: string;
  birthDate: unknown;
  code: string | undefined;
  cpf: string | undefined;
  documentType: string | undefined;
  documentNumber: string | undefined;
  responsibleName: string | undefined;
  status: string | undefined;
  benefitPrimary: string | undefined;
  beneficiaryCode: string | undefined;
  benefitValidUntil: unknown;
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
  fatherName: string | undefined;
  motherName: string | undefined;
  socialName: string | undefined;
  nickname: string | undefined;
  occupation: string | undefined;
  recordNumber: string | undefined;
  maritalStatus: string | undefined;
  spouseName: string | undefined;
  indicationType: string | undefined;
  provider: string | undefined;
  publicVisibility: boolean;
  notes: string | undefined;
};

type ContactPlaceholderRow = {
  id: string;
  main: string;
  detail: string;
};

const preparedContactRows: ContactPlaceholderRow[] = [];

type ClientEditSnapshot = {
  name: string;
  sex: string;
  birthDate: unknown;
  code: string | undefined;
  cpf: string | undefined;
  documentType: string | undefined;
  documentNumber: string | undefined;
  responsibleName: string | undefined;
  status: string | undefined;
  benefitPrimary: string | undefined;
  beneficiaryCode: string | undefined;
  benefitValidUntil: unknown;
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
  fatherName: string | undefined;
  motherName: string | undefined;
  socialName: string | undefined;
  nickname: string | undefined;
  occupation: string | undefined;
  recordNumber: string | undefined;
  maritalStatus: string | undefined;
  spouseName: string | undefined;
  indicationType: string | undefined;
  provider: string | undefined;
  publicVisibility: boolean;
  notes: string | undefined;
};

function mapClientToFormValues(client: ClientDetailsRecord): ClientEditSnapshot {
  const primaryBenefit = client.benefits?.[0];

  return {
    name: client.fullName,
    sex: client.gender ?? "selecionar",
    birthDate: client.birthDate ? dayjs(client.birthDate) : undefined,
    code: client.internalCode ?? undefined,
    cpf: client.cpf ?? undefined,
    documentType: client.documentTypeText ?? undefined,
    documentNumber: client.documentNumber ?? undefined,
    responsibleName: client.responsibleName ?? undefined,
    status: client.statusText ?? "ativo",
    benefitPrimary: primaryBenefit?.benefitTypeText ?? "sem-beneficio",
    beneficiaryCode: primaryBenefit?.beneficiaryCode ?? undefined,
    benefitValidUntil: primaryBenefit?.validUntil ? dayjs(primaryBenefit.validUntil) : undefined,
    phonePrimaryType: client.phones?.[0]?.phoneTypeText ?? undefined,
    phonePrimaryDdd: client.phones?.[0]?.ddd ?? undefined,
    phonePrimaryNumber: client.phones?.[0]?.phoneNumber ?? undefined,
    phonePrimaryExtension: client.phones?.[0]?.extension ?? undefined,
    phoneSecondaryType: client.phones?.[1]?.phoneTypeText ?? undefined,
    phoneSecondaryDdd: client.phones?.[1]?.ddd ?? undefined,
    phoneSecondaryNumber: client.phones?.[1]?.phoneNumber ?? undefined,
    phoneSecondaryExtension: client.phones?.[1]?.extension ?? undefined,
    emailPrimaryType: client.emails?.[0]?.emailTypeText ?? undefined,
    emailPrimaryAddress: client.emails?.[0]?.email ?? undefined,
    fatherName: client.fatherName ?? undefined,
    motherName: client.motherName ?? undefined,
    socialName: client.socialName ?? undefined,
    nickname: client.nickname ?? undefined,
    occupation: client.occupation ?? undefined,
    recordNumber: client.recordNumber ?? undefined,
    maritalStatus: client.maritalStatus ?? undefined,
    spouseName: client.spouseName ?? undefined,
    indicationType: client.indicationTypeText ?? undefined,
    provider: client.providerText ?? undefined,
    publicVisibility: client.publicVisibility,
    notes: client.notes ?? undefined,
  };
}

function toIsoDate(value: unknown) {
  if (!value || typeof value !== "object" || !("format" in value)) {
    return null;
  }

  return (value as { format: (fmt: string) => string }).format("YYYY-MM-DD");
}

function buildClientPayload(values: ClientFormValues) {
  const benefitPrimary = values.benefitPrimary && values.benefitPrimary !== "sem-beneficio"
    ? {
        benefitTypeText: values.benefitPrimary,
        beneficiaryCode: values.beneficiaryCode ?? null,
        validUntil: toIsoDate(values.benefitValidUntil),
        isPrimary: true,
      }
    : null;

  return {
    name: values.name,
    gender: values.sex ?? null,
    birth_date: toIsoDate(values.birthDate),
    cpf: values.cpf ?? null,
    document_type: values.documentType ?? null,
    document_number: values.documentNumber ?? null,
    responsible: values.responsibleName ?? null,
    fatherName: values.fatherName ?? null,
    motherName: values.motherName ?? null,
    socialName: values.socialName ?? null,
    nickname: values.nickname ?? null,
    occupation: values.occupation ?? null,
    recordNumber: values.recordNumber ?? null,
    maritalStatus: values.maritalStatus ?? null,
    spouseName: values.spouseName ?? null,
    indicationType: values.indicationType ?? null,
    provider: values.provider ?? null,
    publicVisibility: values.publicVisibility ?? false,
    notes: values.notes ?? null,
    benefits: benefitPrimary ? [benefitPrimary] : [],
    phones: [
      values.phonePrimaryNumber
        ? {
            phoneTypeText: values.phonePrimaryType ?? null,
            ddd: values.phonePrimaryDdd ?? null,
            phoneNumber: values.phonePrimaryNumber,
            extension: values.phonePrimaryExtension ?? null,
            isPrimary: true,
          }
        : null,
      values.phoneSecondaryNumber
        ? {
            phoneTypeText: values.phoneSecondaryType ?? null,
            ddd: values.phoneSecondaryDdd ?? null,
            phoneNumber: values.phoneSecondaryNumber,
            extension: values.phoneSecondaryExtension ?? null,
            isPrimary: false,
          }
        : null,
    ].filter(Boolean) as Array<{
      phoneTypeText: string | null;
      ddd: string | null;
      phoneNumber: string;
      extension: string | null;
      isPrimary: boolean;
    }>,
    emails: values.emailPrimaryAddress
      ? [{
          emailTypeText: values.emailPrimaryType ?? null,
          email: values.emailPrimaryAddress,
          isPrimary: true,
        }]
      : [],
    addresses: [],
  };
}

function getSearchCriterionLabel(value: string) {
  return clientSearchCriteria.find((item) => item.key === value)?.label ?? "Nome do cliente";
}

function formatDate(value: string | null) {
  if (!value) {
    return "Preparado";
  }

  return new Date(value).toLocaleDateString("pt-BR");
}

export function CadastroClientesPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [form] = Form.useForm<ClientFormValues>();
  const [clients, setClients] = useState<ClientRecord[]>([]);
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [editingClient, setEditingClient] = useState<ClientDetailsRecord | null>(null);
  const [searchCriterion, setSearchCriterion] = useState("nome-cliente");
  const [search, setSearch] = useState("");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [loadError, setLoadError] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, messageContext] = message.useMessage();

  const loadClients = useEffectEvent(async () => {
    setIsLoading(true);
    setLoadError(null);

    try {
      const payload = await fetchClients();
      setClients(payload.clients);
      setSelectedRowId((currentSelection) => (
        payload.clients.some((entry) => entry.id === currentSelection) ? currentSelection : payload.clients[0]?.id ?? null
      ));
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os clientes.";
      setLoadError(nextMessage);
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadClients();
  }, []);

  const visibleRows = useMemo(() => {
    const normalizedSearch = search.trim().toLowerCase();

    return clients.filter((row) => {
      if (!showInactive && !row.isActive) {
        return false;
      }

      if (!normalizedSearch) {
        return true;
      }

      return [
        row.fullName,
        row.primaryPhone ?? "",
        row.internalCode ?? "",
        row.responsibleName ?? "",
        row.primaryEmail ?? "",
        row.cpf ?? "",
      ].join(" ").toLowerCase().includes(normalizedSearch);
    });
  }, [clients, search, showInactive]);

  const selectedRow = visibleRows.find((row) => row.id === selectedRowId) ?? null;
  const selectedLabel = selectedRow?.fullName ?? "Nenhum cliente selecionado";
  const disableSelectionActions = !selectedRow;

  const contactPlaceholderColumns: ColumnsType<ContactPlaceholderRow> = [
    { title: "Principal", dataIndex: "main", key: "main" },
    { title: "Detalhe", dataIndex: "detail", key: "detail" },
  ];

  function handleCloseModal() {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setEditingClient(null);
    form.resetFields();
  }

  async function handleCreateClient() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      const payload = await createClient(buildClientPayload(values));

      await loadClients();
      setSelectedRowId(payload.client.id);
      apiMessage.success(`Cliente "${values.name}" gravado com sucesso.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateClient() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      if (!selectedRowId) {
        apiMessage.warning("Selecione um cliente para alterar.");
        return;
      }

      await updateClient(selectedRowId, buildClientPayload(values));
      await loadClients();
      const refreshed = await fetchClientById(selectedRowId);
      setEditingClient(refreshed.client);
      apiMessage.success(`Cliente "${values.name}" atualizado com sucesso.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleEditClick = useCallback(async () => {
    if (!selectedRow?.id) {
      apiMessage.warning("Selecione um cliente para alterar.");
      return;
    }

    try {
      const payload = await fetchClientById(selectedRow.id);
      setEditingClient(payload.client);
      setIsEditModalOpen(true);
    } catch (error) {
      const nextMessage = error instanceof RegistryApiError || error instanceof Error
        ? error.message
        : "Nao foi possivel carregar os dados do cliente.";
      apiMessage.error(nextMessage);
    }
  }, [apiMessage, selectedRow]);

  useEffect(() => {
    if (!isEditModalOpen || !editingClient) {
      return;
    }

    form.setFieldsValue(mapClientToFormValues(editingClient));
  }, [editingClient, form, isEditModalOpen]);

  const columns: ColumnsType<ClientRecord> = [
    {
      title: "Cliente",
      dataIndex: "fullName",
      key: "name",
      render: (_, row) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{row.fullName}</Typography.Text>
          <Typography.Text type="secondary">{row.isActive ? "Ativo" : "Inativo"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Telefone",
      dataIndex: "primaryPhone",
      key: "phone",
      width: 160,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Codigo",
      dataIndex: "internalCode",
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
      dataIndex: "statusText",
      key: "status",
      width: 140,
      render: (value: string | null) => value ?? "Preparado",
    },
    {
      title: "Prestador",
      dataIndex: "responsibleName",
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
              onClick={() => setIsCreateModalOpen(true)}
            >
              Novo cliente
            </Button>
              <Button
                icon={<FileTextOutlined />}
                disabled={disableSelectionActions}
                onClick={() => { void handleEditClick(); }}
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
            <Dropdown
              trigger={["click"]}
              menu={{
                selectedKeys: [searchCriterion],
                items: clientSearchCriteria.map((item) => ({
                  key: item.key,
                  label: item.label,
                })),
                onClick: ({ key }) => {
                  setSearchCriterion(key);
                },
              }}
            >
              <Button className="cashflow-shell-control cadastro-shell-filter" icon={<DownOutlined />}>
                {getSearchCriterionLabel(searchCriterion)}
              </Button>
            </Dropdown>
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
  }, [apiMessage, disableSelectionActions, form, search, searchCriterion, selectedLabel, selectedRow, setShellBandContent]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      {loadError ? (
        <Alert type="error" showIcon message="Falha ao carregar clientes" description={loadError} />
      ) : null}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <div className="users-grid-shell">
            <Table<ClientRecord>
              rowKey="id"
              loading={isLoading}
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

      <Modal
        open={isCreateModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={688}
        destroyOnHidden
        className="terra-password-modal client-modal client-create-modal"
        >
          <div className="terra-password-modal-header">
            <Typography.Title level={3} className="terra-password-modal-title">
              Novo cliente - Dados principais
            </Typography.Title>
          </div>

          <Form<ClientFormValues>
            form={form}
            layout="vertical"
            preserve={false}
            className="terra-password-form client-modal-form client-create-modal-form"
            onFinish={() => void handleCreateClient()}
          >
            <div className="client-create-modal__form client-create-modal__form-linear">
              <div className="client-create-modal__row client-create-modal__row--single">
                <Typography.Text className="client-create-modal__label client-create-modal__label--required">Nome:</Typography.Text>
                <Form.Item
                  name="name"
                  className="client-create-form-item client-create-field client-create-field--name"
                  rules={[{ required: true, message: "Informe o nome do cliente." }]}
                >
                  <Input placeholder="Nome completo do cliente" />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--double">
                <Typography.Text className="client-create-modal__label">Sexo:</Typography.Text>
                <Form.Item name="sex" className="client-create-form-item client-create-field client-create-field--sex">
                  <Select placeholder="Sexo do cliente" options={sexOptions} />
                </Form.Item>
                <Typography.Text className="client-create-modal__label">Data de nascimento:</Typography.Text>
                <Form.Item name="birthDate" className="client-create-form-item client-create-field client-create-field--birth">
                  <DatePicker format="DD/MM/YYYY" placeholder="Data de nascimento em formato DD/MM/AAAA" className="client-modal-date" />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--single">
                <Typography.Text className="client-create-modal__label">CPF:</Typography.Text>
                <Form.Item
                  name="cpf"
                  className="client-create-form-item client-create-field client-create-field--cpf"
                  rules={[
                    {
                      validator(_, value) {
                        if (!value) {
                          return Promise.resolve();
                        }

                        const digits = String(value).replace(/\D/g, "");
                        if (digits.length === 11) {
                          return Promise.resolve();
                        }

                        return Promise.reject(new Error("Informe um CPF com 11 digitos."));
                      },
                    },
                  ]}
                >
                  <Input placeholder="CPF do cliente" />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--document">
                <Typography.Text className="client-create-modal__label">Documento:</Typography.Text>
                <Form.Item name="documentType" className="client-create-form-item client-create-field client-create-field--document-type">
                  <Select allowClear placeholder="RG" options={documentTypeOptions} />
                </Form.Item>
                <Form.Item name="documentNumber" className="client-create-form-item client-create-field client-create-field--document-number">
                  <Input placeholder="Número do documento" />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--single">
                <Typography.Text className="client-create-modal__label">Prestador responsável:</Typography.Text>
                <Form.Item name="responsibleName" className="client-create-form-item client-create-field client-create-field--responsible">
                  <Input placeholder="Gleisson Tel" suffix={<SearchOutlined className="client-create-suffix-icon" />} />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--phone">
                <Typography.Text className="client-create-modal__label">Telefone 1:</Typography.Text>
                <Form.Item name="phonePrimaryType" className="client-create-form-item client-create-field client-create-field--phone-type">
                  <Select allowClear placeholder="Celular" options={phoneTypeOptions} />
                </Form.Item>
                <Form.Item name="phonePrimaryDdd" className="client-create-form-item client-create-field client-create-field--phone-ddd">
                  <Input placeholder="DDD" />
                </Form.Item>
                <Form.Item name="phonePrimaryNumber" className="client-create-form-item client-create-field client-create-field--phone-number">
                  <Input placeholder="Número" />
                </Form.Item>
                <Form.Item name="phonePrimaryExtension" className="client-create-form-item client-create-field client-create-field--phone-extension">
                  <Input placeholder="Ramal" />
                </Form.Item>
              </div>

              <div className="client-create-modal__row client-create-modal__row--phone">
                <Typography.Text className="client-create-modal__label">Telefone 2:</Typography.Text>
                <Form.Item name="phoneSecondaryType" className="client-create-form-item client-create-field client-create-field--phone-type">
                  <Select allowClear placeholder="Residencial" options={phoneTypeOptions} />
                </Form.Item>
                <Form.Item name="phoneSecondaryDdd" className="client-create-form-item client-create-field client-create-field--phone-ddd">
                  <Input placeholder="DDD" />
                </Form.Item>
                <Form.Item name="phoneSecondaryNumber" className="client-create-form-item client-create-field client-create-field--phone-number">
                  <Input placeholder="Número" />
                </Form.Item>
                <Form.Item name="phoneSecondaryExtension" className="client-create-form-item client-create-field client-create-field--phone-extension">
                  <Input placeholder="Ramal" />
                </Form.Item>
              </div>
              <div className="client-create-modal__row client-create-modal__row--email">
                <Typography.Text className="client-create-modal__label">E-mail 1:</Typography.Text>
                <Form.Item name="emailPrimaryType" className="client-create-form-item client-create-field client-create-field--email-type">
                  <Select allowClear placeholder="Pessoal" options={emailTypeOptions} />
                </Form.Item>
                <Form.Item name="emailPrimaryAddress" className="client-create-form-item client-create-field client-create-field--email-address">
                  <Input placeholder="Endereço de e-mail" />
                </Form.Item>
              </div>
            </div>

            <div className="terra-password-modal-actions client-modal-actions">
              <Button onClick={() => apiMessage.info("Importação preparada para a próxima etapa.")}>Importar</Button>
              <Button type="primary" htmlType="submit" loading={isSubmitting}>
                Gravar cliente
              </Button>
              <Button onClick={handleCloseModal}>Cancelar</Button>
            </div>
          </Form>
        </Modal>

      <Modal
        open={isEditModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={1020}
        destroyOnHidden
        className="terra-password-modal client-modal client-edit-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Altera cliente
          </Typography.Title>
        </div>

        <Form<ClientFormValues>
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form client-modal-form"
          onFinish={() => void handleUpdateClient()}
          initialValues={{ publicVisibility: false, status: "ativo", benefitPrimary: "sem-beneficio" }}
        >
          <Tabs
            size="small"
            className="supplier-edit-tabs client-edit-tabs"
            items={[
              {
                key: "principais",
                label: "Dados principais",
                children: (
                  <div className="supplier-edit-main-grid">
                    <div className="supplier-edit-main-form">
                      <Form.Item name="name" label="Nome" rules={[{ required: true, message: "Informe o nome do cliente." }]}>
                        <Input placeholder="Nome completo do cliente" />
                      </Form.Item>
                      <Form.Item name="sex" label="Sexo">
                        <Select placeholder="Selecionar sexo" options={sexOptions} />
                      </Form.Item>
                      <Form.Item name="birthDate" label="Nascimento">
                        <DatePicker format="DD/MM/YYYY" placeholder="DD/MM/AAAA" className="client-modal-date" />
                      </Form.Item>
                      <Form.Item name="code" label="Codigo">
                        <Input placeholder="Codigo do cliente" />
                      </Form.Item>
                      <Form.Item
                        name="cpf"
                        label="CPF"
                        rules={[
                          {
                            validator(_, value) {
                              if (!value) {
                                return Promise.resolve();
                              }
                              const digits = String(value).replace(/\D/g, "");
                              return digits.length === 11
                                ? Promise.resolve()
                                : Promise.reject(new Error("Informe um CPF com 11 digitos."));
                            },
                          },
                        ]}
                      >
                        <Input placeholder="CPF do cliente" />
                      </Form.Item>
                      <div className="client-modal-document-row">
                        <Form.Item name="documentType" label="Documento" className="client-modal-document-type">
                          <Select allowClear placeholder="Tipo" options={documentTypeOptions} />
                        </Form.Item>
                        <Form.Item name="documentNumber" label="Numero do documento" className="client-modal-document-number">
                          <Input placeholder="Numero do documento" />
                        </Form.Item>
                      </div>
                      <Form.Item name="responsibleName" label="Responsavel">
                        <Input placeholder="Nome do responsavel" />
                      </Form.Item>
                      <Form.Item name="status" label="Situacao">
                        <Select placeholder="Selecionar situacao" options={statusOptions} />
                      </Form.Item>
                      <Form.Item name="benefitPrimary" label="Beneficio #1">
                        <Select placeholder="Selecionar beneficio" options={benefitOptions} />
                      </Form.Item>
                      <Form.Item name="beneficiaryCode" label="Codigo do beneficiario">
                        <Input placeholder="Codigo do beneficiario" />
                      </Form.Item>
                      <Form.Item name="benefitValidUntil" label="Data de validade">
                        <DatePicker format="DD/MM/YYYY" placeholder="DD/MM/AAAA" className="client-modal-date" />
                      </Form.Item>
                      <Button type="link" className="client-create-link" onClick={() => apiMessage.info("Criacao de novo beneficio preparada para a proxima etapa.")}>
                        Criar novo beneficio
                      </Button>
                    </div>

                    <aside className="supplier-avatar-panel">
                      <div className="supplier-avatar-box">
                        <AppstoreOutlined />
                      </div>
                      <Typography.Text className="supplier-avatar-copy">
                        Area preparada para foto, avatar ou logo do cliente.
                      </Typography.Text>
                    </aside>
                  </div>
                ),
              },
              {
                key: "contatos",
                label: "Contatos",
                children: (
                  <div className="supplier-contact-tab">
                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>Telefone principal</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Criacao de novo telefone preparada para a proxima etapa.")}>
                            Criar novo telefone
                          </Button>
                        </div>
                      </div>
                      <div className="supplier-contact-form-shell">
                        <div className="client-modal-communication-row">
                          <Typography.Text className="client-modal-group-label">Telefone 1</Typography.Text>
                          <div className="client-modal-communication-grid">
                            <Form.Item name="phonePrimaryType" className="client-modal-phone-type">
                              <Select allowClear placeholder="Tipo" options={phoneTypeOptions} />
                            </Form.Item>
                            <Form.Item name="phonePrimaryDdd" className="client-modal-phone-ddd">
                              <Input placeholder="DDD" />
                            </Form.Item>
                            <Form.Item name="phonePrimaryNumber" className="client-modal-phone-number">
                              <Input placeholder="Numero" />
                            </Form.Item>
                            <Form.Item name="phonePrimaryExtension" className="client-modal-phone-extension">
                              <Input placeholder="Ramal" />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>E-mails</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Criacao de novo e-mail preparada para a proxima etapa.")}>
                            Criar novo e-mail
                          </Button>
                        </div>
                      </div>
                      <div className="supplier-contact-form-shell">
                        <div className="client-modal-communication-row">
                          <Typography.Text className="client-modal-group-label">E-mail 1</Typography.Text>
                          <div className="client-modal-email-grid">
                            <Form.Item name="emailPrimaryType" className="client-modal-email-type">
                              <Select allowClear placeholder="Tipo" options={emailTypeOptions} />
                            </Form.Item>
                            <Form.Item name="emailPrimaryAddress" className="client-modal-email-address">
                              <Input placeholder="email@cliente.com" />
                            </Form.Item>
                          </div>
                        </div>
                      </div>
                    </section>

                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>Enderecos</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Criacao de novo endereco preparada para a proxima etapa.")}>
                            Criar novo endereco
                          </Button>
                        </div>
                      </div>
                      <Table<ContactPlaceholderRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={contactPlaceholderColumns}
                        dataSource={preparedContactRows}
                        locale={{ emptyText: "Nenhum endereco carregado ainda." }}
                      />
                    </section>
                  </div>
                ),
              },
              {
                key: "complementares",
                label: "Dados complementares",
                children: (
                  <div className="client-edit-extra-grid">
                    <Form.Item name="fatherName" label="Nome do pai">
                      <Input placeholder="Nome do pai" />
                    </Form.Item>
                    <Form.Item name="motherName" label="Nome da mae">
                      <Input placeholder="Nome da mae" />
                    </Form.Item>
                    <Form.Item name="socialName" label="Nome social">
                      <Input placeholder="Nome social" />
                    </Form.Item>
                    <Form.Item name="nickname" label="Apelido">
                      <Input placeholder="Apelido" />
                    </Form.Item>
                    <Form.Item name="occupation" label="Ocupacao">
                      <Input placeholder="Ocupacao" />
                    </Form.Item>
                    <Form.Item name="recordNumber" label="Prontuario">
                      <Input placeholder="Prontuario" />
                    </Form.Item>
                    <Form.Item name="maritalStatus" label="Estado civil">
                      <Select allowClear placeholder="Estado civil" options={maritalStatusOptions} />
                    </Form.Item>
                    <Form.Item name="spouseName" label="Conjuge">
                      <Input placeholder="Nome do conjuge" />
                    </Form.Item>
                    <Form.Item name="indicationType" label="Tipo de indicacao">
                      <Select allowClear placeholder="Tipo de indicacao" options={indicationTypeOptions} />
                    </Form.Item>
                    <Form.Item name="provider" label="Prestador">
                      <Select allowClear placeholder="Prestador" options={providerOptions} />
                    </Form.Item>
                    <Form.Item name="publicVisibility" valuePropName="checked" className="client-edit-visibility-item">
                      <Checkbox>Cliente publico (acessivel por todos prestadores)</Checkbox>
                    </Form.Item>
                  </div>
                ),
              },
              {
                key: "campos-livres",
                label: "Campos livres",
                children: (
                  <div className="module-empty-state client-edit-placeholder">
                    <Typography.Text type="secondary">
                      Area rolavel preparada para campos livres e extensoes futuras do cadastro.
                    </Typography.Text>
                  </div>
                ),
              },
              {
                key: "observacoes",
                label: "Observacoes",
                children: (
                  <Form.Item name="notes" label="Observacoes" className="client-edit-notes-item">
                    <Input.TextArea rows={12} placeholder="Observacoes gerais do cliente" />
                  </Form.Item>
                ),
              },
            ]}
          />

          <div className="terra-password-modal-actions client-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar cliente
            </Button>
            <Button danger onClick={() => apiMessage.info("Exclusao de cliente preparada para a proxima etapa.")}>
              Excluir
            </Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
