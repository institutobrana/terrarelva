import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ProductPricingView } from "@/modules/pricing/types";

type PricingProductsTableProps = {
  products: ProductPricingView[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedCode: string | null;
  onSelectProduct: (code: string) => void;
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

function formatPercent(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return `${(value * 100).toFixed(1)}%`;
}

const columns: ColumnsType<ProductPricingView> = [
  {
    title: "Produto",
    key: "product",
    render: (_, row) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{row.product.name}</Typography.Text>
        <Typography.Text type="secondary">
          {row.product.presentation || "Sem apresentacao"} · {row.product.code}
        </Typography.Text>
      </Space>
    ),
  },
  {
    title: "Categoria",
    key: "category",
    render: (_, row) => row.product.category || "Sem categoria",
  },
  {
    title: "Preco atual",
    key: "currentPrice",
    render: (_, row) => formatCurrency(row.currentPrice),
  },
  {
    title: "Receita",
    key: "recipe",
    render: (_, row) =>
      row.recipe ? <Tag color="green">{row.product.recipe || row.recipe.productName}</Tag> : <Tag>Sem receita</Tag>,
  },
  {
    title: "Custo estimado",
    key: "cost",
    render: (_, row) => formatCurrency(row.breakdown.totalCost),
  },
  {
    title: "Margem estimada",
    key: "margin",
    render: (_, row) => formatPercent(row.actualMarginPercent),
  },
  {
    title: "Status",
    key: "status",
    render: (_, row) => {
      if (row.status === "completo") {
        return <Tag color="green">{row.statusLabel}</Tag>;
      }

      if (row.status === "incompleto") {
        return <Tag color="gold">{row.statusLabel}</Tag>;
      }

      return <Tag color="default">{row.statusLabel}</Tag>;
    },
  },
];

export function PricingProductsTable({
  products,
  search,
  onSearchChange,
  selectedCode,
  onSelectProduct,
}: PricingProductsTableProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Buscar por produto, categoria, codigo, receita ou status"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Table<ProductPricingView>
        rowKey={(row) => row.product.code}
        columns={columns}
        dataSource={products}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1080 }}
        rowSelection={{
          type: "radio",
          selectedRowKeys: selectedCode ? [selectedCode] : [],
          onChange: (selectedKeys) => onSelectProduct(String(selectedKeys[0] ?? "")),
        }}
        onRow={(record) => ({
          onClick: () => onSelectProduct(record.product.code),
        })}
      />
    </Space>
  );
}
