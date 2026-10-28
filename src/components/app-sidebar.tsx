import { Link, useRouterState } from "@tanstack/react-router";
import { LayoutDashboard } from "lucide-react";

import logo from "@/assets/logo.png";
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { TOOLS } from "@/lib/tools";

export function AppSidebar() {
  const { state, isMobile, setOpenMobile } = useSidebar();
  const collapsed = state === "collapsed" && !isMobile;
  const path = useRouterState({ select: (r) => r.location.pathname });
  const close = () => isMobile && setOpenMobile(false);

  return (
    <Sidebar collapsible="icon">
      <SidebarHeader>
        <Link to="/" onClick={close} className="flex items-center gap-2.5 px-1 py-2">
          <img src={logo} alt="" width={32} height={32} className="size-8 shrink-0 rounded-md bg-sidebar-foreground p-0.5" />
          {!collapsed && (
            <div className="leading-tight">
              <div className="font-display text-sm font-semibold text-sidebar-accent-foreground">Workplace AI</div>
              <div className="text-xs text-sidebar-foreground/60">Productivity Assistant</div>
            </div>
          )}
        </Link>
      </SidebarHeader>
      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem>
                <SidebarMenuButton asChild isActive={path === "/"} tooltip="Dashboard">
                  <Link to="/" onClick={close}>
                    <LayoutDashboard />
                    <span>Dashboard</span>
                  </Link>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel className="text-sidebar-foreground/50">AI Tools</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              {TOOLS.map((t) => (
                <SidebarMenuItem key={t.url}>
                  <SidebarMenuButton asChild isActive={path.startsWith(t.url)} tooltip={t.title}>
                    <Link to={t.url} onClick={close}>
                      <t.icon />
                      <span>{t.title}</span>
                    </Link>
                  </SidebarMenuButton>
                </SidebarMenuItem>
              ))}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      {!collapsed && (
        <SidebarFooter>
          <p className="rounded-lg bg-sidebar-accent p-3 text-xs leading-relaxed text-sidebar-foreground/80">
            AI can make mistakes. Review all outputs before using them.
          </p>
        </SidebarFooter>
      )}
    </Sidebar>
  );
}
