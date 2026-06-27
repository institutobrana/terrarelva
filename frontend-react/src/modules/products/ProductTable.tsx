import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { Product } from "@/types/legacy";

type ProductTableProps = {
  products: Product[];
  search: string;
  onSearchChange: (value: string) => void;
};

const columns: ColumnsType<Product> = [
  {
    title: "Nome",
    dataIndex: "name",
    key: "name",
    render: (_, product) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{product.name}</Typography.Text>
        <Typography.Text type="secondary">{product.presentation || "Sem apresentacao"}</Typography.Text>
      </Space>
    ),
  },
  {
    title: "Categoria",
    dataIndex: "category",
    key: "category",
    render: (value: string) => value || "Sem categoria",
  },
  {
    title: "Preco",
    dataIndex: "price",
    key: "price",
    render: (value: number) =>
      new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value),
  },
  {
    title: "Estoque",
    dataIndex: "stock",
    key: "stock",
    render: (_value: number, product) => (
      <Space direction="vertical" size={0}>
        <Typography.Text>{product.stock}</Typography.Text>
        <Typography.Text type="secondary">Minimo {product.minimumStock}</Typography.Text>
      </Space>
    ),
  },
  {
    title: "Unidade",
    dataIndex: "weight",
    key: "weight",
    render: (value: number) => (value ? `${value} g` : "Nao informada"),
  },
  {
    title: "Status",
    dataIndex: "active",
    key: "active",
    render: (value?: string) => {
      if (!value) {
        return <Tag>Sem status</Tag>;
      }

      return value.toLowerCase() === "sim" ? <Tag color="green">Ativo</Tag> : <Tag color="default">{value}</Tag>;
    },
  },
];

export function ProductTable({ products, search, onSearchChange }: ProductTableProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Buscar por nome, categoria, codigo ou receita"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Table<Product>
        rowKey="code"
        columns={columns}
        dataSource={products}
        pagination={{ pageSize: 12, showSizeChanger: false }}
        scroll={{ x: 960 }}
      />
    </Space>
  );
}
