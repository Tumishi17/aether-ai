import { Bell, Command, Moon, Search, Sun } from "lucide-react";
import { useState } from "react";

import { useTheme } from "@/components/theme-provider";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { Input } from "@/components/ui/input";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Tooltip, TooltipContent, TooltipTrigger } from "@/components/ui/tooltip";

const notifications = [
  { title: "Weekly productivity report ready", time: "12 min ago" },
  { title: "3 action items due today", time: "1 hour ago" },
  { title: "Meeting summary shared with your team", time: "Yesterday" },
];

export function TopBar() {
  const { theme, toggle } = useTheme();
  const [query, setQuery] = useState("");

  return (
    <header className="sticky top-0 z-30 glass-panel border-b border-glass-border">
      <div className="grid grid-cols-[auto_minmax(0,1fr)_auto] items-center gap-3 px-3 py-2.5 sm:px-5">
        <SidebarTrigger aria-label="Toggle navigation" className="shrink-0" />

        <div className="relative min-w-0">
          <Search
            className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground"
            aria-hidden="true"
          />
          <Input
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Search emails, tasks, summaries…"
            aria-label="Search workspace"
            className="h-9 rounded-full border-border/70 bg-background/60 pl-9 pr-16 transition-shadow focus-visible:shadow-glow"
          />
          <kbd className="pointer-events-none absolute right-3 top-1/2 hidden -translate-y-1/2 items-center gap-1 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] text-muted-foreground sm:flex">
            <Command className="h-3 w-3" aria-hidden="true" />K
          </kbd>
        </div>

        <div className="flex shrink-0 items-center gap-1.5">
          <Tooltip>
            <TooltipTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                onClick={toggle}
                aria-label={theme === "dark" ? "Switch to light mode" : "Switch to dark mode"}
                className="rounded-full transition-transform hover:scale-105"
              >
                {theme === "dark" ? (
                  <Sun className="h-4 w-4" aria-hidden="true" />
                ) : (
                  <Moon className="h-4 w-4" aria-hidden="true" />
                )}
              </Button>
            </TooltipTrigger>
            <TooltipContent>Toggle theme</TooltipContent>
          </Tooltip>

          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="ghost"
                size="icon-sm"
                aria-label="Notifications"
                className="relative rounded-full transition-transform hover:scale-105"
              >
                <Bell className="h-4 w-4" aria-hidden="true" />
                <span className="absolute right-1 top-1 h-2 w-2 rounded-full bg-destructive" />
              </Button>
            </PopoverTrigger>
            <PopoverContent align="end" className="w-72 p-0">
              <div className="flex items-center justify-between border-b px-3 py-2.5">
                <p className="text-sm font-semibold">Notifications</p>
                <Badge variant="secondary">{notifications.length} new</Badge>
              </div>
              <ul className="divide-y">
                {notifications.map((item) => (
                  <li key={item.title} className="px-3 py-2.5 transition-colors hover:bg-accent/60">
                    <p className="text-sm">{item.title}</p>
                    <p className="text-xs text-muted-foreground">{item.time}</p>
                  </li>
                ))}
              </ul>
            </PopoverContent>
          </Popover>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button
                className="flex items-center gap-2 rounded-full border border-border/70 bg-background/60 py-1 pl-1 pr-2.5 transition-colors hover:bg-accent/60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                aria-label="Open profile menu"
              >
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="gradient-surface-brand text-[11px] font-semibold text-primary-foreground">
                    AK
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-left text-xs leading-tight sm:block">
                  <span className="block font-semibold">Amara Khan</span>
                  <span className="block text-muted-foreground">Operations Lead</span>
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-52">
              <DropdownMenuLabel>Amara Khan</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem>Profile settings</DropdownMenuItem>
              <DropdownMenuItem>Workspace preferences</DropdownMenuItem>
              <DropdownMenuItem>Usage & billing</DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </div>
    </header>
  );
}