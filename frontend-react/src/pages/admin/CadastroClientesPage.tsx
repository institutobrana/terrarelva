import {
  CloseOutlined,
  DownOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  PrinterOutlined,
  SearchOutlined,
  SolutionOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, DatePicker, Dropdown, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
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

type ClientFormValues = {
  name: string;
  sex: string;
  birthDate: unknown;
  cpf: string | undefined;
  documentType: string | undefined;
  documentNumber: string | undefined;
  responsibleName: string | undefined;
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
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [searchCriterion, setSearchCriterion] = useState("nome-cliente");
  const [search, setSearch] = useState("");
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  function handleCloseModal() {
    setIsModalOpen(false);
    form.resetFields();
  }

  async function handleCreateClient() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      apiMessage.success(`Cliente "${values.name}" validado e preparado para gravacao na proxima etapa.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

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
              onClick={() => setIsModalOpen(true)}
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
  }, [apiMessage, disableSelectionActions, search, searchCriterion, selectedLabel, setShellBandContent]);

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

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={820}
        destroyOnHidden
        className="terra-password-modal client-modal"
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
          className="terra-password-form client-modal-form"
          onFinish={() => void handleCreateClient()}
        >
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: "Informe o nome do cliente." }]}>
            <Input placeholder="Nome completo do cliente" />
          </Form.Item>

          <Form.Item name="sex" label="Sexo">
            <Select placeholder="Selecionar sexo" options={sexOptions} />
          </Form.Item>

          <Form.Item name="birthDate" label="Data de nascimento">
            <DatePicker format="DD/MM/YYYY" placeholder="DD/MM/AAAA" className="client-modal-date" />
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

          <div className="client-modal-document-row">
            <Form.Item name="documentType" label="Documento" className="client-modal-document-type">
              <Select allowClear placeholder="Tipo" options={documentTypeOptions} />
            </Form.Item>

            <Form.Item name="documentNumber" label="Numero do documento" className="client-modal-document-number">
              <Input placeholder="Numero do documento" />
            </Form.Item>
          </div>

          <Form.Item name="responsibleName" label="Responsavel principal">
            <Input placeholder="Nome do responsavel" />
          </Form.Item>

          <div className="client-modal-communication-row">
            <Typography.Text className="client-modal-group-label">Telefone 1</Typography.Text>
            <div className="client-modal-communication-grid">
              <Form.Item name="phonePrimaryType" className="client-modal-phone-type">
                <Select allowClear placeholder="Tipo" options={phoneTypeOptions} />
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
                <Select allowClear placeholder="Tipo" options={phoneTypeOptions} />
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
                <Select allowClear placeholder="Tipo" options={emailTypeOptions} />
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
                <Input placeholder="email@cliente.com" />
              </Form.Item>
            </div>
          </div>

          <div className="terra-password-modal-actions client-modal-actions">
            <Button onClick={() => apiMessage.info("Importacao de cliente preparada para a proxima etapa.")}>
              Importar
            </Button>
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar cliente
            </Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
