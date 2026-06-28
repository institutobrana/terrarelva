import {
  CloseOutlined,
  FileTextOutlined,
  InfoCircleOutlined,
  PlusOutlined,
} from "@ant-design/icons";
import { Button, Checkbox, Form, Input, Modal, Select, Space, Table, Typography, message } from "antd";
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

type BankAccountFormValues = {
  accountName: string;
  provider: string | undefined;
  bankName: string;
  branch: string;
  accountNumber: string;
  accountDigit: string | undefined;
  accountType: string;
  holderName: string | undefined;
  holderDocument: string | undefined;
};

const providerOptions = [
  { label: "Selecionar depois", value: "placeholder-provider" },
];

const bankOptions = [
  { label: "Banco do Brasil", value: "banco-do-brasil" },
  { label: "Caixa Economica Federal", value: "caixa" },
  { label: "Bradesco", value: "bradesco" },
  { label: "Itau", value: "itau" },
  { label: "Santander", value: "santander" },
  { label: "Sicoob", value: "sicoob" },
];

const accountTypeOptions = [
  { label: "Conta corrente", value: "corrente" },
  { label: "Conta poupanca", value: "poupanca" },
  { label: "Conta de pagamento", value: "pagamento" },
];

export function ContasBancariasPage() {
  const { setShellBandContent } = useAdminShellBand();
  const [form] = Form.useForm<BankAccountFormValues>();
  const [showInactive, setShowInactive] = useState(false);
  const [selectedRowId, setSelectedRowId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  function handleCloseModal() {
    setIsModalOpen(false);
    form.resetFields();
  }

  async function handleCreateAccount() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      apiMessage.success(`Conta "${values.accountName}" validada e preparada para gravacao na proxima etapa.`);
      handleCloseModal();
    } finally {
      setIsSubmitting(false);
    }
  }

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional de contas bancarias">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes do modulo contas bancarias">
          <Button
            type="primary"
            icon={<PlusOutlined />}
            onClick={() => setIsModalOpen(true)}
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

      <Modal
        open={isModalOpen}
        footer={null}
        onCancel={handleCloseModal}
        closeIcon={<CloseOutlined />}
        centered
        width={760}
        destroyOnHidden
        className="terra-password-modal bank-account-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Nova conta bancaria
          </Typography.Title>
        </div>

        <Form<BankAccountFormValues>
          form={form}
          layout="vertical"
          preserve={false}
          className="terra-password-form bank-account-form"
          onFinish={() => void handleCreateAccount()}
        >
          <Form.Item
            name="accountName"
            label="Nome da conta"
            rules={[{ required: true, message: "Informe o nome da conta." }]}
          >
            <Input placeholder="Ex.: Caixa loja matriz" />
          </Form.Item>

          <Form.Item name="provider" label="Prestador">
            <Select
              showSearch
              allowClear
              placeholder="Selecionar prestador"
              options={providerOptions}
              optionFilterProp="label"
            />
          </Form.Item>

          <Form.Item
            name="bankName"
            label="Banco"
            rules={[{ required: true, message: "Selecione o banco." }]}
          >
            <Select placeholder="Selecionar banco" options={bankOptions} optionFilterProp="label" showSearch />
          </Form.Item>

          <Form.Item
            name="branch"
            label="Agencia"
            rules={[{ required: true, message: "Informe a agencia." }]}
          >
            <Input placeholder="Numero da agencia" />
          </Form.Item>

          <div className="bank-account-form-account-row">
            <Form.Item
              name="accountNumber"
              label="Conta"
              rules={[{ required: true, message: "Informe a conta." }]}
              className="bank-account-form-account-number"
            >
              <Input placeholder="Numero da conta" />
            </Form.Item>

            <Form.Item name="accountDigit" label="DV da conta" className="bank-account-form-account-digit">
              <Input placeholder="DV" />
            </Form.Item>
          </div>

          <Form.Item
            name="accountType"
            label="Tipo da conta"
            rules={[{ required: true, message: "Selecione o tipo da conta." }]}
          >
            <Select placeholder="Selecionar tipo" options={accountTypeOptions} />
          </Form.Item>

          <Form.Item name="holderName" label="Nome do titular">
            <Input placeholder="Nome do titular da conta" />
          </Form.Item>

          <Form.Item name="holderDocument" label="CPF/CNPJ do titular">
            <Input placeholder="CPF ou CNPJ" />
          </Form.Item>

          <div className="terra-password-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmitting}>
              Gravar conta
            </Button>
            <Button onClick={handleCloseModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </div>
  );
}
