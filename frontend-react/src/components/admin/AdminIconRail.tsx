import { Tooltip } from "antd";
import { MenuFoldOutlined, MenuUnfoldOutlined } from "@ant-design/icons";

import type { AdminModuleNavigation } from "@/types/navigation";

type AdminIconRailProps = {
  activeKey: string;
  expanded: boolean;
  modules: AdminModuleNavigation[];
  panelOpen: boolean;
  onOpenModule: (moduleKey: string) => void;
  onToggleExpand: () => void;
  onMouseEnter: () => void;
  onMouseLeave: () => void;
};

export function AdminIconRail({
  activeKey,
  expanded,
  modules,
  panelOpen,
  onOpenModule,
  onToggleExpand,
  onMouseEnter,
  onMouseLeave,
}: AdminIconRailProps) {
  return (
    <aside
      className={`terra-icon-rail${expanded ? " is-expanded" : " is-collapsed"}`}
      aria-label="Navegacao principal"
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      <nav className="terra-icon-rail-nav">
        {modules.map((module) => {
          const active = module.key === activeKey;
          const button = (
            <button
              key={module.key}
              type="button"
              className={`terra-icon-rail-button${active ? " is-active" : ""}`}
              onClick={() => onOpenModule(module.key)}
              onMouseEnter={() => onOpenModule(module.key)}
              aria-label={module.label}
              aria-current={active ? "page" : undefined}
            >
              <span className="terra-icon-rail-icon" aria-hidden="true">
                {module.icon}
              </span>
              {expanded ? <span className="terra-icon-rail-label">{module.label}</span> : <span className="sr-only">{module.label}</span>}
            </button>
          );

          return (
            <Tooltip key={module.key} title={expanded || panelOpen ? null : module.label} placement="right">
              {button}
            </Tooltip>
          );
        })}
      </nav>

      <div className="terra-icon-rail-footer">
        <Tooltip title={expanded ? "Recolher barra" : "Expandir barra"} placement="right">
          <button type="button" className="terra-icon-rail-toggle" onClick={onToggleExpand} aria-label="Recolher ou expandir a barra">
            {expanded ? <MenuFoldOutlined /> : <MenuUnfoldOutlined />}
          </button>
        </Tooltip>
      </div>
    </aside>
  );
}
