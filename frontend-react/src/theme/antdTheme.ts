import type { ThemeConfig } from "antd";

export const terraRelvaTheme: ThemeConfig = {
  token: {
    colorPrimary: "#5c7f4a",
    colorInfo: "#5c7f4a",
    colorSuccess: "#517f5b",
    colorWarning: "#c8892d",
    colorError: "#b44d3b",
    colorBgLayout: "#f4efe6",
    colorBgContainer: "#fffdf9",
    colorBorderSecondary: "#e6ddcf",
    colorText: "#2d342f",
    colorTextSecondary: "#667164",
    borderRadius: 18,
    fontFamily: '"Segoe UI", "Trebuchet MS", sans-serif',
  },
  components: {
    Layout: {
      bodyBg: "#f4efe6",
      headerBg: "#fffdf9",
      siderBg: "#fffdf9",
    },
    Menu: {
      itemBorderRadius: 14,
      itemMarginInline: 10,
      itemMarginBlock: 6,
      itemSelectedBg: "#edf3e7",
      itemSelectedColor: "#35513d",
      itemHoverColor: "#35513d",
    },
    Card: {
      borderRadiusLG: 24,
    },
    Button: {
      controlHeightLG: 48,
    },
  },
};
