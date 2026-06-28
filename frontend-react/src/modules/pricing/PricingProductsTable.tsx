import { Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ProductPricingView } from "@/modules/pricing/types";

type PricingProductsTableProps = {
  products: ProductPricingView[];
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

function renderConfidenceTag(row: ProductPricingView) {
  switch (row.hybridCost.confidenceStatus) {
    case "compativeis":
      return <Tag color="green">{row.hybridCost.confidenceLabel}</Tag>;
    case "divergentes":
      return <Tag color="red">{row.hybridCost.confidenceLabel}</Tag>;
    case "somente-receita":
      return <Tag color="blue">{row.hybridCost.confidenceLabel}</Tag>;
    case "somente-producao":
      return <Tag color="gold">{row.hybridCost.confidenceLabel}</Tag>;
    default:
      return <Tag>{row.hybridCost.confidenceLabel}</Tag>;
  }
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
    title: "Custo teorico",
    key: "theoreticalCost",
    render: (_, row) => formatCurrency(row.hybridCost.theoreticalCost),
  },
  {
    title: "Custo observado",
    key: "observedCost",
    render: (_, row) => formatCurrency(row.hybridCost.observedCost),
  },
  {
    title: "Custo adotado",
    key: "adoptedCost",
    render: (_, row) => formatCurrency(row.hybridCost.adoptedCost),
  },
  {
    title: "Margem",
    key: "margin",
    render: (_, row) => formatPercent(row.actualMarginPercent),
  },
  {
    title: "Confianca",
    key: "status",
    render: (_, row) => renderConfidenceTag(row),
  },
];

export function PricingProductsTable({ products, selectedCode, onSelectProduct }: PricingProductsTableProps) {
  return (
    <Table<ProductPricingView>
      rowKey={(row) => row.product.code}
      columns={columns}
      dataSource={products}
      pagination={{ pageSize: 10, showSizeChanger: false }}
      scroll={{ x: 1260 }}
      rowSelection={{
        type: "radio",
        selectedRowKeys: selectedCode ? [selectedCode] : [],
        onChange: (selectedKeys) => onSelectProduct(String(selectedKeys[0] ?? "")),
      }}
      locale={{
        emptyText: "Nenhum produto combina com o recorte atual. Ajuste a busca ou mude a visao do modulo.",
      }}
      onRow={(record) => ({
        onClick: () => onSelectProduct(record.product.code),
      })}
    />
  );
}
