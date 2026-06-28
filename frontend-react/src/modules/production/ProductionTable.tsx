import { SearchOutlined } from "@ant-design/icons";
import { Input, Space, Table, Tag, Typography } from "antd";
import type { ColumnsType } from "antd/es/table";

import type { ProductionBatchView } from "@/modules/production/types";

type ProductionTableProps = {
  batches: ProductionBatchView[];
  search: string;
  onSearchChange: (value: string) => void;
  selectedId: string | null;
  onSelectBatch: (id: string) => void;
};

function formatCurrency(value: number | null) {
  if (value === null) {
    return "Nao calculavel";
  }

  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

const columns: ColumnsType<ProductionBatchView> = [
  {
    title: "Producao",
    key: "production",
    render: (_, row) => (
      <Space direction="vertical" size={0}>
        <Typography.Text strong>{row.record.ingredient}</Typography.Text>
        <Typography.Text type="secondary">{row.record.date}</Typography.Text>
      </Space>
    ),
  },
  {
    title: "Produtos ligados",
    key: "products",
    render: (_, row) =>
      row.recipeUsage.linkedProducts.length
        ? row.recipeUsage.linkedProducts.map((product) => product.name).join(", ")
        : "Nenhum produto ligado",
  },
  {
    title: "Peso final",
    key: "finalWeight",
    render: (_, row) => `${row.record.finalWeight} g`,
  },
  {
    title: "Rendimento",
    key: "yield",
    render: (_, row) =>
      row.breakdown.yieldPercent !== null ? `${row.breakdown.yieldPercent.toFixed(1)}%` : "Nao calculavel",
  },
  {
    title: "Custo estimado",
    key: "cost",
    render: (_, row) => formatCurrency(row.breakdown.estimatedTotalCost ?? row.breakdown.sourcePaidValue),
  },
  {
    title: "Lote",
    key: "batch",
    render: (_, row) => (row.stockEntries.length ? row.stockEntries[0].reason : "Sem lote explicito"),
  },
  {
    title: "Validade",
    key: "expiry",
    render: () => "Nao encontrada no legado",
  },
  {
    title: "Status",
    key: "status",
    render: (_, row) => {
      if (row.status === "completo") return <Tag color="green">{row.statusLabel}</Tag>;
      if (row.status === "incompleto") return <Tag color="gold">{row.statusLabel}</Tag>;
      return <Tag>{row.statusLabel}</Tag>;
    },
  },
];

export function ProductionTable({
  batches,
  search,
  onSearchChange,
  selectedId,
  onSelectBatch,
}: ProductionTableProps) {
  return (
    <Space direction="vertical" size={16} style={{ width: "100%" }}>
      <Input
        allowClear
        prefix={<SearchOutlined />}
        placeholder="Buscar por materia-prima, produto ligado, lote, status ou observacao"
        value={search}
        onChange={(event) => onSearchChange(event.target.value)}
      />
      <Table<ProductionBatchView>
        rowKey={(row) => row.record.id}
        columns={columns}
        dataSource={batches}
        pagination={{ pageSize: 10, showSizeChanger: false }}
        scroll={{ x: 1120 }}
        rowSelection={{
          type: "radio",
          selectedRowKeys: selectedId ? [selectedId] : [],
          onChange: (selectedKeys) => onSelectBatch(String(selectedKeys[0] ?? "")),
        }}
        onRow={(record) => ({
          onClick: () => onSelectBatch(record.record.id),
        })}
      />
    </Space>
  );
}
