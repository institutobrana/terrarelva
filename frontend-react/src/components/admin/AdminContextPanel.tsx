import { Button, Typography } from "antd";
import { CloseOutlined } from "@ant-design/icons";

import type { AdminModuleNavigation } from "@/types/navigation";

type AdminContextPanelProps = {
  module: AdminModuleNavigation | null;
  onClose: () => void;
  onSelectItem: (path: string) => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function AdminContextPanel({
  module,
  onClose,
  onSelectItem,
  onMouseEnter,
  onMouseLeave,
}: AdminContextPanelProps) {
  if (!module) {
    return null;
  }

  const items = module.topbarItems?.length
    ? module.topbarItems
    : [{ key: module.key, label: `Abrir ${module.label}`, path: module.path, accent: "primary" as const }];

  return (
    <aside
      className="terra-context-panel"
      aria-label={`Menu ${module.label}`}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <div className="terra-context-panel-header">
        <div className="terra-context-panel-header-copy">
          <Typography.Text className="terra-context-panel-kicker">{module.panelKicker ?? "Modulo"}</Typography.Text>
          <Typography.Title level={4} className="terra-context-panel-title">
            {module.panelTitle ?? module.label}
          </Typography.Title>
          <Typography.Text className="terra-context-panel-description">{module.description}</Typography.Text>
        </div>
        <Button type="text" size="small" icon={<CloseOutlined />} onClick={onClose} className="terra-context-panel-close" />
      </div>

      <div className="terra-context-panel-list">
        {items.map((item) => (
          <button key={item.key} type="button" className="terra-context-panel-item" onClick={() => onSelectItem(item.path)}>
            <span className="terra-context-panel-item-label">{item.label}</span>
          </button>
        ))}
      </div>
    </aside>
  );
}
