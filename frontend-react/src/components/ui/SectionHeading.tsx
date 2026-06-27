import { Space, Typography } from "antd";
import type { ReactNode } from "react";

type SectionHeadingProps = {
  title: string;
  description: string;
  extra?: ReactNode;
};

export function SectionHeading({ title, description, extra }: SectionHeadingProps) {
  return (
    <Space direction="vertical" size={4} style={{ width: "100%" }}>
      <Typography.Title level={4} style={{ margin: 0 }}>
        {title}
      </Typography.Title>
      <Typography.Text type="secondary">{description}</Typography.Text>
      {extra}
    </Space>
  );
}
