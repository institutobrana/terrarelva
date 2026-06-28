import {
  AppstoreOutlined,
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
  SearchOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Select, Table, Tabs, Typography, message } from "antd";
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

const supplierSegmentOptions = [
  { label: "Materias-primas", value: "materias-primas" },
  { label: "Embalagens", value: "embalagens" },
  { label: "Distribuicao", value: "distribuicao" },
];

const phoneTypeOptions = [
  { label: "Celular", value: "celular" },
  { label: "Residencial", value: "residencial" },
  { label: "Comercial", value: "comercial" },
];

const emailTypeOptions = [
  { label: "Principal", value: "principal" },
  { label: "Comercial", value: "comercial" },
  { label: "Financeiro", value: "financeiro" },
];

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
  main: string;
  detail: string;
  note: string | null;
};

const preparedAddresses: ContactRow[] = [];
const preparedPhones: ContactRow[] = [];
const preparedEmails: ContactRow[] = [];

export function CadastroFornecedoresPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [form] = Form.useForm<SupplierFormValues>();
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [selectedSegment, setSelectedSegment] = useState("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const contactColumns: ColumnsType<ContactRow> = [
    { title: "Principal", dataIndex: "main", key: "main", render: (value: string) => value },
    { title: "Detalhe", dataIndex: "detail", key: "detail", render: (value: string) => value },
    { title: "Observacao", dataIndex: "note", key: "note", render: (value: string | null) => value ?? "Preparado" },
  ];

  function handleCloseModal() {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    form.resetFields();
  }

  async function handleCreateSupplier() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      apiMessage.success(`Fornecedor "${values.supplierName}" validado e preparado para gravacao na proxima etapa.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleUpdateSupplier() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      apiMessage.success(`Fornecedor "${values.supplierName}" validado para alteracao na proxima etapa.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

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
              onClick={() => setIsCreateModalOpen(true)}
            >
              Novo fornecedor
            </Button>
            <Button
              icon={<FileTextOutlined />}
              disabled={disableSelectionActions}
              onClick={() => {
                if (!selectedRow) {
                  apiMessage.warning("Selecione um fornecedor para alterar.");
                  return;
                }

                form.setFieldsValue({
                  supplierName: selectedRow.name,
                  companyName: undefined,
                  document: selectedRow.document ?? undefined,
                  stateRegistration: undefined,
                  portal: undefined,
                  segment: selectedRow.segment ?? undefined,
                  paymentDetails: undefined,
                  notes: undefined,
                  isActive: true,
                  phonePrimaryType: undefined,
                  phonePrimaryDdd: undefined,
                  phonePrimaryNumber: undefined,
                  phonePrimaryExtension: undefined,
                  phoneSecondaryType: undefined,
                  phoneSecondaryDdd: undefined,
                  phoneSecondaryNumber: undefined,
                  phoneSecondaryExtension: undefined,
                  emailPrimaryType: undefined,
                  emailPrimaryAddress: selectedRow.email ?? undefined,
                });
                setIsEditModalOpen(true);
              }}
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
  }, [apiMessage, disableSelectionActions, form, search, selectedRow, selectedSegment, setShellBandContent]);

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
            label="Segmento"
            rules={[{ required: true, message: "Selecione o segmento." }]}
          >
            <Select placeholder="Selecionar segmento" options={supplierSegmentOptions} />
          </Form.Item>

          <div className="supplier-modal-divider" aria-hidden="true" />

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
                <Input placeholder="email@fornecedor.com" />
              </Form.Item>
            </div>
          </div>

          <div className="terra-password-modal-actions client-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar fornecedor
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
        width={980}
        destroyOnHidden
        className="terra-password-modal client-modal supplier-modal supplier-edit-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Altera fornecedor
          </Typography.Title>
        </div>

        <Form<SupplierFormValues>
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
                        label="Segmento"
                        rules={[{ required: true, message: "Selecione o segmento." }]}
                      >
                        <Select placeholder="Selecionar segmento" options={supplierSegmentOptions} />
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

                    <aside className="supplier-avatar-panel">
                      <div className="supplier-avatar-box">
                        <AppstoreOutlined />
                      </div>
                      <Typography.Text className="supplier-avatar-copy">
                        Area preparada para logo, foto ou avatar do fornecedor.
                      </Typography.Text>
                    </aside>
                  </div>
                ),
              },
              {
                key: "contato",
                label: "Dados de contato",
                children: (
                  <div className="supplier-contact-tab">
                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>Enderecos</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Novo endereco preparado para a proxima etapa.")}>
                            Novo endereco
                          </Button>
                          <Button size="small" onClick={() => apiMessage.info("Alteracao de endereco preparada para a proxima etapa.")}>
                            Alterar
                          </Button>
                          <Button size="small" onClick={() => apiMessage.info("Propriedades de endereco preparadas para a proxima etapa.")}>
                            Propriedades
                          </Button>
                        </div>
                      </div>
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={contactColumns}
                        dataSource={preparedAddresses}
                        locale={{ emptyText: "Nenhum endereco carregado ainda." }}
                      />
                    </section>

                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>Telefones</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Novo telefone preparado para a proxima etapa.")}>
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
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={contactColumns}
                        dataSource={preparedPhones}
                        locale={{ emptyText: "Nenhum telefone carregado ainda." }}
                      />
                    </section>

                    <section className="supplier-contact-block">
                      <div className="supplier-contact-block-header">
                        <Typography.Text strong>E-mails</Typography.Text>
                        <div className="supplier-contact-block-actions">
                          <Button size="small" onClick={() => apiMessage.info("Novo e-mail preparado para a proxima etapa.")}>
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
                      <Table<ContactRow>
                        rowKey="id"
                        size="small"
                        pagination={false}
                        columns={contactColumns}
                        dataSource={preparedEmails}
                        locale={{ emptyText: "Nenhum e-mail carregado ainda." }}
                      />
                    </section>
                  </div>
                ),
              },
            ]}
          />

          <div className="terra-password-modal-actions client-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar fornecedor
            </Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
