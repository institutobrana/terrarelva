import {
  CheckCircleOutlined,
  KeyOutlined,
  PlusOutlined,
  ReloadOutlined,
  SettingOutlined,
  StopOutlined,
  UserOutlined,
} from "@ant-design/icons";
import {
  Alert,
  Button,
  Checkbox,
  Form,
  Input,
  Modal,
  Select,
  Space,
  Table,
  Tag,
  Typography,
  message,
} from "antd";
import type { ColumnsType } from "antd/es/table";
import { useEffect, useEffectEvent, useMemo, useState } from "react";

import { useAuth } from "@/app/hooks/useAuth";
import { useAdminShellBand } from "@/components/admin/AdminShellBandContext";
import { ModuleSectionCard } from "@/components/admin/ModuleSectionCard";
import {
  createInternalUserRequest,
  fetchInternalUsers,
  type InternalUser,
  type UsersFilter,
  updateInternalUserAccess,
  UsersApiError,
} from "@/services/users/usersApi";

type CreateUserFormValues = {
  name: string;
  email: string;
  password: string;
  confirmPassword: string;
  role: string;
  isActive: boolean;
};

function formatRole(role: string) {
  if (role === "admin") {
    return "Administrador";
  }

  if (role === "manager") {
    return "Gestor";
  }

  if (role === "operator") {
    return "Operacional";
  }

  return role;
}

function formatDate(value: string | null) {
  if (!value) {
    return "Sem acesso registrado";
  }

  return new Date(value).toLocaleString("pt-BR");
}

export function UsuariosSistemaPage() {
  const { user, clearInvalidSession } = useAuth();
  const { setShellBandContent } = useAdminShellBand();
  const [form] = Form.useForm<CreateUserFormValues>();
  const [users, setUsers] = useState<InternalUser[]>([]);
  const [filter, setFilter] = useState<UsersFilter>("active");
  const [showInactive, setShowInactive] = useState(false);
  const [selectedUserId, setSelectedUserId] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [apiMessage, messageContext] = message.useMessage();

  const effectiveFilter = useMemo<UsersFilter>(() => {
    if (filter === "inactive") {
      return "inactive";
    }

    return showInactive ? "all" : "active";
  }, [filter, showInactive]);

  const selectedUser = users.find((entry) => entry.id === selectedUserId) ?? null;

  const loadUsers = useEffectEvent(async (nextFilter: UsersFilter = effectiveFilter, preserveSelection = true) => {
    setIsLoading(true);

    try {
      const payload = await fetchInternalUsers(nextFilter);
      setUsers(payload.users);
      setSelectedUserId((currentSelection) => {
        if (!preserveSelection) {
          return payload.users[0]?.id ?? null;
        }

        return payload.users.some((entry) => entry.id === currentSelection) ? currentSelection : payload.users[0]?.id ?? null;
      });
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Nao foi possivel carregar os usuarios.";
      apiMessage.error(nextMessage);
      if (error instanceof UsersApiError && error.status === 401) {
        clearInvalidSession();
      }
    } finally {
      setIsLoading(false);
    }
  });

  useEffect(() => {
    void loadUsers(effectiveFilter);
  }, [effectiveFilter]);

  const columns: ColumnsType<InternalUser> = [
    {
      title: "Nome do usuario",
      dataIndex: "name",
      key: "name",
      render: (_, entry) => (
        <Space direction="vertical" size={2}>
          <Typography.Text strong>{entry.name}</Typography.Text>
          <Typography.Text type="secondary">{entry.isActive ? "Acesso habilitado" : "Acesso desabilitado"}</Typography.Text>
        </Space>
      ),
    },
    {
      title: "Perfil",
      dataIndex: "role",
      key: "role",
      width: 160,
      render: (value: string) => <Tag color={value === "admin" ? "green" : "gold"}>{formatRole(value)}</Tag>,
    },
    {
      title: "Login",
      dataIndex: "email",
      key: "email",
      width: 240,
    },
    {
      title: "Prestador",
      key: "provider",
      width: 180,
      render: () => <Typography.Text type="secondary">Nao mapeado no dominio atual</Typography.Text>,
    },
    {
      title: "Ultimo acesso",
      dataIndex: "lastLoginAt",
      key: "lastLoginAt",
      width: 220,
      render: (value: string | null) => <Typography.Text type="secondary">{formatDate(value)}</Typography.Text>,
    },
  ];

  async function handleCreateUser() {
    try {
      const values = await form.validateFields();
      setIsSubmitting(true);
      await createInternalUserRequest(values);
      apiMessage.success("Usuario interno criado com sucesso.");
      setIsModalOpen(false);
      form.resetFields();
      setFilter(values.isActive ? "active" : "inactive");
      setShowInactive(values.isActive ? showInactive : false);
      await loadUsers(values.isActive ? "active" : "inactive", false);
    } catch (error) {
      if (error instanceof UsersApiError) {
        apiMessage.error(error.message);
      }
    } finally {
      setIsSubmitting(false);
    }
  }

  const handleAccessToggle = useEffectEvent(async (nextIsActive: boolean) => {
    if (!selectedUser) {
      apiMessage.warning("Selecione um usuario para alterar o acesso.");
      return;
    }

    try {
      setIsSubmitting(true);
      await updateInternalUserAccess(selectedUser.id, nextIsActive);
      apiMessage.success(nextIsActive ? "Acesso habilitado." : "Acesso desabilitado.");

      const nextFilter =
        effectiveFilter === "active" && !nextIsActive
          ? "active"
          : effectiveFilter === "inactive" && nextIsActive
            ? "inactive"
            : effectiveFilter;

      await loadUsers(nextFilter);
    } catch (error) {
      const nextMessage = error instanceof Error ? error.message : "Nao foi possivel atualizar o acesso.";
      apiMessage.error(nextMessage);
    } finally {
      setIsSubmitting(false);
    }
  });

  const disabledWithoutSelection = !selectedUser;
  const isAdminUser = user?.role === "admin";

  useEffect(() => {
    setShellBandContent(
      <section className="users-shell-band" aria-label="Barra operacional de usuarios">
        <div className="users-shell-band-toolbar" role="toolbar" aria-label="Acoes da tela de usuarios">
          <Button type="primary" icon={<PlusOutlined />} onClick={() => setIsModalOpen(true)}>
            Novo usuario
          </Button>
          <Button icon={<UserOutlined />} disabled={disabledWithoutSelection}>
            Alterar
          </Button>
          <Button icon={<SettingOutlined />} disabled={disabledWithoutSelection}>
            Propriedades
          </Button>
          <Button
            icon={<CheckCircleOutlined />}
            disabled={disabledWithoutSelection || selectedUser?.isActive}
            loading={isSubmitting}
            onClick={() => void handleAccessToggle(true)}
          >
            Habilitar acesso
          </Button>
          <Button
            danger
            icon={<StopOutlined />}
            disabled={disabledWithoutSelection || !selectedUser?.isActive}
            loading={isSubmitting}
            onClick={() => void handleAccessToggle(false)}
          >
            Desabilitar acesso
          </Button>
          <Button icon={<KeyOutlined />} disabled={disabledWithoutSelection}>
            Permissoes especiais
          </Button>
          <span className="users-shell-band-divider" aria-hidden="true" />
          <Button icon={<ReloadOutlined />} onClick={() => void loadUsers(effectiveFilter)}>
            Atualizar grade
          </Button>
        </div>
      </section>,
    );

    return () => {
      setShellBandContent(null);
    };
  }, [
    disabledWithoutSelection,
    effectiveFilter,
    isSubmitting,
    selectedUser,
    setShellBandContent,
  ]);

  return (
    <div className="module-page-shell users-admin-page">
      {messageContext}

      {!isAdminUser ? (
        <Alert type="error" showIcon message="Acesso restrito" description="Somente administradores podem abrir esta tela." />
      ) : null}

      <ModuleSectionCard>
        <div className="module-table-shell">
          <Space direction="vertical" size={18} style={{ width: "100%" }}>
            {!selectedUser ? (
              <Alert
                type="info"
                showIcon
                message="Nenhum usuario selecionado"
                description="As acoes dependentes de linha ficam desabilitadas ate voce selecionar um registro na grade."
              />
            ) : null}

            <div className="users-grid-shell">
              <Table<InternalUser>
                rowKey="id"
                loading={isLoading}
                className="module-table users-admin-table"
                columns={columns}
                dataSource={users}
                pagination={false}
                rowSelection={{
                  type: "radio",
                  selectedRowKeys: selectedUserId ? [selectedUserId] : [],
                  onChange: (selectedRowKeys) => setSelectedUserId((selectedRowKeys[0] as string) ?? null),
                }}
                onRow={(record) => ({
                  onClick: () => setSelectedUserId(record.id),
                })}
                rowClassName={(record) => (record.id === selectedUserId ? "users-table-row-selected" : "")}
                locale={{ emptyText: "Nenhum usuario encontrado para o filtro atual." }}
                footer={() => (
                  <div className="users-grid-footer">
                    <Space wrap size={16}>
                      <Checkbox
                        checked={showInactive}
                        onChange={(event) => {
                          setShowInactive(event.target.checked);
                          setFilter("active");
                        }}
                      >
                        Visualizar inativos
                      </Checkbox>
                      <Button
                        type={filter === "inactive" ? "primary" : "default"}
                        size="small"
                        onClick={() => {
                          setFilter("inactive");
                          setShowInactive(false);
                        }}
                      >
                        Somente inativos
                      </Button>
                      <Button
                        type={filter === "active" && !showInactive ? "primary" : "default"}
                        size="small"
                        onClick={() => {
                          setFilter("active");
                          setShowInactive(false);
                        }}
                      >
                        Somente ativos
                      </Button>
                    </Space>
                    <Typography.Text strong>Total de registros: {users.length}</Typography.Text>
                  </div>
                )}
              />
            </div>
          </Space>
        </div>
      </ModuleSectionCard>

      <Modal
        open={isModalOpen}
        title="Novo usuario interno"
        okText="Criar usuario"
        cancelText="Cancelar"
        onCancel={() => {
          setIsModalOpen(false);
          form.resetFields();
        }}
        onOk={() => void handleCreateUser()}
        confirmLoading={isSubmitting}
        destroyOnClose
      >
        <Form<CreateUserFormValues>
          form={form}
          layout="vertical"
          initialValues={{ role: "operator", isActive: true }}
          preserve={false}
        >
          <Form.Item name="name" label="Nome" rules={[{ required: true, message: "Informe o nome." }]}>
            <Input placeholder="Nome completo do usuario" />
          </Form.Item>
          <Form.Item
            name="email"
            label="E-mail ou login"
            rules={[
              { required: true, message: "Informe o e-mail." },
              { type: "email", message: "Informe um e-mail valido." },
            ]}
          >
            <Input placeholder="usuario@terrarelva.com" />
          </Form.Item>
          <Form.Item name="role" label="Perfil" rules={[{ required: true, message: "Selecione o perfil." }]}>
            <Select
              options={[
                { label: "Administrador", value: "admin" },
                { label: "Gestor", value: "manager" },
                { label: "Operacional", value: "operator" },
              ]}
            />
          </Form.Item>
          <Form.Item name="password" label="Senha inicial" rules={[{ required: true, message: "Informe a senha." }]}>
            <Input.Password placeholder="Senha inicial" />
          </Form.Item>
          <Form.Item
            name="confirmPassword"
            label="Confirmacao da senha"
            dependencies={["password"]}
            rules={[
              { required: true, message: "Confirme a senha." },
              ({ getFieldValue }) => ({
                validator(_, value) {
                  if (!value || getFieldValue("password") === value) {
                    return Promise.resolve();
                  }

                  return Promise.reject(new Error("A confirmacao precisa ser igual a senha."));
                },
              }),
            ]}
          >
            <Input.Password placeholder="Repita a senha" />
          </Form.Item>
          <Form.Item name="isActive" valuePropName="checked">
            <Checkbox>Usuario ja entra com acesso habilitado</Checkbox>
          </Form.Item>
        </Form>
      </Modal>
    </div>
  );
}
