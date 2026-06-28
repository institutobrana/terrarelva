import { Alert, Button, Card, Form, Input, Typography } from "antd";
import { useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";

import { useAuth } from "@/app/hooks/useAuth";

export function LoginPage() {
  const { login } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

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
        <Typography.Text type="secondary">Acesso interno</Typography.Text>
        <Typography.Title level={2}>Entrar no Terra Relva</Typography.Title>
        <Typography.Paragraph>
          Base tecnica pronta para login interno. Nao existe criacao publica de conta.
        </Typography.Paragraph>

        {errorMessage ? <Alert type="error" showIcon message={errorMessage} style={{ marginBottom: 16 }} /> : null}

        <Form layout="vertical" onFinish={handleFinish} autoComplete="off">
          <Form.Item label="E-mail" name="email" rules={[{ required: true, message: "Informe o e-mail." }]}>
            <Input placeholder="admin@terrarelva.com" />
          </Form.Item>

          <Form.Item label="Senha" name="password" rules={[{ required: true, message: "Informe a senha." }]}>
            <Input.Password placeholder="Sua senha" />
          </Form.Item>

          <Button type="primary" htmlType="submit" loading={isSubmitting} block>
            Entrar
          </Button>
        </Form>
      </Card>
    </div>
  );
}
