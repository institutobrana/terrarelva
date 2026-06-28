import type { PropsWithChildren } from "react";

import { App as AntApp, ConfigProvider } from "antd";
import ptBR from "antd/locale/pt_BR";

import { AuthProvider } from "@/app/providers/AuthProvider";
import { terraRelvaTheme } from "@/theme/antdTheme";

export function AppProviders({ children }: PropsWithChildren) {
  return (
    <ConfigProvider locale={ptBR} theme={terraRelvaTheme}>
      <AntApp>
        <AuthProvider>{children}</AuthProvider>
      </AntApp>
    </ConfigProvider>
  );
}
