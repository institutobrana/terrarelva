import { Button, Dropdown, Form, Input, Modal, Space, Tooltip, Typography } from "antd";
import {
  CloseOutlined,
  CalendarOutlined,
  ClockCircleOutlined,
  DollarCircleFilled,
  FieldTimeOutlined,
  FileTextOutlined,
  HomeOutlined,
  InboxOutlined,
  MailOutlined,
  MoreOutlined,
  MoneyCollectOutlined,
  RocketOutlined,
  SearchOutlined,
  SnippetsOutlined,
  TransactionOutlined,
  UserAddOutlined,
  UserOutlined,
  UsergroupAddOutlined,
} from "@ant-design/icons";
import { useState } from "react";

import terraRelvaLogo from "../../../../assets/LOGO_TERRA_RELVA.png";

const toolbarGroups = [
  {
    key: "agenda-clinica",
    items: [
      { key: "/admin/hoje", label: "Dashboard", icon: <HomeOutlined /> },
      { key: "/admin/hoje/agenda", label: "Agenda", icon: <CalendarOutlined /> },
      { key: "/admin/producao/recentes", label: "Proximo agendado", icon: <FieldTimeOutlined /> },
      { key: "/admin/clientes", label: "Cadastro de pacientes", icon: <UsergroupAddOutlined /> },
      { key: "/admin/clientes", label: "Paciente", icon: <UserOutlined /> },
      { key: "/admin/clientes/favoritos", label: "Novo paciente", icon: <UserAddOutlined /> },
      { key: "/admin/produtos", label: "Anamnese", icon: <SnippetsOutlined /> },
      { key: "/admin/producao", label: "Ficha clinica", icon: <FileTextOutlined /> },
    ],
  },
  {
    key: "financeiro-estoque",
    items: [
      { key: "/admin/caixa/saidas", label: "Contas a pagar", icon: <DollarCircleFilled /> },
      { key: "/admin/caixa/recebiveis", label: "Contas a receber", icon: <MoneyCollectOutlined /> },
      { key: "/admin/caixa/fechamento", label: "Fluxo de caixa", icon: <TransactionOutlined /> },
      { key: "/admin/estoque", label: "Controle de estoque", icon: <InboxOutlined /> },
    ],
  },
  {
    key: "produtividade-crm",
    items: [
      { key: "/admin/precificacao", label: "Editor de textos", icon: <FileTextOutlined /> },
      { key: "/admin/clientes/com-telefone", label: "Mala direta", icon: <MailOutlined /> },
      { key: "/admin/vendas", label: "CRM de vendas", icon: <RocketOutlined /> },
    ],
  },
];

const userMenuItems = [
  { key: "preferencias", label: "Preferencias" },
  { key: "alterar-senha", label: "Alterar senha" },
  { key: "opcoes-conta", label: "Opcoes da conta" },
  { type: "divider" as const },
  { key: "sair", label: "Sair", icon: <UserOutlined /> },
];

function ActionButton({ action, onAction }: { action: (typeof toolbarGroups)[number]["items"][number]; onAction: (key: string) => void }) {
  return (
    <Tooltip title={action.label} placement="bottom">
      <Button
        type="text"
        icon={action.icon}
        onClick={() => onAction(action.key)}
        className="terra-action-button"
        aria-label={action.label}
      />
    </Tooltip>
  );
}

type AdminActionTopbarProps = {
  userLabel: string;
  onToolbarAction: (path: string) => void;
  onLogout: () => void;
};

export function AdminActionTopbar({ userLabel, onToolbarAction, onLogout }: AdminActionTopbarProps) {
  const [passwordModalOpen, setPasswordModalOpen] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [form] = Form.useForm<{
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }>();

  function handleClosePasswordModal() {
    setPasswordModalOpen(false);
    form.resetFields();
  }

  async function handleSubmitPassword(values: {
    currentPassword: string;
    nextPassword: string;
    confirmPassword: string;
  }) {
    void values;
    setIsSubmittingPassword(true);

    window.setTimeout(() => {
      setIsSubmittingPassword(false);
      form.setFields([
        {
          name: "confirmPassword",
          errors: ["Fluxo de troca real de senha ainda nao conectado ao backend."],
        },
      ]);
    }, 400);
  }

  return (
    <>
      <header className="terra-action-topbar">
        <div className="terra-action-topbar-brand">
          <img className="terra-action-topbar-logo" src={terraRelvaLogo} alt="Terra Relva" />
          <div className="terra-action-topbar-brand-copy">
            <Typography.Text className="terra-action-topbar-brand-name">Terra Relva</Typography.Text>
            <Typography.Text className="terra-action-topbar-brand-subtitle">Sistema de Gestao artesanal.</Typography.Text>
          </div>
        </div>

        <div className="terra-action-topbar-center">
          <div className="terra-action-topbar-toolbar" role="toolbar" aria-label="Acoes operacionais">
            {toolbarGroups.map((group, groupIndex) => (
              <Space key={group.key} size={6} className="terra-action-topbar-group">
                {group.items.map((action) => (
                  <ActionButton key={action.key} action={action} onAction={onToolbarAction} />
                ))}
                {groupIndex < toolbarGroups.length - 1 ? (
                  <span className="terra-action-topbar-divider" aria-hidden="true" />
                ) : null}
              </Space>
            ))}
          </div>

          <div className="terra-action-topbar-search-wrap">
            <Input
              allowClear
              prefix={<SearchOutlined />}
              placeholder="Pesquisar cliente, produto ou pedido"
              className="terra-action-topbar-search"
              onPressEnter={() => onToolbarAction("/admin/clientes")}
            />
          </div>
        </div>

        <Dropdown
          trigger={["click"]}
          placement="bottomRight"
          menu={{
            items: userMenuItems,
            onClick: ({ key }) => {
              if (key === "alterar-senha") {
                setPasswordModalOpen(true);
                return;
              }

              if (key === "sair") {
                onLogout();
              }
            },
          }}
        >
          <button type="button" className="terra-action-topbar-session" aria-label="Menu do usuario">
            <span className="terra-action-topbar-user-meta">
              <ClockCircleOutlined />
              <Typography.Text className="terra-action-topbar-user">{userLabel}</Typography.Text>
            </span>
            <MoreOutlined className="terra-action-topbar-user-more" />
          </button>
        </Dropdown>
      </header>

      <Modal
        open={passwordModalOpen}
        footer={null}
        onCancel={handleClosePasswordModal}
        closeIcon={<CloseOutlined />}
        centered
        width={580}
        destroyOnHidden
        className="terra-password-modal"
      >
        <div className="terra-password-modal-header">
          <Typography.Title level={3} className="terra-password-modal-title">
            Altera senha
          </Typography.Title>
        </div>

        <Form form={form} layout="vertical" onFinish={handleSubmitPassword} className="terra-password-form">
          <Form.Item
            label="Senha atual"
            name="currentPassword"
            rules={[{ required: true, message: "Informe a senha atual." }]}
          >
            <Input.Password placeholder="Senha atual" />
          </Form.Item>

          <Form.Item
            label="Nova senha"
            name="nextPassword"
            rules={[{ required: true, message: "Informe a nova senha." }]}
          >
            <Input.Password placeholder="Nova senha" />
          </Form.Item>

          <Form.Item
            label="Confirmação"
            name="confirmPassword"
            dependencies={["nextPassword"]}
            rules={[
              { required: true, message: "Confirme a nova senha." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("nextPassword") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("A confirmacao precisa ser igual a nova senha."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Confirmação da nova senha" />
          </Form.Item>

          <div className="terra-password-modal-actions">
            <Button type="primary" htmlType="submit" loading={isSubmittingPassword}>
              Gravar senha
            </Button>
            <Button onClick={handleClosePasswordModal}>Cancelar</Button>
          </div>
        </Form>
      </Modal>
    </>
  );
}
