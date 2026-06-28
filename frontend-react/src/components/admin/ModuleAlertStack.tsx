import { Alert, Space } from "antd";

type ModuleAlertStackProps = {
  title: string;
  items: string[];
  type?: "info" | "warning" | "error" | "success";
};

export function ModuleAlertStack({ title, items, type = "warning" }: ModuleAlertStackProps) {
  if (!items.length) {
    return null;
  }

  return (
    <Space direction="vertical" size={12} style={{ width: "100%" }}>
      {items.map((item, index) => (
        <Alert key={`${title}-${index}`} type={type} showIcon message={title} description={item} className="module-alert" />
      ))}
    </Space>
  );
}
