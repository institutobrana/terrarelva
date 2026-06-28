import { Alert, Button, Card, Form, Input, Space, Typography } from "antd";
import { LockOutlined, MailOutlined, SafetyCertificateOutlined } from "@ant-design/icons";
import { useEffect, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/hooks/useAuth";
import terraRelvaLogo from "../../../../assets/LOGO_TERRA_RELVA.png";

export function LoginPage() {
  const { isAuthenticated, isBootstrapping, login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (isBootstrapping || !isAuthenticated) {
      return;
    }

    const redirectTarget = (location.state as { from?: string } | null)?.from ?? "/admin";
    navigate(redirectTarget, { replace: true });
  }, [isAuthenticated, isBootstrapping, location.state, navigate]);

  async function handleFinish(values: { email: string; password: string }) {
    setErrorMessage(null);
    setIsSubmitting(true);

    try {
      await login(values.email, values.password);
      const redirectTarget = (location.state as { from?: string } | null)?.from ?? "/admin";
      navigate(redirectTarget, { replace: true });
    } catch (error) {
      setErrorMessage(error instanceof Error ? error.message : "Nao foi possivel entrar.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="auth-shell">
      <Card className="auth-card">
        <div className="auth-brand">
          <img src={terraRelvaLogo} alt="Terra Relva" className="auth-brand-logo" />
          <div>
            <Typography.Text className="auth-kicker">Uso interno</Typography.Text>
            <Typography.Title level={2}>Entrar no Terra Relva</Typography.Title>
            <Typography.Paragraph className="auth-copy">
              Acesso restrito ao ambiente administrativo. Nao existe cadastro publico neste sistema.
            </Typography.Paragraph>
          </div>
        </div>

        <div className="auth-notice">
          <SafetyCertificateOutlined />
          <span>Somente usuarios internos autorizados podem acessar o painel.</span>
        </div>

        {errorMessage ? <Alert type="error" showIcon message={errorMessage} style={{ marginBottom: 16 }} /> : null}

        <Form layout="vertical" onFinish={handleFinish} autoComplete="off">
          <Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Informe o e-mail." }]}>
            <Input prefix={<MailOutlined />} placeholder="admin@terrarelva.com" size="large" />
          </Form.Item>

          <Form.Item label="Senha" name="password" rules={[{ required: true, message: "Informe a senha." }]}>
            <Input.Password prefix={<LockOutlined />} placeholder="Sua senha" size="large" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmitting} size="large" block>
            Entrar
          </Button>
        </Form>

        <Space direction="vertical" size={4} className="auth-footer-copy">
          <Typography.Text type="secondary">Login protegido para operacao interna.</Typography.Text>
          <Typography.Text type="secondary">Sem criacao publica de conta, sem onboarding externo.</Typography.Text>
        </Space>
      </Card>
    </div>
  );
}
