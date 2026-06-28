import { useMemo, useRef, useState } from "react";
import type { CSSProperties, ReactNode } from "react";
import { Outlet, useLocation, useNavigate } from "react-router-dom";

import { AdminActionTopbar } from "@/components/admin/AdminActionTopbar";
import { AdminShellBandContext } from "@/components/admin/AdminShellBandContext";
import { AdminContextPanel } from "@/components/admin/AdminContextPanel";
import { AdminIconRail } from "@/components/admin/AdminIconRail";
import { AdminWorkspace } from "@/components/admin/AdminWorkspace";
import { useAuth } from "@/app/hooks/useAuth";
import type { AdminModuleNavigation } from "@/types/navigation";
import { getAdminModuleFromPath } from "@/utils/navigation";

type AdminLayoutProps = {
  modules: AdminModuleNavigation[];
};

export function AdminLayout({ modules }: AdminLayoutProps) {
  const { logout, user } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const panelCloseTimerRef = useRef<number | null>(null);
  const [railExpanded, setRailExpanded] = useState(false);

  const principalModules = useMemo(() => modules.filter((module) => module.section === "principal"), [modules]);
  const currentModule = getAdminModuleFromPath(location.pathname, modules);
  const [panelModuleKey, setPanelModuleKey] = useState("");
  const [shellBandContent, setShellBandContent] = useState<ReactNode | null>(null);

  const panelModule = principalModules.find((module) => module.key === panelModuleKey) ?? null;
  const shouldRenderShellBand = currentModule?.key === "hoje" || Boolean(shellBandContent);

  const handleOpenModule = (moduleKey: string) => {
    if (panelCloseTimerRef.current) {
      window.clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }

    const module = principalModules.find((entry) => entry.key === moduleKey);
    if (!module) {
      return;
    }

    setPanelModuleKey(moduleKey);
  };

  const handleContextRegionEnter = () => {
    if (panelCloseTimerRef.current) {
      window.clearTimeout(panelCloseTimerRef.current);
      panelCloseTimerRef.current = null;
    }
  };

  const handleContextRegionLeave = () => {
    if (panelCloseTimerRef.current) {
      window.clearTimeout(panelCloseTimerRef.current);
    }

    panelCloseTimerRef.current = window.setTimeout(() => {
      setPanelModuleKey("");
      panelCloseTimerRef.current = null;
    }, 140);
  };

  const shellStyle = {
    "--terra-rail-width": railExpanded ? "184px" : "72px",
    "--terra-panel-width": panelModule ? "272px" : "0px",
  } as CSSProperties;

  return (
    <div className="terra-shell" style={shellStyle}>
      <div className="terra-shell-topbar">
        <AdminActionTopbar
          userLabel={user?.name ?? user?.email ?? "Sessao administrativa ativa"}
          onToolbarAction={(path) => navigate(path)}
          onLogout={() => {
            logout();
            navigate("/auth/login", { replace: true });
          }}
        />
      </div>

      <div className={`terra-shell-body${panelModule ? " has-panel" : ""}`}>
        {shouldRenderShellBand ? <div className="terra-shell-corner" aria-hidden="true" /> : null}
        {shouldRenderShellBand ? (
          <div className={`terra-shell-band${shellBandContent ? " has-content" : ""}`}>{shellBandContent}</div>
        ) : null}

        <AdminIconRail
          activeKey={currentModule?.key ?? "hoje"}
          expanded={railExpanded}
          modules={principalModules}
          panelOpen={Boolean(panelModule)}
          onOpenModule={handleOpenModule}
          onToggleExpand={() => setRailExpanded((current) => !current)}
          onMouseEnter={handleContextRegionEnter}
          onMouseLeave={handleContextRegionLeave}
        />

        <AdminContextPanel
          module={panelModule}
          onClose={() => setPanelModuleKey("")}
          onSelectItem={(path) => navigate(path)}
          onMouseEnter={handleContextRegionEnter}
          onMouseLeave={handleContextRegionLeave}
        />

        <AdminShellBandContext.Provider value={{ setShellBandContent }}>
          <AdminWorkspace>
            <div className="terra-content">
              <div className="page-frame">
                <Outlet />
              </div>
            </div>
          </AdminWorkspace>
        </AdminShellBandContext.Provider>
      </div>
    </div>
  );
}
