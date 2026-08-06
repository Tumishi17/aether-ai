import { Link, useRouterState } from "@tanstack/react-router";
import {
  BarChart3,
  BotMessageSquare,
  CalendarCheck,
  ListTodo,
  Mail,
  ScrollText,
  ShieldCheck,
} from "lucide-react";

import logo from "@/assets/aura-logo.png";
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

const workspace = [
  { title: "Dashboard", url: "/", icon: BarChart3 },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Summarizer", url: "/meetings", icon: CalendarCheck },
  { title: "Task Planner", url: "/planner", icon: ListTodo },
  { title: "Research Assistant", url: "/research", icon: ScrollText },
  { title: "Workplace Chatbot", url: "/assistant", icon: BotMessageSquare },
] as const;

const governance = [{ title: "Responsible AI", url: "/responsible-ai", icon: ShieldCheck }] as const;

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const pathname = useRouterState({ select: (router) => router.location.pathname });

  const renderItems = (items: readonly { title: string; url: string; icon: typeof Mail }[]) =>
    items.map((item) => (
      <SidebarMenuItem key={item.url}>
        <SidebarMenuButton
          asChild
          isActive={pathname === item.url}
          tooltip={item.title}
          className="transition-all duration-200"
        >
          <Link to={item.url} className="flex items-center gap-2.5">
            <item.icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="truncate">{item.title}</span>
          </Link>
        </SidebarMenuButton>
      </SidebarMenuItem>
    ));

  return (
    <Sidebar collapsible="icon" className="border-r border-sidebar-border">
      <SidebarHeader>
        <Link to="/" className="flex items-center gap-2.5 px-1.5 py-2">
          <img
            src={logo}
            alt="Aura Assist logo"
            width={512}
            height={512}
            className="h-8 w-8 shrink-0 rounded-lg"
          />
          {!collapsed && (
            <span className="min-w-0">
              <span className="block truncate font-display text-sm font-bold">Aura Assist</span>
              <span className="block truncate text-[11px] text-muted-foreground">
                Workplace AI Suite
              </span>
            </span>
          )}
        </Link>
      </SidebarHeader>

      <SidebarContent>
        <SidebarGroup>
          <SidebarGroupLabel>Workspace</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(workspace)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
        <SidebarGroup>
          <SidebarGroupLabel>Governance</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>{renderItems(governance)}</SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>

      <SidebarFooter>
        {!collapsed && (
          <p className="rounded-lg bg-sidebar-accent/60 px-3 py-2 text-[11px] leading-snug text-sidebar-accent-foreground">
            AI-generated content may require human review.
          </p>
        )}
      </SidebarFooter>
    </Sidebar>
  );
}