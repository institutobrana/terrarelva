import type { ThemeConfig } from "antd";

export const terraRelvaTheme: ThemeConfig = {
  token: {
    colorPrimary: "#436245",
    colorInfo: "#5a7652",
    colorSuccess: "#5a7652",
    colorWarning: "#b78a46",
    colorError: "#a84f3c",
    colorBgLayout: "#f3eee6",
    colorBgContainer: "#fefcf8",
    colorBorderSecondary: "#ddd4c6",
    colorText: "#25352d",
    colorTextSecondary: "#5f6f63",
    borderRadius: 18,
    fontFamily: '"Segoe UI", "Trebuchet MS", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: "#f3eee6",
      headerBg: "#fefcf8",
      siderBg: "#fefcf8",
    },
    Menu: {
      itemBorderRadius: 14,
      itemMarginInline: 10,
      itemMarginBlock: 6,
      itemSelectedBg: "#e7eee2",
      itemSelectedColor: "#36513d",
      itemHoverColor: "#36513d",
    },
    Card: {
      borderRadiusLG: 24,
    },
    Button: {
      controlHeightLG: 48,
    },
    Tag: {
      defaultBg: "#eef3ea",
      defaultColor: "#35513d",
    },
  },
};
